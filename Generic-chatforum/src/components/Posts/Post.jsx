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
  const [sendingComment, setSendingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";
  const text = post.Content || post.content || "";
  const likeCount = post.likeCount ?? 0;

  let formattedDate = "Ukendt tidspunkt";
  if (post.createdAt?.toDate) {
    formattedDate = post.createdAt.toDate().toLocaleString();
  }

  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = listenToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [post.id]);

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

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!commentText.trim() || !post.id) return;

    setSendingComment(true);
    try {
      await addCommentToPost(post.id, commentText.trim(), null);
      setCommentText("");
    } catch (err) {
      console.error("Fejl ved oprettelse af kommentar:", err);
    } finally {
      setSendingComment(false);
    }
  }

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-avatar" />
        <div>
          <div className="post-author">{authorName}</div>
          <div className="post-date">{formattedDate}</div>
        </div>
      </div>

      <p className="post-text">{text}</p>

      <div className="post-actions">
        <button onClick={handleLike} disabled={liking}>
          👍 Synes godt om ({likeCount})
        </button>
      </div>

      <div className="post-comments">
        {comments.length === 0 ? (
          <p>Ingen kommentarer endnu.</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                <strong>{c.authorId || "Ukendt"}:</strong> {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="post-comment-form">
        <input
          type="text"
          placeholder="Skriv en kommentar..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" disabled={sendingComment}>
          {sendingComment ? "Sender..." : "Kommentér"}
        </button>
      </form>
    </div>
  );
}

export default Post;