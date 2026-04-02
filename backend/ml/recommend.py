#!/usr/bin/env python3
"""
Whizan AI — Problem Recommendation ML Microservice
====================================================
Flask-based microservice that generates personalized LeetCode problem
recommendations using a hybrid of Content-Based Filtering (TF-IDF) and
Collaborative Filtering (TruncatedSVD), blended with a difficulty-gap heuristic.

Endpoints:
  POST /ml/recommend       — run for a specific user (body: {"uid": "..."})
  POST /ml/recommend-all   — run for all users in Firestore
  GET  /ml/health          — health check
"""

import os, json, logging, sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

import firebase_admin
from firebase_admin import credentials, firestore

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [ML] %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ─── Firebase Admin Init ─────────────────────────────────────────────────────

def init_firebase():
    """Initialize Firebase Admin SDK from service account or env vars."""
    if firebase_admin._apps:
        return firestore.client()

    # Prefer GOOGLE_APPLICATION_CREDENTIALS env var (Render / local)
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and Path(cred_path).exists():
        cred = credentials.Certificate(cred_path)
    else:
        # Fallback: load from JSON env var (set as FIREBASE_SERVICE_ACCOUNT_KEY in Render/.env)
        sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
        else:
            raise RuntimeError(
                "No Firebase credentials found. Set GOOGLE_APPLICATION_CREDENTIALS "
                "or FIREBASE_SERVICE_ACCOUNT env var."
            )

    firebase_admin.initialize_app(cred)
    return firestore.client()

db = init_firebase()

# ─── Dataset Loader ──────────────────────────────────────────────────────────

DATASET_PATH = Path(__file__).parent.parent / "data" / "leetcode.json"
_problems_cache = None

def load_problems() -> pd.DataFrame:
    """Load the LeetCode problems dataset into a DataFrame (cached)."""
    global _problems_cache
    if _problems_cache is not None:
        return _problems_cache

    if not DATASET_PATH.exists():
        logger.warning(f"Dataset not found at {DATASET_PATH}. Using empty DataFrame.")
        _problems_cache = pd.DataFrame()
        return _problems_cache

    logger.info(f"Loading problems dataset from {DATASET_PATH}...")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    df = pd.DataFrame(data)

    # Normalize column names & types
    df["id"] = df["id"].astype(str)
    df["difficulty"] = df.get("difficulty", pd.Series(dtype=str)).fillna("Medium")
    df["related_topics"] = df.get("related_topics", pd.Series(dtype=str)).fillna("")
    df["title"] = df.get("title", pd.Series(dtype=str)).fillna("")
    df["companies"] = df.get("companies", pd.Series(dtype=str)).fillna("")

    # Feature text: combine topics + difficulty + title for TF-IDF
    df["feature_text"] = (
        df["related_topics"].str.replace(",", " ")
        + " " + df["difficulty"].str.lower()
        + " " + df["title"].str.lower()
    )

    _problems_cache = df
    logger.info(f"Loaded {len(df)} problems.")
    return df

# ─── Firestore Data Fetcher ──────────────────────────────────────────────────

def fetch_user_data(uid: str) -> dict:
    """
    Fetch all data needed for recommendations for a given user.
    Returns a dict with keys: interviews, profile
    """
    logger.info(f"Fetching data for user {uid}...")

    # 1. Fetch all interviews for this user
    interviews_ref = db.collection("interviews")
    interviews_docs = interviews_ref.where("userId", "==", str(uid)).stream()

    interviews = []
    for doc in interviews_docs:
        d = doc.to_dict()
        interviews.append({
            "problemId": str(d.get("problemId", "")),
            "problemTitle": d.get("problemTitle", ""),
            "difficulty": d.get("problemDifficulty", "Medium"),
            "overallScore": float(d.get("overallScore") or 0.0),
            "submissionCount": int(d.get("submissionCount") or 0),
            "topics": d.get("problemData", {}).get("related_topics", "") if d.get("problemData") else "",
            "createdAt": d.get("createdAt", ""),
        })

    # 2. Fetch user profile
    profile_doc = db.collection("userProfiles").document(uid).get()
    profile = profile_doc.to_dict() if profile_doc.exists else {}

    solved_problems = set(str(p) for p in (profile.get("solvedProblems") or []))
    avg_score = float(profile.get("averageScore") or 0.0)

    # Derive average score from interviews if not set in profile
    if avg_score == 0.0 and interviews:
        scores = [iv["overallScore"] for iv in interviews if iv["overallScore"] > 0]
        avg_score = sum(scores) / len(scores) if scores else 0.0

    # Also consider recently attempted problems (last 7 days) as "exclude"
    recent_problem_ids = set()
    now_ts = datetime.now(timezone.utc)
    for iv in interviews:
        if iv.get("createdAt"):
            try:
                created = datetime.fromisoformat(iv["createdAt"].replace("Z", "+00:00"))
                delta = (now_ts - created).days
                if delta <= 7:
                    recent_problem_ids.add(iv["problemId"])
            except Exception:
                pass

    return {
        "interviews": interviews,
        "solved_problems": solved_problems,
        "recent_problem_ids": recent_problem_ids,
        "avg_score": avg_score,
        "uid": uid,
    }

# ─── ML Pipeline ─────────────────────────────────────────────────────────────

DIFFICULTY_MAP = {"Easy": 0, "Medium": 1, "Hard": 2}
DIFFICULTY_LABELS = {0: "Easy", 1: "Medium", 2: "Hard"}

def get_target_difficulty(avg_score: float) -> int:
    """Map average score to a target difficulty index."""
    if avg_score < 40:
        return 0  # Easy
    elif avg_score < 70:
        return 1  # Medium
    else:
        return 2  # Hard


def build_recommendations(uid: str, user_data: dict, problems_df: pd.DataFrame) -> list:
    """
    Run the full ML pipeline and return a list of top recommendation dicts.
    """
    if problems_df.empty:
        logger.warning("Problems dataset is empty — cannot generate recommendations.")
        return []

    interviews = user_data["interviews"]
    solved_ids = user_data["solved_problems"]
    recent_ids = user_data["recent_problem_ids"]
    avg_score = user_data["avg_score"]

    exclude_ids = solved_ids | recent_ids

    # ── Candidate Pool ────────────────────────────────────────────────────────
    candidates = problems_df[~problems_df["id"].isin(exclude_ids)].copy().reset_index(drop=True)

    if candidates.empty:
        logger.info(f"No candidate problems for user {uid} after exclusion.")
        return []

    # ── TF-IDF Content-Based Filtering ──────────────────────────────────────

    if not interviews:
        # Cold start: return top 10 by ascending difficulty matching target
        target_diff = get_target_difficulty(avg_score)
        target_label = DIFFICULTY_LABELS[target_diff]
        filtered = candidates[candidates["difficulty"] == target_label].head(10)
        if filtered.empty:
            filtered = candidates.head(10)
        return _format_results(filtered, scores=None, reason="Recommended for beginners — start here!", avg_score=avg_score)

    # Build user profile text from their interview topics (weighted by score)
    user_profile_parts = []
    for iv in interviews:
        topics = iv.get("topics", "") or ""
        weight = max(1, int(iv["overallScore"] / 10))  # 1–10 repeat weight
        difficulty = iv.get("difficulty", "Medium").lower()
        user_profile_parts.extend([f"{topics} {difficulty}"] * weight)
    user_profile_text = " ".join(user_profile_parts).replace(",", " ")

    # Fit TF-IDF on candidate problems + user profile as last doc
    corpus = list(candidates["feature_text"]) + [user_profile_text]
    vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        logger.warning("TF-IDF failed — falling back to random recommendations.")
        return _format_results(candidates.head(10), scores=None, reason="Personalized picks for you", avg_score=avg_score)

    # Cosine similarity between user profile and each candidate
    candidate_vecs = tfidf_matrix[:-1]       # all candidates
    user_vec = tfidf_matrix[-1]              # user profile vector
    cbf_scores = cosine_similarity(user_vec, candidate_vecs).flatten()

    # ── Collaborative Filtering (SVD) ────────────────────────────────────────

    cf_scores = np.zeros(len(candidates))

    # Build implicit rating from interviews
    attempted_ids = [iv["problemId"] for iv in interviews if iv["problemId"]]
    rated_mask = candidates["id"].isin(attempted_ids)
    rated_candidates = candidates[rated_mask].copy()

    if len(rated_candidates) >= 2:
        # Build a tiny rating matrix: 1 user × N problems
        rating_dict = {
            iv["problemId"]: iv["overallScore"] * np.log1p(iv["submissionCount"])
            for iv in interviews if iv["problemId"]
        }

        all_attempt_ids = list(rating_dict.keys())
        ratings_row = np.array([rating_dict.get(pid, 0) for pid in all_attempt_ids]).reshape(1, -1)

        n_components = min(5, len(all_attempt_ids))
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        try:
            svd.fit(ratings_row)
            # Project candidate problems into SVD space based on topic similarity
            # Use TF-IDF overlap as a proxy for problem similarity to attempted problems
            attempted_texts = [
                problems_df[problems_df["id"] == pid]["feature_text"].values[0]
                if pid in problems_df["id"].values else ""
                for pid in all_attempt_ids
            ]
            all_corpus = attempted_texts + list(candidates["feature_text"])
            v2 = TfidfVectorizer(max_features=300)
            v2_mat = v2.fit_transform(all_corpus)
            attempted_mat = v2_mat[:len(attempted_texts)]
            candidate_mat = v2_mat[len(attempted_texts):]
            sim_to_attempted = cosine_similarity(candidate_mat, attempted_mat)
            # Weighted sum: how similar is each candidate to highly-rated problems
            rating_weights = np.array([rating_dict[pid] for pid in all_attempt_ids])
            rating_weights = rating_weights / (rating_weights.sum() + 1e-9)
            cf_scores = sim_to_attempted @ rating_weights
        except Exception as e:
            logger.warning(f"SVD step failed: {e}. CF scores set to zero.")

    # ── Difficulty Gap Heuristic ─────────────────────────────────────────────

    target_diff_idx = get_target_difficulty(avg_score)
    diff_scores = candidates["difficulty"].map(DIFFICULTY_MAP).fillna(1)
    # Score is highest when difficulty matches target, drops off for others
    difficulty_gap_scores = 1.0 - (np.abs(diff_scores.values - target_diff_idx) / 2.0)

    # ── Hybrid Blend ─────────────────────────────────────────────────────────

    scaler = MinMaxScaler()

    def safe_normalize(arr):
        arr = arr.reshape(-1, 1)
        if arr.max() == arr.min():
            return np.zeros(len(arr))
        return scaler.fit_transform(arr).flatten()

    cbf_norm = safe_normalize(cbf_scores)
    cf_norm = safe_normalize(cf_scores)
    diff_norm = safe_normalize(difficulty_gap_scores)

    final_scores = 0.50 * cbf_norm + 0.30 * cf_norm + 0.20 * diff_norm
    candidates["_score"] = final_scores

    # Sort descending, take top 10
    top_candidates = candidates.nlargest(10, "_score").reset_index(drop=True)

    return _format_results(top_candidates, scores=top_candidates["_score"].values, reason=None, avg_score=avg_score)


def _format_results(df: pd.DataFrame, scores, reason: str | None, avg_score: float) -> list:
    """Format DataFrame rows into recommendation dicts."""
    results = []
    target_diff = get_target_difficulty(avg_score)
    target_label = DIFFICULTY_LABELS[target_diff]

    for i, (_, row) in enumerate(df.iterrows()):
        score = float(scores[i]) if scores is not None else 0.5
        diff = row.get("difficulty", "Medium")

        if reason:
            r = reason
        elif score > 0.7:
            r = f"Highly aligned with your solved {diff} problems"
        elif diff == target_label:
            r = f"Matches your current skill level ({target_label})"
        else:
            r = "Appears in your topic areas — great next challenge"

        results.append({
            "problemId": str(row["id"]),
            "title": row.get("title", ""),
            "difficulty": diff,
            "topics": [t.strip() for t in str(row.get("related_topics", "")).split(",") if t.strip()],
            "companies": [c.strip() for c in str(row.get("companies", "")).split(",") if c.strip()][:5],
            "reason": r,
            "confidenceScore": round(min(max(score, 0.0), 1.0), 3),
            "priority": i + 1,
        })

    return results

# ─── Firestore Writer ────────────────────────────────────────────────────────

def save_recommendations(uid: str, items: list, triggered_by: str = "system"):
    """Write recommendation results to Firestore."""
    doc_ref = db.collection("recommendations").document(uid)
    doc_ref.set({
        "uid": uid,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "generatedBy": triggered_by,
        "modelVersion": "1.0",
        "itemCount": len(items),
        "items": items,
    })
    logger.info(f"Saved {len(items)} recommendations for user {uid}.")


def update_ml_job_status(data: dict):
    """Update Firestore ml_jobs/global document."""
    db.collection("ml_jobs").document("global").set(data, merge=True)

# ─── Core Orchestrator ───────────────────────────────────────────────────────

def run_recommendation_for_user(uid: str, triggered_by: str = "system") -> dict:
    """Full pipeline for a single user. Returns result summary."""
    try:
        problems_df = load_problems()
        user_data = fetch_user_data(uid)
        items = build_recommendations(uid, user_data, problems_df)
        save_recommendations(uid, items, triggered_by)
        return {"success": True, "uid": uid, "count": len(items)}
    except Exception as e:
        logger.error(f"Recommendation failed for user {uid}: {e}", exc_info=True)
        return {"success": False, "uid": uid, "error": str(e)}


def run_for_all_users(triggered_by: str = "cron"):
    """Run recommendations for all users. Checks pause flag between each."""
    logger.info("Starting batch recommendation run for all users...")

    # Fetch all user profile UIDs
    users_snap = db.collection("userProfiles").stream()
    uids = [doc.id for doc in users_snap]
    total = len(uids)
    logger.info(f"Found {total} users to process.")

    update_ml_job_status({
        "status": "running",
        "totalCount": total,
        "processedCount": 0,
        "currentUid": None,
        "lastRunAt": datetime.now(timezone.utc).isoformat(),
        "errorLog": [],
    })

    errors = []
    for i, uid in enumerate(uids):
        # Check pause flag
        job_doc = db.collection("ml_jobs").document("global").get()
        if job_doc.exists and job_doc.to_dict().get("status") == "paused":
            logger.info("ML job paused by admin. Stopping batch.")
            update_ml_job_status({"status": "paused", "currentUid": None, "processedCount": i})
            return

        update_ml_job_status({"currentUid": uid, "processedCount": i})
        result = run_recommendation_for_user(uid, triggered_by=triggered_by)
        if not result["success"]:
            errors.append(f"UID {uid}: {result.get('error', 'unknown')}")

    update_ml_job_status({
        "status": "idle",
        "currentUid": None,
        "processedCount": total,
        "errorLog": errors[-20:],  # keep last 20 errors
    })
    logger.info(f"Batch complete. {total} users processed, {len(errors)} errors.")

# ─── Flask App ───────────────────────────────────────────────────────────────

app = Flask(__name__)


@app.get("/ml/health")
def health():
    return jsonify({"status": "ok", "service": "whizan-ml", "version": "1.0"})


@app.post("/ml/recommend")
def recommend():
    """Trigger recommendation for a single user."""
    body = request.get_json(silent=True) or {}
    uid = body.get("uid", "").strip()
    triggered_by = body.get("triggeredBy", "system")

    if not uid:
        return jsonify({"error": "uid is required"}), 400

    result = run_recommendation_for_user(uid, triggered_by=triggered_by)

    if result["success"]:
        return jsonify({"status": "ok", "uid": uid, "count": result["count"]})
    else:
        return jsonify({"status": "error", "uid": uid, "error": result["error"]}), 500


@app.post("/ml/recommend-all")
def recommend_all():
    """Trigger recommendations for all users (async-friendly; runs synchronously on this worker)."""
    triggered_by = (request.get_json(silent=True) or {}).get("triggeredBy", "admin")

    # Check if already running
    job_doc = db.collection("ml_jobs").document("global").get()
    if job_doc.exists and job_doc.to_dict().get("status") == "running":
        return jsonify({"status": "already_running"}), 409

    # Run in background thread so HTTP response returns immediately
    import threading
    t = threading.Thread(target=run_for_all_users, args=(triggered_by,), daemon=True)
    t.start()

    return jsonify({"status": "started", "message": "Batch recommendation job started."})


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    logger.info(f"Starting Whizan ML microservice on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
