// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import {
  addCommentToPost,
  listenToComments,
  likePost,
} from "../../services/postsService.js";

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);

  // --- Udregn felter så både "gamle" og "nye" posts virker ---
  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";

  // Tekst kan komme fra Content (nye posts) eller text (gamle)
  const text = post.Content ?? post.content ?? post.text ?? "";

  // Dato: Firestore timestamp eller en allerede formateret streng
  let formattedDate = "";
  if (post.createdAt?.toDate) {
    formattedDate = post.createdAt.toDate().toLocaleString();
  } else if (post.date) {
    formattedDate = post.date;
  }

  // Likes: likeCount (nye) eller likes (gamle)
  const likes = post.likeCount ?? post.likes ?? 0;

  // --- Lyt til kommentarer i realtime ---
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

  return (
    <div className="post">
      {/* HEADER */}
      <div className="post-header">
      <div className="post-avatar" />
      <img src="https://placehold.co/40" className="post-avatar" />

      <div className="post-header-info">
    <span className="post-author">{authorName}</span>
    {formattedDate && <span className="post-date">{formattedDate}</span>}
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