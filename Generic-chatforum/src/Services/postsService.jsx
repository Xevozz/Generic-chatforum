// src/services/postsService.js

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
  } from "firebase/firestore";
  import { db } from "../firebaseConfig";
  
  /**
   * Opretter et nyt post/opslag i "posts"-collection
   * - content: selve tekstindholdet (string)
   * - authorId: valgfrit (kan være null indtil vi har auth)
   */
  export async function createPost(content, authorId = null) {
    const postsRef = collection(db, "posts");
  
    await addDoc(postsRef, {
      Content: content,         
      authorId: authorId,
      createdAt: serverTimestamp(),
      likeCount: 0,              // starter med 0 likes
    });
  }
  
   // Tilføj en kommentar til et bestemt post
  export async function addCommentToPost(postId, text, authorId = null) {
    const commentsRef = collection(db, "posts", postId, "comments");
  
    await addDoc(commentsRef, {
      text,
      authorId,
      createdAt: serverTimestamp(),
    });
  }
  

   // Se til kommentarer i realtime

  export function listenToComments(postId, callback) {
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
  
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(comments);
    });
  }
  
   // likeCount med 1
  export async function likePost(postId) {
    const postRef = doc(db, "posts", postId);
  
    await updateDoc(postRef, {
      likeCount: increment(1),
    });
  }