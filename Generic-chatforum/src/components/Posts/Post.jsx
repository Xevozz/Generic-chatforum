// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addCommentToPost,
  listenToComments,
  toggleLike,
} from "../../services/postsService";

function formatDate(value) {
  if (!value) return "";
  if (value.toDate) {
    return value.toDate().toLocaleString("da-DK");
  }
  if (typeof value === "string") return value;
  try {
    return new Date(value).toLocaleString("da-DK");
  } catch {
    return "";
  }
}

function buildLikesText(likedBy = []) {
  if (!likedBy.length) return "";

  const names = likedBy.map((l) => l.displayName || "Ukendt bruger");
  if (names.length === 1) return `${names[0]} synes godt om dette`;
  if (names.length === 2) return `${names[0]} og ${names[1]} synes godt om dette`;
  return `${names[0]}, ${names[1]} og ${names.length - 2} andre synes godt om dette`;
}

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);

  const { user, profile } = useAuth();

  // --- Udregn felter ---
  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";

  const text = post.Content ?? post.content ?? post.text ?? "";

  const formattedDate = formatDate(post.createdAt || post.date);

  const likedBy = post.likedBy || [];
  const likesCount = likedBy.length;

  const currentUserId = user?.uid;
  const currentUserName = profile?.displayName || user?.email || "Ukendt bruger";

  const hasLiked =
    !!currentUserId &&
    likedBy.some((like) => like.userId === currentUserId);

  const likesText = buildLikesText(likedBy);

  // --- Lyt til kommentarer ---
  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = listenToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [post.id]);

  // --- Toggle like ---
  async function handleLike() {
    if (!post.id || !currentUserId) return;
    setLiking(true);
    try {
      await toggleLike(post.id, {
        userId: currentUserId,
        displayName: currentUserName,
        hasLiked,
      });
    } catch (err) {
      console.error("Fejl ved like:", err);
    } finally {
      setLiking(false);
    }
  }

  // --- Tilføj kommentar ---
  async function handleSubmit(e) {
    e.preventDefault();
    if (!commentText.trim() || !post.id) return;

    setSending(true);
    try {
      await addCommentToPost(post.id, commentText.trim(), currentUserId || null);
      setCommentText("");
    } catch (err) {
      console.error("Fejl ved oprettelse af kommentar:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="post">
      {/* HEADER */}
      <div className="post-header">
        <div className="post-header-left">
          <div className="post-avatar" />
          <div className="post-header-info">
            <span className="post-author">{authorName}</span>
            {formattedDate && (
              <span className="post-date">{formattedDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* TEKST */}
      <p className="post-text">{text}</p>

      {/* LIKE + KOMMENTAR I SAMME RÆKKE */}
      <form className="post-actions-row" onSubmit={handleSubmit}>
        <button
          type="button"
          className="like-btn"
          onClick={handleLike}
          disabled={liking || !currentUserId}
        >
          {hasLiked ? "👎 Fjern like" : "👍 Synes godt om"} ({likesCount})
        </button>

        <input
          type="text"
          className="comment-input-field"
          placeholder={
            currentUserId
              ? "Skriv en kommentar..."
              : "Log ind for at kommentere"
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!currentUserId}
        />

        <button
          type="submit"
          className="comment-btn"
          disabled={sending || !currentUserId}
        >
          {sending ? "Sender..." : "Kommentér"}
        </button>
      </form>

      {/* VIS HVEM DER HAR LIKET */}
      {likesCount > 0 && (
        <div className="post-likes-text">
          {likesText}
        </div>
      )}

      {/* KOMMENTARLISTE */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Ingen kommentarer endnu.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment">
              <strong>{c.authorId || "Bruger"}:</strong> {c.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Post;