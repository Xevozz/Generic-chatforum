import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Post from "./Post"; // behold denne

// src/components/Posts/PostList.jsx

import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import Post from "./Post";


 // PostList:
 // Henter ALLE threads fra Firestore DB
 // realtime (onSnapshot), så nye opslag dukker op uden reload
 // Har loading-, error- og "ingen opslag"-state

function PostList() {
  const [posts, setPosts] = useState([]);      // Liste med opslag
  const [loading, setLoading] = useState(true); // Viser "Henter..." i starten
  const [error, setError] = useState(null);     // Gemmer fejltekst, hvis noget går galt

  useEffect(() => {
    // Reference til DB "posts"
    const postsRef = collection(db, "posts");

    // Sortere posts efter createdAt (nyeste først)
    const q = query(postsRef, orderBy("createdAt", "desc"));

    // onSnapshot = realtime listener (Opdatere sig selv, hver gang data behandles)
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // alle properties til en post (f.eks. Content, authorId, createdAt)
        }));

        setPosts(loadedPosts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Fejl ved hentning af posts:", err);
        setError("Kunne ikke hente opslag. Prøv igen senere.");
        setLoading(false);
      }
    );


    // Cleanup: (unfollow)
    // Firestore stopper med at sende realtime-opdateringer til den komponent.
    // Mindre memory usage, Mindre netværksbelastning.

    return () => unsubscribe();
  }, []);


  // === UI states ===
  if (loading) {
    return <p>Henter opslag...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!posts.length) {
    return <p>Der er endnu ingen opslag. Vær den første til at skrive noget! 😄</p>;
  }

  // Normal visning når vi har data
  return (
    <div className="post-list">
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;