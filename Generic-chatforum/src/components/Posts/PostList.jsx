// src/components/Posts/PostList.jsx
import { useEffect, useState } from "react";
import { listenToAllPosts, listenToPostsByGroup } from "../../services/postsService";
import Post from "./Post";

function PostList({ groupId, searchQuery = "" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;

    if (groupId) {
      unsub = listenToPostsByGroup(groupId, (data) => {
        setPosts(data);
        setLoading(false);
      });
    } else {
      unsub = listenToAllPosts((data) => {
        setPosts(data);
        setLoading(false);
      });
    }

    return () => unsub && unsub();
  }, [groupId]);

  // ---- NYT: SØGEFILTER ----
  const q = searchQuery.trim().toLowerCase();

  const filteredPosts = q
    ? posts.filter((p) => {
        const text =
          (p.title || "") +
          " " +
          (p.content || "") +
          " " +
          (p.Content || ""); // Du havde begge varianter i DB
        return text.toLowerCase().includes(q);
      })
    : posts;

  // ---- Rendering ----
  if (loading && !posts.length) return <p>Henter opslag...</p>;
  if (!filteredPosts.length) {
    if (q) return <p>Ingen opslag matcher din søgning.</p>;
    return <p>Ingen opslag endnu.</p>;
  }

  return (
    <div className="post-list">
      {filteredPosts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;