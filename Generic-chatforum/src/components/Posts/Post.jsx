// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addCommentToPost,
  listenToComments,
  likePost,
  deletePost,
} from "../../services/postsService";

function formatDate(value) {
  if (!value) return "";
  if (value.toDate) {
    // Firestore Timestamp
    return value.toDate().toLocaleString("da-DK");
  }
  if (typeof value === "string") return value;
  try {
    return new Date(value).toLocaleString("da-DK");
  } catch {
    return "";
  }
}

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auth + profil (til isAdmin mm.)
  const { profile } = useAuth();
  const isAdmin = profile?.isAdmin === true;

  // --- Udregner felter så både "gamle" og "nye" posts virker ---
  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";

  // Tekst kan komme fra Content (nye posts) eller text (gamle)
  const text = post.Content ?? post.content ?? post.text ?? "";

  // Dato: Firestore timestamp
  const formattedDate = formatDate(post.createdAt || post.date);

  // Likes: likeCount (nye) eller likes (gamle)
  const likes = post.likeCount ?? post.likes ?? 0;

  // --- Se til kommentarer i realtime ---
  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = listenToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [post.id]);

  // --- Like et opslag ---
  async function handleLike() {
    if (!post.id) return;
    setLiking(true);
    try {
      await likePost(post.id);
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
      await addCommentToPost(post.id, commentText.trim(), null);
      setCommentText("");
    } catch (err) {
      console.error("Fejl ved oprettelse af kommentar:", err);
    } finally {
      setSending(false);
    }
  }

  // --- Slet opslag (kun admin) ---
  async function handleDelete() {
    if (!isAdmin || !post.id) return;
    const sure = window.confirm("Er du sikker på, at du vil slette dette opslag?");
    if (!sure) return;

    try {
      setDeleting(true);
      await deletePost(post.id);
    } catch (err) {
      console.error("Fejl ved sletning:", err);
      alert("Kunne ikke slette opslaget. Prøv igen.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="post">
      {/* HEADER */}
      <div className="post-header">
        {/* Venstre: avatar + navn + dato */}
        <div className="post-header-left">
          <div className="post-avatar" />
          <div className="post-header-info">
            <span className="post-author">{authorName}</span>
            {formattedDate && (
              <span className="post-date">{formattedDate}</span>
            )}
          </div>
        </div>

        {/* Højre: skralde-ikon kun for admin */}
        {isAdmin && (
          <button
            className="post-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            title="Slet opslag"
          >
            🗑
          </button>
        )}
      </div>

      {/* TEKST */}
      <p className="post-text">{text}</p>

      {/* LIKE + KOMMENTAR I SAMME RÆKKE */}
      <form className="post-actions-row" onSubmit={handleSubmit}>
        <button
          type="button"
          className="like-btn"
          onClick={handleLike}
          disabled={liking}
        >
          👍 Synes godt om ({likes})
        </button>

        <input
          type="text"
          className="comment-input-field"
          placeholder="Skriv en kommentar..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button type="submit" className="comment-btn" disabled={sending}>
          {sending ? "Sender..." : "Kommentér"}
        </button>
      </form>

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