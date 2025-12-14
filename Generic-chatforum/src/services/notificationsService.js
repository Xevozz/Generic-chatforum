// src/services/notificationsService.js
import { db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  limit,
} from "firebase/firestore";

export async function createNotification({ toUserId, fromUserName, type, postId, groupId }) {
  if (!toUserId) return;

  await addDoc(collection(db, "notifications"), {
    toUserId,
    fromUserName: fromUserName || "Ukendt bruger",
    type: type || "unknown",
    postId: postId || null,
    groupId: groupId || null,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export function listenToNotifications(toUserId, callback, opts = {}) {
  if (!toUserId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "notifications"),
    where("toUserId", "==", toUserId),
    orderBy("createdAt", "desc"),
    limit(opts.limit ?? 25)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) return;
  await updateDoc(doc(db, "notifications", notificationId), { isRead: true });
}

export async function markAllNotificationsRead(toUserId) {
  if (!toUserId) return;

  const q = query(
    collection(db, "notifications"),
    where("toUserId", "==", toUserId),
    where("isRead", "==", false)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}