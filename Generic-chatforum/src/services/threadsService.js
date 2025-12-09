// Firestore funktioner.
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Importérer databasen fra firebaseConfig.
import { db } from "../firebaseConfig";

const threadsCol = collection(db, "threads");


// ======================================================
//  Hent ALLE threads (forside) – én gang (ikke live).
//  Sorteres efter seneste aktivitet (lastReplyAt).
// ======================================================
export async function getAllThreads() {
  const q = query(threadsCol, orderBy("lastReplyAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}


// ======================================================
//  (Valgfrit) Live-lytning til ALLE threads
//  Bruges hvis du vil have realtime feed:
//  const unsub = listenToAllThreads(setThreads);
// ======================================================
export function listenToAllThreads(callback) {
  const q = query(threadsCol, orderBy("lastReplyAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const threads = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(threads);
  });
}


// ======================================================
//  Hent threads oprettet af én specifik bruger.
// ======================================================
export async function getThreadsByUser(userId) {
  const q = query(
    threadsCol,
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}


// ======================================================
//  Opret en ny thread med titel, tekst, bruger-id + navn.
//  NU med authorName, så vi kan vise brugernavnet i UI.
// ======================================================
export async function createThread({ title, content, authorId, authorName }) {
  const docRef = await addDoc(threadsCol, {
    title,
    content,
    authorId: authorId || null,
    authorName: authorName || "Ukendt bruger",

    // Firestore server-tid → ens på tværs af devices.
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastReplyAt: serverTimestamp(),

    // Brugbar til moderering (senere).
    isLocked: false,
  });

  return docRef.id; // ID på det nye opslag.
}


// ======================================================
//  SLET en thread (til admin).
//  Husk at tjekke isAdmin i din UI-komponent,
//  så kun admins får lov at trykke på knappen.
// ======================================================
export async function deleteThread(threadId) {
  const threadRef = doc(db, "threads", threadId);
  await deleteDoc(threadRef);
}