// src/services/userService.js

// Service til at håndtere Bruger-information i DB'en.

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

// Opretter / overskriver en bruger i DB'en
// bruger id = authUser.uid
export async function createUserDocument(uid, data) {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true } // merger Databasen med dataen så den ikke sletter alt
  );

  return userRef;
}


//Henter brugerprofil ud fra user-id

export async function getUserByUid(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}


//Hent brugerprofil ud fra brugernavn (displayName / username)
export async function getUserByUsername(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("displayName", "==", username));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

// Opdatere eksisterende brugerprofil
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}