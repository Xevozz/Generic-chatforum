// src/services/postsService.js

// Alt her handler om ENKELTE posts: kommentarer + likes
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
   * Tilføj en kommentar til et bestemt post
   * - postId: ID'et fra posts-collection
   * - text: selve kommentaren
   * - authorId: kan være null/ukendt hvis I ikke har auth endnu
   */
  export async function addCommentToPost(postId, text, authorId = null) {
    const commentsRef = collection(db, "posts", postId, "comments");
  
    await addDoc(commentsRef, {
      text,
      authorId,
      createdAt: serverTimestamp(),
    });
  }
  
  /**
   * Se kommentarer på et post i realtime
   * - postId: ID'et på post-dokumentet
   * - callback: funktion der får en liste af kommentarer
   * Returnerer en unsubscribe-funktion.
   */
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
  

   // likeCount på et post med 1
  export async function likePost(postId) {
    const postRef = doc(db, "posts", postId);
  
    await updateDoc(postRef, {
      likeCount: increment(1),
    });
  }