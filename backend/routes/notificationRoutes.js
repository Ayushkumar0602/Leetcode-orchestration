const express = require("express");
const crypto = require("crypto");
const { admin } = require("../firebaseAdmin");

const router = express.Router();

async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const idToken = authHeader.split("Bearer ")[1];

  if (!admin.apps.length) {
    return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

router.post("/register-token", verifyUser, async (req, res) => {
  const uid = req.user?.uid;
  const { token, platform } = req.body || {};
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  if (!token || typeof token !== "string") return res.status(400).json({ error: "token required" });

  try {
    const tokenId = crypto.createHash("sha256").update(token).digest("hex").slice(0, 40);
    await admin
      .firestore()
      .collection("userProfiles")
      .doc(uid)
      .collection("fcmTokens")
      .doc(tokenId)
      .set(
        {
          token,
          platform: platform || "web",
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
        { merge: true }
      );

    await admin.firestore().collection("global_fcm_tokens").doc(tokenId).set({
        token,
        uid,
        platform: platform || "web",
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
    }, { merge: true });

    res.json({ success: true });
  } catch (e) {
    console.error("[notifications] register-token failed", e);
    res.status(500).json({ error: "Failed to register token" });
  }
});

module.exports = router;

