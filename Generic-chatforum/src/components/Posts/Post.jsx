// src/components/Posts/Post.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  addCommentToPost,
  listenToComments,
  toggleLike,
  deletePost,
} from "../../services/postsService";
import { getUserByUid, isUserOnline } from "../../services/userService";
import { getGroupById } from "../../services/groupService";
import { db } from "../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import UserHoverCard from "../UserHoverCard";
import ReportModal from "../ReportModal";
import EditPostModal from "../EditPostModal";

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [hoverCard, setHoverCard] = useState({ visible: false, userId: null, position: null });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [groupName, setGroupName] = useState(null);

  const { user, profile } = useAuth();
  const navigate = useNavigate();

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

  // --- Hent gruppe navn ---
  useEffect(() => {
    if (!post.groupId) {
      setGroupName(null);
      return;
    }

    async function fetchGroupName() {
      try {
        const group = await getGroupById(post.groupId);
        if (group) {
          setGroupName(group.name);
        }
      } catch (err) {
        console.error("Fejl ved hentning af gruppe:", err);
      }
    }

    fetchGroupName();
  }, [post.groupId]);

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

  // --- Tilføj kommentar (eller svar på kommentar) ---
  async function handleSubmit(e) {
    e.preventDefault();
    if (!commentText.trim() || !post.id) return;

    setSending(true);
    try {
      await addCommentToPost(
        post.id,
        commentText.trim(),
        currentUserId,
        currentUserName,
        replyingTo?.commentId || null // Pass parent comment ID if replying
      );
      setCommentText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Fejl ved oprettelse af kommentar:", err);
    } finally {
      setSending(false);
    }
  }

  // --- Håndter svar på kommentar ---
  function handleReplyClick(commentId, authorName) {
    setReplyingTo({ commentId, authorName });
  }

  function cancelReply() {
    setReplyingTo(null);
  }

  // --- Send inline reply ---
  async function handleInlineReply(commentId, authorName, text) {
    if (!text.trim() || !post.id) return;

    setSending(true);
    try {
      await addCommentToPost(
        post.id,
        text.trim(),
        currentUserId,
        currentUserName,
        commentId
      );
      setReplyingTo(null);
    } catch (err) {
      console.error("Fejl ved svar:", err);
    } finally {
      setSending(false);
    }
  }

  // --- Handle hover card ---
  function handleUserHover(e, userId, userName) {
    const rect = e.currentTarget.getBoundingClientRect();
    
    setHoverCard({
      visible: true,
      userId,
      userName,
      position: {
        top: rect.bottom + 8,
        left: rect.left,
      },
    });
  }

  function handleUserLeave() {
    setHoverCard({ visible: false, userId: null, position: null });
  }

  function handleHoverCardMouseEnter() {
    // Når man enter hover card, gør ingenting - hold den åben
  }

  function handleHoverCardMouseLeave() {
    // Når man leave hover card, luk den
    setHoverCard({ visible: false, userId: null, position: null });
  }

  // Handle delete post
  async function handleDeletePost() {
    if (!window.confirm("Er du sikker på at du vil slette dette opslag permanent?")) {
      return;
    }
    setDeleting(true);
    try {
      await deletePost(post.id);
      setMenuOpen(false);
    } catch (err) {
      console.error("Fejl ved sletning af opslag:", err);
      alert("Der opstod en fejl ved sletning af opslaget.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="post">
      {/* GRUPPE BADGE - vises øverst hvis opslaget tilhører en gruppe */}
      {groupName && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "12px",
            paddingBottom: "12px",
            borderBottom: "1px solid var(--card-border-color)",
          }}
        >
          <span
            onClick={() => navigate(`/groups/${post.groupId}`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              backgroundColor: "var(--input-bg)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-color)";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--input-bg)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span>📁</span>
            <span>{groupName}</span>
          </span>
        </div>
      )}

      {/* HEADER */}
      <div className="post-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          className="post-header-left"
          onMouseEnter={(e) => handleUserHover(e, post.authorId, authorName)}
          onMouseLeave={handleUserLeave}
          style={{
            cursor: "pointer",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "4px",
            borderRadius: "4px",
            transition: "background 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            className="post-avatar"
            style={{ position: "relative", flexShrink: 0 }}
          >
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
            <span
              className="post-author"
              onClick={() => navigate(`/user/${post.authorId}`)}
              style={{
                cursor: "pointer",
                color: "var(--accent-color)",
                fontWeight: "600",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {authorName}
            </span>
            {formattedDate && (
              <span className="post-date">{formattedDate}</span>
            )}
          </div>
        </div>

        {/* Three-dot menu */}
        {currentUserId && (
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                fontSize: "18px",
                color: "var(--text-secondary)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--input-bg)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title="Flere muligheder"
            >
              ⋯
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                  }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "var(--card-bg-color)",
                    border: "1px solid var(--card-border-color)",
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    minWidth: "180px",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  {/* Rediger - kun for ejeren */}
                  {currentUserId === post.authorId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setEditModalOpen(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--input-bg)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span>✏️</span>
                      <span>Rediger opslag</span>
                    </button>
                  )}

                  {/* Slet - kun for ejeren */}
                  {currentUserId === post.authorId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost();
                      }}
                      disabled={deleting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: deleting ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        color: "#ef4444",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                        opacity: deleting ? 0.6 : 1,
                      }}
                      onMouseOver={(e) => {
                        if (!deleting) e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span>🗑️</span>
                      <span>{deleting ? "Sletter..." : "Slet opslag"}</span>
                    </button>
                  )}

                  {/* Divider hvis både ejer og anmeld vises */}
                  {currentUserId === post.authorId && currentUserId !== post.authorId ? null : 
                    currentUserId !== post.authorId && (
                      <>
                        {/* Rapportér - kun for andre brugere */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setReportModalOpen(true);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            padding: "12px 16px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "var(--text-primary)",
                            textAlign: "left",
                            transition: "background 0.15s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--input-bg)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span>⚠️</span>
                          <span>Anmeld opslag</span>
                        </button>
                      </>
                    )
                  }
                </div>
              </>
            )}
          </div>
        )}
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
          disabled={!currentUserId || replyingTo}
        />

        <button
          type="submit"
          className="comment-btn"
          disabled={sending || !currentUserId || replyingTo}
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
            const parentComment = c.parentCommentId
              ? comments.find((cm) => cm.id === c.parentCommentId)
              : null;
            const isReply = !!c.parentCommentId;
            const depth = isReply ? 1 : 0;

            return (
              <div
                key={c.id}
                className="comment-box"
                style={{
                  marginLeft: depth > 0 ? "20px" : "0",
                  marginBottom: "10px",
                  padding: "12px 14px",
                  backgroundColor: isFromOP 
                    ? "rgba(76, 175, 80, 0.1)" 
                    : (isReply ? "rgba(33, 150, 243, 0.08)" : "#ffffff"),
                  border: isFromOP 
                    ? "2px solid #4caf50" 
                    : (isReply ? "2px solid #2196F3" : "1px solid #ddd"),
                  borderRadius: "6px",
                }}
              >
                {parentComment && (
                  <div style={{
                    fontSize: "11px",
                    color: "#666",
                    marginBottom: "4px",
                    fontStyle: "italic",
                  }}>
                    ↳ Svar til @{parentComment.authorName}
                  </div>
                )}
                <div className="comment-author" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span
                    onMouseEnter={(e) => handleUserHover(e, c.authorId, c.authorName)}
                    onMouseLeave={handleUserLeave}
                    onClick={() => navigate(`/user/${c.authorId}`)}
                    style={{
                      cursor: "pointer",
                      color: "var(--accent-color)",
                      fontWeight: "600",
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {c.authorName || "Bruger"}
                  </span>
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
                {currentUserId && replyingTo?.commentId !== c.id && (
                  <button
                    type="button"
                    onClick={() => handleReplyClick(c.id, c.authorName)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-color)",
                      cursor: "pointer",
                      fontSize: "12px",
                      marginTop: "4px",
                      padding: "0",
                      textDecoration: "underline",
                    }}
                  >
                    Svar
                  </button>
                )}

                {/* Inline reply input */}
                {replyingTo?.commentId === c.id && currentUserId && (
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px",
                    alignItems: "center",
                  }}>
                    <input
                      type="text"
                      placeholder={`Svar til @${c.authorName}...`}
                      defaultValue=""
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleInlineReply(c.id, c.authorName, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling;
                        if (input.value.trim()) {
                          handleInlineReply(c.id, c.authorName, input.value);
                          input.value = "";
                        }
                      }}
                      disabled={sending}
                      style={{
                        padding: "6px 16px",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: sending ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        opacity: sending ? 0.6 : 1,
                      }}
                    >
                      {sending ? "Sender..." : "Svar"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelReply}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#f0f0f0",
                        color: "#666",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Annuller
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Hover Card */}
      {hoverCard.visible && (
        <div
          onMouseEnter={handleHoverCardMouseEnter}
          onMouseLeave={handleHoverCardMouseLeave}
          style={{ position: "relative" }}
        >
          <UserHoverCard
            userId={hoverCard.userId}
            userName={hoverCard.userName}
            isVisible={hoverCard.visible}
            position={hoverCard.position}
          />
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        post={post}
        user={user}
        profile={profile}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={post}
      />
    </div>
  );
}

export default Post;