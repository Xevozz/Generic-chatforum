// src/components/Posts/PostList.jsx
import { useEffect, useState } from "react";
import { listenToAllPosts, listenToPostsByGroup } from "../../services/postsService";
import Post from "./Post";

function PostList({ groupId, searchQuery = "", advancedFilters = null }) {
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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  let visiblePosts = posts.filter((p) => {
    if (normalizedQuery.length > 0) {
      const title = (p.title || "").toLowerCase();
      const content = (p.content || p.Content || p.text || "").toLowerCase();
      const author = (p.authorName || p.author || p.authorId || "").toLowerCase();

      const matchesSearch =
        title.includes(normalizedQuery) ||
        content.includes(normalizedQuery) ||
        author.includes(normalizedQuery);

      if (!matchesSearch) return false;
    }

    if (advancedFilters?.keywords) {
      const title = (p.title || "").toLowerCase();
      const content = (p.content || p.Content || p.text || "").toLowerCase();
      const author = (p.authorName || p.author || p.authorId || "").toLowerCase();

      const matchesKeywords =
        title.includes(advancedFilters.keywords) ||
        content.includes(advancedFilters.keywords) ||
        author.includes(advancedFilters.keywords);

      if (!matchesKeywords) return false;
    }

    if (advancedFilters?.startDate || advancedFilters?.endDate) {
      const postDate = p.createdAt?.toDate
        ? p.createdAt.toDate()
        : new Date(p.createdAt);

      if (advancedFilters.startDate && postDate < advancedFilters.startDate) {
        return false;
      }

      if (advancedFilters.endDate) {
        const endOfDay = new Date(advancedFilters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (postDate > endOfDay) return false;
      }
    }

    return true;
  });

  if (advancedFilters?.sortBy === "oldest") {
    visiblePosts.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB;
    });
  } else if (advancedFilters?.sortBy === "most-liked") {
    visiblePosts.sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0));
  }

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