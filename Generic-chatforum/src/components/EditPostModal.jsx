// src/components/EditPostModal.jsx
// ======================================================
// Modal til redigering af eksisterende opslag
// ======================================================
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updatePost } from "../services/postsService";

function EditPostModal({ isOpen, onClose, post }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && post) {
      // Get title from post
      const postTitle = post.title || (post.Content ? post.Content.split("\n\n")[0] : "");
      const postContent = post.content || (post.Content ? post.Content.split("\n\n").slice(1).join("\n\n") : "");
      
      setTitle(postTitle);
      setContent(postContent);
      setError("");
    }
  }, [isOpen, post]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Indhold er påkrævet");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updatePost(post.id, {
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Fejl ved opdatering af opslag:", err);
      setError("Der opstod en fejl. Prøv igen.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: "var(--card-bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--card-border-color)",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--card-border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
            ✏️ Rediger opslag
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Overskrift på dit opslag..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--card-border-color)",
                backgroundColor: "var(--input-bg)",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Indhold *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Skriv dit opslag her..."
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--card-border-color)",
                backgroundColor: "var(--input-bg)",
                fontSize: "14px",
                resize: "vertical",
                minHeight: "120px",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid var(--card-border-color)",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--accent-color)",
                color: "white",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Gemmer..." : "💾 Gem ændringer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default EditPostModal;
