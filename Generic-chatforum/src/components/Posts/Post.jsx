// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import {
  addCommentToPost,
  listenToComments,
  likePost,
} from "src/Services/postsService";

/**
 * Post:
 * - Viser ét opslag (post)
 * - Viser likes
 * - Viser kommentarer
 * - Har input til at tilføje en ny kommentar
 */
function Post({ post }) {
  const [comments, setComments] = useState([]);      // Liste med kommentarer
  const [commentText, setCommentText] = useState(""); // Input felt for ny kommentar
  const [sendingComment, setSendingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  // Fallbacks til visning
  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";
  const text = post.Content || post.content || "";
  const likeCount = post.likeCount ?? 0;

  let formattedDate = "Ukendt tidspunkt";
  if (post.createdAt?.toDate) {
    formattedDate = post.createdAt.toDate().toLocaleString();
  }

  // Se kommentarer for DETTE post
  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = listenToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    // Stop med at vise indhold, når komponenten fjernes
    return () => unsubscribe();
  }, [post.id]);

  // Håndter klik på "Like"
  async function handleLike() {
    if (!post.id) return;
    setLiking(true);
    try {
      await likePost(post.id);
      // PostList henter posts via onSnapshot og sender ny værdi ned (likes)
    } catch (err) {
      console.error("Fejl ved like:", err);
    } finally {
      setLiking(false);
    }
  }

  // Håndterer ny kommentar
  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!commentText.trim() || !post.id) return;

    setSendingComment(true);
    try {
      // Her kan I senere sende rigtig user-id ind
      await addCommentToPost(post.id, commentText.trim(), null);
      setCommentText(""); // rydder inputfeltet
    } catch (err) {
      console.error("Fejl ved oprettelse af kommentar:", err);
    } finally {
      setSendingComment(false);
    }
  }

  return (
    <div className="post">
      {/* Header: avatar + navn + dato */}
      <div className="post-header">
        <div className="post-avatar" />
        <div>
          <div className="post-author">{authorName}</div>
          <div className="post-date">{formattedDate}</div>
        </div>
      </div>

      {/* Teksten i opslaget */}
      <p className="post-text">{text}</p>

      {/* Likes + knapper */}
      <div className="post-actions">
        <button onClick={handleLike} disabled={liking}>
          👍 Synes godt om ({likeCount})
        </button>
        {/* Du kan senere lave rigtig "åbn kommentar view" knap her */}
        
      </div>

      {/* Liste over kommentarer */}
      <div className="post-comments">
        {comments.length === 0 ? (
          <p>Ingen kommentarer endnu.</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                <strong>
                  {c.authorId || "Ukendt"}:
                </strong>{" "}
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formular til ny kommentar */}
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