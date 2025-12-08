// src/services/authService.js

// Håndterer login, logout og oprettelse af brugere via Firebase Auth.

import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { createUserDocument, getUserByUsername } from "./userService";

/**
 * Opretter en ny bruger:
 * - Firebase Auth (email + password)
 * - Sætter displayName på auth-brugeren
 * - Laver et dokument i Firestore /users/{uid}
 */
export async function registerUser({ displayName, email, password, about }) {
  // 1) Opret i Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // 2) Sæt displayName på auth-profilen
  await updateProfile(cred.user, {
    displayName,
  });

  // 3) Lav Firestore-dokument til ekstra profil-data
  await createUserDocument(cred.user.uid, {
    displayName,
    email,
    about: about || "",
  });

  return cred.user;
}

/**
 * Login med enten email ELLER brugernavn
 * - Hvis identifier indeholder '@' → behandles som email
 * - Ellers prøver vi at finde en bruger med displayName = identifier
 */
export async function loginWithEmailOrUsername(identifier, password) {
  let emailToUse = identifier;

  // Hvis der ikke er '@', antager vi at det er et brugernavn
  if (!identifier.includes("@")) {
    const user = await getUserByUsername(identifier);
    if (!user) {
      throw new Error("Bruger med dette brugernavn blev ikke fundet.");
    }
    emailToUse = user.email;
  }

  // Login med email + password
  const cred = await signInWithEmailAndPassword(auth, emailToUse, password);
  return cred.user;
}

/**
 * Lyt til auth-ændringer (login / logout)
 * Callback får: currentUser eller null
 * Returnerer en unsubscribe-funktion.
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Log brugeren ud
 */
export function logout() {
  return signOut(auth);
}