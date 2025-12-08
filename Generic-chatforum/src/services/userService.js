// src/services/userService.js

// Service til at arbejde med bruger-dokumenter i Firestore.
// Her gemmer vi ekstra info om brugeren (displayName, about osv.)

import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

/**
 * Opretter / overskriver et bruger-dokument i "users"-samlingen
 * id = authUser.uid
 */
export async function createUserDocument(uid, data) {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true } // så vi kan kalde den flere gange uden at slette alt
  );

  return userRef;
}

/**
 * Hent brugerprofil ud fra uid
 */
export async function getUserByUid(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Hent brugerprofil ud fra brugernavn (displayName / username)
 */
export async function getUserByUsername(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("displayName", "==", username));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Opdater eksisterende brugerprofil
 */
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}