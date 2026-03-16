import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported } from "../firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://leetcode-orchestration.onrender.com";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function registerFcmToken(currentUser) {
  if (!currentUser) return { ok: false, reason: "not_signed_in" };
  if (!VAPID_KEY) return { ok: false, reason: "missing_vapid_key" };

  const messaging = await getMessagingIfSupported();
  if (!messaging) return { ok: false, reason: "messaging_not_supported" };

  // Browser permission prompt
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "permission_denied" };

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (!token) return { ok: false, reason: "no_token" };

  const idToken = await currentUser.getIdToken();
  const res = await fetch(`${API_BASE}/api/notifications/register-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      token,
      platform: "web",
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, reason: data.error || "register_failed" };
  }
  return { ok: true };
}

export async function listenForegroundFcmMessages(onPayload) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, onPayload);
}

