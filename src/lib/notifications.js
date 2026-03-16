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

