// src/components/Posts/PostList.jsx
import { useEffect, useState } from "react";
import { listenToAllPosts, listenToPostsByGroup } from "../../services/postsService";
import Post from "./Post";

function PostList({ groupId, searchQuery = "", advancedFilters = null, limit = null, page = 1, onPageChange = null }) {
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

  // Pagination
  let displayPosts = visiblePosts;
  let totalPages = 1;
  if (limit) {
    totalPages = Math.ceil(visiblePosts.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    displayPosts = visiblePosts.slice(startIndex, endIndex);
  }

  if (loading && !posts.length) return <p>Henter opslag...</p>;
  if (!visiblePosts.length) return <p>Ingen opslag matcher din søgning.</p>;

  return (
    <div>
      <div className="post-list">
        {displayPosts.map((p) => (
          <Post key={p.id} post={p} />
        ))}
      </div>

      {/* Pagination buttons */}
      {limit && totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-color)",
        }}>
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              backgroundColor: page === 1 ? "#ccc" : "var(--button-bg)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            ← Forrige
          </button>

          <span style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}>
            Side {page} af {totalPages}
          </span>

          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor: page === totalPages ? "#ccc" : "var(--button-bg)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Næste →
          </button>
        </div>
      )}
    </div>
  );
}

export default PostList;