import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../firebase";

export function notificationsCol(uid) {
  return collection(db, "users", uid, "notifications");
}

export function campaignReceiptsCol(uid) {
  return collection(db, "users", uid, "campaignReceipts");
}

export function campaignsCol() {
  return collection(db, "campaigns");
}

export function listenPersonalNotifications(uid, { pageSize = 50 } = {}, cb) {
  const q = query(
    notificationsCol(uid),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), _source: "personal" }));
    cb(items);
  });
}

export function listenActiveCampaigns({ now = Date.now() } = {}, cb) {
  const ts = new Date(now).toISOString();
  const q = query(
    campaignsCol(),
    where("status", "==", "active"),
    where("startAt", "<=", ts),
    orderBy("startAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), _source: "campaign" }));
    cb(items);
  });
}

export function listenCampaignReceipts(uid, cb) {
  const q = query(campaignReceiptsCol(uid), limit(200));
  return onSnapshot(q, (snap) => {
    const map = new Map();
    snap.docs.forEach((d) => map.set(d.id, d.data()));
    cb(map);
  });
}

export async function markPersonalNotificationRead(uid, notificationId) {
  const ref = doc(db, "users", uid, "notifications", notificationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.readAt) return;
  await setDoc(ref, { readAt: new Date().toISOString() }, { merge: true });
}

export async function upsertPersonalNotification(uid, notificationId, patch) {
  const ref = doc(db, "users", uid, "notifications", notificationId);
  const nowIso = new Date().toISOString();
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createConnectRequestNotification(toUid, { fromUid, fromName, message }) {
  const id = `connect_request_${fromUid}`;
  const title = `${fromName || "Someone"} sent you a connect request`;
  const body = message?.trim()
    ? message.trim()
    : "Open Chat to accept or decline the request.";

  await upsertPersonalNotification(toUid, id, {
    type: "connect_request",
    display: "feed",
    title,
    message: body,
    link: "/chat?tab=requests",
    fromUid,
    readAt: null,
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
}

export async function setCampaignReceipt(uid, campaignId, patch) {
  const ref = doc(db, "users", uid, "campaignReceipts", campaignId);
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Listen to ALL campaigns (admin use — no status filter). */
export function listenAllCampaigns(cb) {
  const q = query(
    campaignsCol(),
    orderBy("createdAt", "desc"),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

/** Batch mark all personal notifications as read. */
export async function markAllPersonalRead(uid) {
  const q = query(notificationsCol(uid), where("readAt", "==", null), limit(100));
  const { getDocs } = await import("firebase/firestore");
  const snap = await getDocs(q);
  const now = new Date().toISOString();
  await Promise.all(
    snap.docs.map((d) =>
      setDoc(d.ref, { readAt: now }, { merge: true })
    )
  );
}

/** Relative time string, e.g. "2 hours ago". */
export function getRelativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString();
}

