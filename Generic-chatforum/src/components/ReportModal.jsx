// src/components/ReportModal.jsx
// ======================================================
// Modal til rapportering af upassende opslag
// ======================================================
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createReport } from "../services/reportService";

const REPORT_REASONS = [
  { value: "spam", label: "Spam eller reklame" },
  { value: "harassment", label: "Chikane eller mobning" },
  { value: "inappropriate", label: "Upassende indhold" },
  { value: "misinformation", label: "Misinformation" },
  { value: "hate_speech", label: "Hadefuld tale" },
  { value: "violence", label: "Vold eller trusler" },
  { value: "other", label: "Andet" },
];

function ReportModal({ isOpen, onClose, post, user, profile }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDetails("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

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
    
    if (!reason) {
      setError("Vælg venligst en grund til rapporten");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createReport({
        postId: post.id,
        postTitle: post.title || "Ingen titel",
        postContent: post.content || post.body || "",
        postAuthorId: post.authorId || post.userId,
        postAuthorName: post.authorName || post.displayName || "Ukendt",
        reporterId: user.uid,
        reporterName: profile?.displayName || user.email,
        reason,
        details,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setDetails("");
      }, 2000);
    } catch (err) {
      console.error("Fejl ved oprettelse af rapport:", err);
      setError("Der opstod en fejl. Prøv igen.");
    } finally {
      setSubmitting(false);
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
        ref={modalRef}
        style={{
          backgroundColor: "var(--card-bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--card-border-color)",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
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
            ⚠️ Rapportér opslag
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
        <div style={{ padding: "20px" }}>
          {success ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--success-color, #22c55e)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Tak for din rapport!</h3>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                En administrator vil gennemgå rapporten snarest.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Post preview */}
              <div
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "20px",
                  border: "1px solid var(--card-border-color)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  Opslag af {post.authorName || post.displayName}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                  {post.title || "Ingen titel"}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.content || post.body || ""}
                </div>
              </div>

              {/* Reason selection */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Hvorfor rapporterer du dette opslag? *
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor:
                          reason === r.value
                            ? "var(--accent-color)"
                            : "var(--input-bg)",
                        color: reason === r.value ? "white" : "inherit",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: "1px solid var(--card-border-color)",
                      }}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                        style={{ display: "none" }}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional details */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Yderligere detaljer (valgfrit)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Beskriv problemet nærmere..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    color: "var(--error-color, #ef4444)",
                    marginBottom: "16px",
                    padding: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || !reason}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: submitting || !reason 
                    ? "var(--text-secondary)" 
                    : "var(--error-color, #ef4444)",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: submitting || !reason ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {submitting ? "Sender..." : "Send rapport"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}

export default ReportModal;
