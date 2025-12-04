// src/components/Posts/PostList.jsx

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Post from "./Post";

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(loadedPosts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Fejl ved hentning af posts:", err);
        setError("Kunne ikke hente opslag.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Henter opslag...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!posts.length)
    return <p>Der er endnu ingen opslag. Vær den første til at skrive noget 😄</p>;

  return (
    <div className="post-list">
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;