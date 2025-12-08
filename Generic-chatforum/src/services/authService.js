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

// Opretter en ny bruger:
// Firebase Auth (email + password)
// Sætter displayName på auth-brugeren
// Opretter nu bruger i DB'en /users/{uid}

export async function registerUser({ displayName, email, password, about }) {
  // 1) Opret i Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // 2) displayName på auth-profilen
  await updateProfile(cred.user, {
    displayName,
  });

  //Laver en Firestore-dokument (bruger) til ekstra profil-data
  await createUserDocument(cred.user.uid, {
    displayName,
    email,
    about: about || "",
  });

  return cred.user;
}


// Login med enten email ELLER brugernavn
// Hvis identifier indeholder '@' → behandles som email
// Tjekker for dublikering - prøver at finde en bruger med displayName = identifier
export async function loginWithEmailOrUsername(identifier, password) {
  let emailToUse = identifier;

  // Hvis der ikke er '@', antages at det er et brugernavn
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


// tjekker med auth-ændringer (login / logout)
// Callback får: currentUser eller null
// Returnerer en unsubscribe-funktion. (fjerner info fra angiven bruger)
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

//Logger brugeren ud
export function logout() {
  return signOut(auth);
}