// src/components/Posts/PostList.jsx
import { useEffect, useState } from "react";
import { listenToAllPosts, listenToPostsByGroup } from "../../services/postsService";
import Post from "./Post";

function PostList({ groupId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;

    if (groupId) {
      unsub = listenToPostsByGroup(groupId, setPosts);
    } else {
      unsub = listenToAllPosts(setPosts);
    }

    return () => unsub();
  }, [groupId]);

  if (loading && !posts.length) return <p>Henter opslag...</p>;
  if (!posts.length) return <p>Ingen opslag endnu.</p>;

  return (
    <div className="post-list">
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;