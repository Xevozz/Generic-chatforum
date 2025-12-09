// src/services/postsService.js
// Håndtering af opslag: opret, likes, kommentarer + gruppe-understøttelse

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
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const postsRef = collection(db, "posts");


// ======================================================
// Opret et nyt opslag (MODAL + HomePage + Gruppe)
// ======================================================
export async function createPost({ 
  title = "",
  content, 
  authorId = null, 
  authorName, 
  groupId = null 
}) {

  if (!content.trim()) throw new Error("Opslaget må ikke være tomt.");

  // Gør kompatibel med gamle komponenter (som læser Content-feltet)
  const combinedText = title
    ? `${title}\n\n${content}` 
    : content;

  await addDoc(postsRef, {
    // Beholder dette for COMPATIBILITY med ældre UI:
    Content: combinedText.trim(),

    // Nyere UI læser også dette:
    title: title || null,
    content: content.trim(),

    authorId: authorId || null,
    authorName: authorName || "Ukendt bruger",

    groupId: groupId || null,   // ⭐ vigtig for gruppe-funktionen
    createdAt: serverTimestamp(),

    likedBy: [], // beholdt for like-systemet
  });
}



// ======================================================
// Lyt til ALLE opslag (forsiden)
// ======================================================
export function listenToAllPosts(callback) {
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
// Lyt kun til opslag i en specifik gruppe
// ======================================================
export function listenToPostsByGroup(groupId, callback) {

  const q = query(
    postsRef,
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(posts);
  });
}



// ======================================================
// Slet et opslag (kun hvis I har UI for det)
// ======================================================
export async function deletePost(postId) {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
}



// ======================================================
// Tilføj kommentar
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
// Lyt til kommentarer
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
// LIKE / UNLIKE — understøtter arrayUnion + arrayRemove
// ======================================================
export async function toggleLike(postId, { userId, displayName, hasLiked }) {
  const postRef = doc(db, "posts", postId);
  const likeObj = { userId, displayName };

  await updateDoc(postRef, {
    likedBy: hasLiked ? arrayRemove(likeObj) : arrayUnion(likeObj),
  });
}