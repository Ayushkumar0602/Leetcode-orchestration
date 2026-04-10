import argparse
import json
import sys


def _safe_str(value):
    if value is None:
        return ""
    return str(value).strip()


def _safe_num(value):
    if value is None:
        return None
    try:
        if isinstance(value, bool):
            return None
        if isinstance(value, (int, float)):
            return value
        text = str(value).strip().replace(",", "")
        if text == "" or text.lower() == "none":
            return None
        return float(text) if "." in text else int(text)
    except Exception:
        return None


def _safe_iso_datetime(value):
    if value is None:
        return ""
    try:
        # pandas.Timestamp / datetime-like objects
        if hasattr(value, "isoformat"):
            return value.isoformat()
        text = str(value).strip()
        if not text or text.lower() == "none":
            return ""
        return text
    except Exception:
        return ""


def main():
    parser = argparse.ArgumentParser(description="Scrape jobs with python-jobspy")
    parser.add_argument("--role", required=True, help="Search role/query")
    parser.add_argument("--location", default="India", help="Search location")
    parser.add_argument("--results", type=int, default=20, help="Number of jobs to fetch")
    parser.add_argument("--hours", type=int, default=72, help="Hours old filter")
    args = parser.parse_args()

    try:
        from jobspy import scrape_jobs
    except Exception as exc:
        print(json.dumps({
            "error": f"python-jobspy import failed: {exc}. Install with: pip install -U python-jobspy"
        }))
        return 1

    results = max(1, min(int(args.results), 100))
    hours_old = max(1, min(int(args.hours), 720))

    google_query = f"{args.role} jobs near {args.location} since yesterday"

    try:
        jobs_df = scrape_jobs(
            site_name=["indeed", "linkedin", "zip_recruiter", "google", "glassdoor"],
            search_term=args.role,
            google_search_term=google_query,
            location=args.location,
            results_wanted=results,
            hours_old=hours_old,
            country_indeed="USA",
        )
    except Exception as exc:
        print(json.dumps({"error": f"jobspy scrape failed: {exc}"}))
        return 1

    jobs = []
    records = jobs_df.to_dict(orient="records") if jobs_df is not None else []
    for idx, row in enumerate(records):
        title = _safe_str(row.get("title")) or _safe_str(row.get("job_title"))
        company = _safe_str(row.get("company")) or _safe_str(row.get("company_name"))
        location = _safe_str(row.get("location"))
        description = _safe_str(row.get("description")) or _safe_str(row.get("job_description"))
        date_posted = _safe_str(row.get("date_posted"))
        date_posted_iso = _safe_iso_datetime(row.get("date_posted"))
        site = _safe_str(row.get("site"))
        city = _safe_str(row.get("city"))
        state = _safe_str(row.get("state"))
        job_type = _safe_str(row.get("job_type"))
        interval = _safe_str(row.get("interval"))
        min_amount = _safe_num(row.get("min_amount"))
        max_amount = _safe_num(row.get("max_amount"))

        apply_links = []
        for key in ("job_url_direct", "job_url", "url"):
            val = _safe_str(row.get(key))
            if val and val.startswith("http"):
                apply_links.append(val)
        # Deduplicate while preserving order.
        dedup_links = list(dict.fromkeys(apply_links))

        jobs.append({
            "id": _safe_str(row.get("id")) or _safe_str(row.get("job_id")) or f"job-{idx}",
            "title": title or "Untitled role",
            "company": company or "Unknown company",
            "location": location or args.location,
            "city": city,
            "state": state,
            "job_type": job_type,
            "interval": interval,
            "min_amount": min_amount,
            "max_amount": max_amount,
            "description": description,
            "time_posted": date_posted,
            "posted_at_iso": date_posted_iso,
            "source": site,
            "apply_links": dedup_links,
        })

    print(json.dumps({"jobs": jobs}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
