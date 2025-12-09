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
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const postsRef = collection(db, "posts");


// ======================================================
// Opret et nyt opslag
// ======================================================
export async function createPost({ content, authorId = null, authorName }) {
  if (!content.trim()) throw new Error("Opslaget må ikke være tomt.");

  await addDoc(postsRef, {
    // Du bruger i dag feltet "Content" i Firestore,
    // så vi beholder det for kompatibilitet.
    Content: content.trim(),
    authorId: authorId || null,
    authorName: authorName || "Ukendt bruger",

    createdAt: serverTimestamp(),

    // NYT: liste over likes (objekter med userId + displayName)
    likedBy: [],
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
// Slet et opslag (til admin – kun brugt hvis du har UI til det)
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


// ======================================================
// Lyt til kommentarer i realtime
// ======================================================
export function listenToComments(postId, callback) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(comments);
  });
}


// ======================================================
// Toggle like (like / unlike) for en given bruger
// - hasLiked = true  → fjern like
// - hasLiked = false → tilføj like
// ======================================================
export async function toggleLike(postId, { userId, displayName, hasLiked }) {
  const postRef = doc(db, "posts", postId);
  const likeObj = { userId, displayName };

  await updateDoc(postRef, {
    likedBy: hasLiked ? arrayRemove(likeObj) : arrayUnion(likeObj),
  });
}