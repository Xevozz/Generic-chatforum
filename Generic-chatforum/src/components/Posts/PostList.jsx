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

  // 🔍 filtrér på titel/tekst/forfatter – UDEN at fjerne noget af dit eksisterende
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visiblePosts =
    normalizedQuery.length === 0
      ? posts
      : posts.filter((p) => {
          const title = (p.title || "").toLowerCase();
          const content =
            (p.content || p.Content || p.text || "").toLowerCase();
          const author =
            (p.authorName || p.author || p.authorId || "").toLowerCase();

          return (
            title.includes(normalizedQuery) ||
            content.includes(normalizedQuery) ||
            author.includes(normalizedQuery)
          );
        });

  if (loading && !posts.length) return <p>Henter opslag...</p>;
  if (!visiblePosts.length) return <p>Ingen opslag matcher din søgning.</p>;

  return (
    <div className="post-list">
      {visiblePosts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;