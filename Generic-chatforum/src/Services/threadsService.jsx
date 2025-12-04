// src/services/threadsService.js

// Firestore funktioner.
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
  } from "firebase/firestore";
  
  // Importérer databasen fra firebaseConfig.
  import { db } from "../firebaseConfig";
  
   // Henter ALLE threads (forside).
   // Sorteres efter seneste opslag (igennem lastReplyAt).
  export async function getAllThreads() {
    // Definer et query mod "threads"-samlingen.
    const q = query(
      collection(db, "threads"),
      orderBy("lastReplyAt", "desc")
    );
  
    // Henter al data fra Firestore.
    const snapshot = await getDocs(q);
  
    // Returnér en liste med objekter + ID.
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  
  // Henter threads opsloget af én specifik bruger.
  export async function getThreadsByUser(userId) {
    const q = query(
      collection(db, "threads"),
      where("authorId", "==", userId),
      orderBy("createdAt", "desc")
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  
  // Opretter en ny thread med titel, tekst, bruger-id.
  export async function createThread({ title, content, authorId }) {
    const docRef = await addDoc(collection(db, "threads"), {
      title,
      content,
      authorId,
  
      // Firestore server-tid → ens på tværs af devices.
      // sørger for Timestamps er korrekte.
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastReplyAt: serverTimestamp(),
  
      // Brugbar til moderering (senere).
      isLocked: false,
    });
  
    return docRef.id; //Returnerer ID på det nye opslag.
  }