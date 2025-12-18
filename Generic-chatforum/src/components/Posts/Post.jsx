// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addCommentToPost,
  listenToComments,
  toggleLike,
} from "../../services/postsService";
import { getUserByUid, isUserOnline } from "../../services/userService";
import { db } from "../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

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
  const [authorProfile, setAuthorProfile] = useState(null);

  const { user, profile } = useAuth();

  // --- Udregn felter ---
  const authorName =
    post.authorName || post.author || post.authorId || "Ukendt bruger";

  const formattedDate = formatDate(post.createdAt || post.date);

  const likedBy = post.likedBy || [];
  const likesCount = likedBy.length;

  const currentUserId = user?.uid;
  const currentUserName =
    profile?.displayName || user?.email || "Ukendt bruger";

  const hasLiked =
    !!currentUserId &&
    likedBy.some((like) => like.userId === currentUserId);

  const likesText = buildLikesText(likedBy);

  // --- Titel + brødtekst (ny struktur) ---
  const legacyContent = post.Content || "";

  const title =
    post.title ||
    (legacyContent ? legacyContent.split("\n\n")[0] : "");

  const body =
    post.content ||
    (legacyContent
      ? legacyContent.split("\n\n").slice(1).join("\n\n")
      : "");

  const hasTitle = !!title?.trim();
  const hasBody = !!body?.trim();

  // --- Lyt til kommentarer ---
  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = listenToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [post.id]);

  // --- Hent forfatter profil for at få billede og online status (real-time) ---
  useEffect(() => {
    if (!post.authorId) return;
    
    // Brug real-time listener så vi får live updates af lastActive
    const unsubscribe = onSnapshot(doc(db, "users", post.authorId), (docSnap) => {
      if (docSnap.exists()) {
        setAuthorProfile({ id: docSnap.id, ...docSnap.data() });
      }
    });

    return () => unsubscribe();
  }, [post.authorId]);

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
      await addCommentToPost(post.id, commentText.trim(), currentUserId, currentUserName);
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
          <div className="post-avatar" style={{ position: "relative" }}>
            {authorProfile?.profilePicture ? (
              <img
                src={authorProfile.profilePicture}
                alt={authorName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "var(--accent-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
              }}>
                {(authorName || "U").charAt(0).toUpperCase()}
              </div>
            )}

            {/* Online status indicator */}
            {authorProfile && isUserOnline(authorProfile.lastActive) && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#4caf50",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
                title="Online"
              />
            )}
          </div>
          <div className="post-header-info">
            <span className="post-author">{authorName}</span>
            {formattedDate && (
              <span className="post-date">{formattedDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* TEKST: titel + beskrivelse */}
      <div className="post-text">
        {hasTitle && <h3 className="post-title">{title}</h3>}
        {hasBody && <p className="post-body">{body}</p>}
      </div>

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
        <div className="post-likes-text">{likesText}</div>
      )}

      {/* KOMMENTARLISTE */}
      <div className="comments-section">
        {comments.length === 0 ? (
          <p className="no-comments">Ingen kommentarer endnu.</p>
        ) : (
          comments.map((c) => {
            const isFromOP = c.authorId === post.authorId;
            return (
              <div
                key={c.id}
                className="comment-box"
                style={{
                  backgroundColor: isFromOP ? "rgba(76, 175, 80, 0.08)" : "transparent",
                  borderLeft: isFromOP ? "3px solid #4caf50" : "none",
                  paddingLeft: isFromOP ? "12px" : "0",
                }}
              >
                <div className="comment-author" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  {c.authorName || "Bruger"}
                  {isFromOP && (
                    <span style={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "600",
                    }}>
                      OP
                    </span>
                  )}
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Post;