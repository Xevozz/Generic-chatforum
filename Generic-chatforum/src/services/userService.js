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

// Hent bruger statistikker (posts, kommentarer, aktivitet)
export async function getUserStats(uid) {
  try {
    // Hent alle posts af brugeren
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, where("authorId", "==", uid));
    const postsSnapshot = await getDocs(postsQuery);
    const postCount = postsSnapshot.size;

    // Hent alle kommentarer af brugeren
    const commentsRef = collection(db, "comments");
    const commentsQuery = query(commentsRef, where("userId", "==", uid));
    const commentsSnapshot = await getDocs(commentsQuery);
    const commentCount = commentsSnapshot.size;

    // Hent brugerprofil for createdAt dato
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    const memberSinceDate = userData?.createdAt?.toDate?.() || new Date();
    const daysSinceMember = Math.floor((Date.now() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24));

    // Beregn aktivitetsbadge baseret på posts + kommentarer
    const totalActivity = postCount + commentCount;
    let activityLevel = "Ny bruger";
    if (daysSinceMember < 30 || totalActivity < 5) {
      activityLevel = "Ny bruger";
    } else if (totalActivity < 20) {
      activityLevel = "Aktiv";
    } else if (totalActivity < 50) {
      activityLevel = "Erfaren";
    } else {
      activityLevel = "Ekspert";
    }

    return {
      postCount,
      commentCount,
      totalActivity,
      memberSinceDate,
      daysSinceMember,
      activityLevel,
    };
  } catch (error) {
    console.error("Fejl ved hentning af user stats:", error);
    return {
      postCount: 0,
      commentCount: 0,
      totalActivity: 0,
      memberSinceDate: new Date(),
      daysSinceMember: 0,
      activityLevel: "Ny bruger",
    };
  }
}

// Upload profilbillede som base64 og gem direkte i Firestore
export async function uploadProfilePictureAsBase64(uid, file) {
  if (!file) throw new Error("Ingen fil valgt");

  // Validér filtype
  if (!file.type.startsWith("image/")) {
    throw new Error("Filen skal være et billede");
  }

  // Validér filstørrelse (max 500KB for base64)
  if (file.size > 500 * 1024) {
    throw new Error("Billedet må ikke være større end 500KB");
  }

  // Konvertér fil til base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = reader.result;
        
        // Gem base64 string direkte i Firestore
        await updateUserProfile(uid, { profilePicture: base64String });
        
        resolve(base64String);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Fejl ved læsning af billedefil"));
    };

    reader.readAsDataURL(file);
  });
}