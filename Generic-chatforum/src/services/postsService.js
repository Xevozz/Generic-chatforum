// src/services/postsService.js
// Funktioner til opslag: opret, likes, kommentarer, lytning m.m.

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Samling for posts
const postsRef = collection(db, "posts");


// ======================================================
// Opret et nyt opslag
// ======================================================
export async function createPost({ content, authorId = null, authorName }) {
  if (!content.trim()) throw new Error("Opslaget må ikke være tomt.");

  const postsRef = collection(db, "posts");

  await addDoc(postsRef, {
    Content: content.trim(),        // du bruger "Content" i dine gamle data
    authorId: authorId || null,
    authorName: authorName || "Ukendt bruger",
    createdAt: serverTimestamp(),
    likeCount: 0,
  });
}


// ======================================================
// Lyt til ALLE opslag i realtime (til forsiden)
// ======================================================
export function listenToPosts(callback) {
  const q = query(postsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(posts);
  });
}


// ======================================================
// Slet et opslag (til admin)
// ======================================================
export async function deletePost(postId) {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
}


// ======================================================
// Tilføj en kommentar til et bestemt post
// ======================================================
export async function addCommentToPost(postId, text, authorId = null) {
  const commentsRef = collection(db, "posts", postId, "comments");

  await addDoc(commentsRef, {
    text,
    authorId,
    createdAt: serverTimestamp(),
  });
}


// Se kommentarer i realtime

export function listenToComments(postId, callback) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(comments);
  });
}


// +1 like på et opslag

export async function likePost(postId) {
  const postRef = doc(db, "posts", postId);

  await updateDoc(postRef, {
    likeCount: increment(1),
  });
}