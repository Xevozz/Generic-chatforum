// src/services/postsService.js
import { createNotification } from "./notificationsService";
import { db } from "../firebaseConfig";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";

const postsRef = collection(db, "posts");

// ======================================================
// Hent et enkelt opslag via ID
// ======================================================
export async function getPostById(postId) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    return null;
  }
  
  return { id: postSnap.id, ...postSnap.data() };
}

// ======================================================
// Opret et nyt opslag
// ======================================================
export async function createPost({
  title = "",
  content,
  authorId = null,
  authorName,
  groupId = null,
}) {
  if (!content?.trim()) throw new Error("Opslaget må ikke være tomt.");

  const combinedText = title ? `${title}\n\n${content}` : content;

  await addDoc(postsRef, {
    Content: combinedText.trim(), // legacy
    title: title || null,
    content: content.trim(),

    authorId: authorId || null,
    authorName: authorName || "Ukendt bruger",

    groupId: groupId || null,
    createdAt: serverTimestamp(),
    likedBy: [],
  });
}

// ======================================================
// Lyt til ALLE opslag
// ======================================================
export function listenToAllPosts(callback) {
  const q = query(postsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
}

// ======================================================
// Lyt til opslag i en specifik gruppe
// ======================================================
export function listenToPostsByGroup(groupId, callback) {
  const q = query(
    postsRef,
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
}

// ======================================================
// Slet opslag
// ======================================================
export async function deletePost(postId) {
  await deleteDoc(doc(db, "posts", postId));
}

// ======================================================
// Opdater opslag
// ======================================================
export async function updatePost(postId, { title, content }) {
  const postRef = doc(db, "posts", postId);
  const combinedText = title ? `${title}\n\n${content}` : content;
  
  await updateDoc(postRef, {
    title: title || null,
    content: content.trim(),
    Content: combinedText.trim(), // legacy field
    updatedAt: serverTimestamp(),
  });
}

// ======================================================
// Tilføj kommentar + notifikation
// ======================================================
export async function addCommentToPost(
  postId,
  text,
  authorId = null,
  authorName = "",
  parentCommentId = null
) {
  const commentsRef = collection(db, "posts", postId, "comments");

  const commentData = {
    text,
    authorId,
    authorName: authorName || "Ukendt bruger",
    createdAt: serverTimestamp(),
  };

  if (parentCommentId) {
    commentData.parentCommentId = parentCommentId;
  }

  await addDoc(commentsRef, commentData);

  // Notifikation til ejeren
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const post = postSnap.data();
    const ownerId = post.authorId;

    if (!ownerId || !authorId || ownerId === authorId) return;

    await createNotification({
      toUserId: ownerId,
      fromUserName: authorName || "Ukendt bruger",
      type: "comment",
      postId,
      groupId: post.groupId || null,
    });
  } catch (e) {
    console.error("Fejl ved comment-notifikation:", e);
  }
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
// Like / Unlike + notifikation
// ======================================================
export async function toggleLike(postId, { userId, displayName, hasLiked }) {
  const postRef = doc(db, "posts", postId);
  const likeObj = { userId, displayName };

  await updateDoc(postRef, {
    likedBy: hasLiked ? arrayRemove(likeObj) : arrayUnion(likeObj),
  });

  // Notifikation kun når man liker (ikke når man fjerner)
  if (!hasLiked) {
    try {
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) return;

      const post = postSnap.data();
      const ownerId = post.authorId;

      if (!ownerId || !userId || ownerId === userId) return;

      await createNotification({
        toUserId: ownerId,
        fromUserName: displayName || "Ukendt bruger",
        type: "like",
        postId,
        groupId: post.groupId || null,
      });
    } catch (e) {
      console.error("Fejl ved like-notifikation:", e);
    }
  }
}