// src/Pages/adminPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  subscribeToReports,
  approveReport,
  hidePost,
  deleteReportedPost,
  deleteReport,
  checkIsAdmin,
} from "../services/reportService";

const REPORT_REASON_LABELS = {
  spam: "Spam eller reklame",
  harassment: "Chikane eller mobning",
  inappropriate: "Upassende indhold",
  misinformation: "Misinformation",
  hate_speech: "Hadefuld tale",
  violence: "Vold eller trusler",
  other: "Andet",
};

const STATUS_CONFIG = {
  pending: { label: "Afventer", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: "⏳" },
  approved: { label: "Godkendt", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", icon: "✅" },
  hidden: { label: "Skjult", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", icon: "👁️" },
  deleted: { label: "Slettet", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", icon: "🗑️" },
};

function AdminPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      if (!user?.uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const adminStatus = await checkIsAdmin(user.uid);
      setIsAdmin(adminStatus);
      setLoading(false);
    }
    checkAdmin();
  }, [user?.uid]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = subscribeToReports((newReports) => {
      setReports(newReports);
    });
    return () => unsubscribe?.();
  }, [isAdmin]);

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    hidden: reports.filter((r) => r.status === "hidden").length,
    deleted: reports.filter((r) => r.status === "deleted").length,
  };

  async function handleApprove(report) {
    setActionLoading(true);
    try {
      await approveReport(report.id, user.uid, adminNote);
      setSelectedReport(null);
      setAdminNote("");
    } catch (err) {
      console.error("Fejl ved godkendelse:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleHide(report) {
    setActionLoading(true);
    try {
      await hidePost(report.id, report.postId, user.uid, adminNote);
      setSelectedReport(null);
      setAdminNote("");
    } catch (err) {
      console.error("Fejl ved skjuling:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(report) {
    if (!window.confirm("Er du sikker på at du vil slette dette opslag permanent?")) return;
    setActionLoading(true);
    try {
      await deleteReportedPost(report.id, report.postId, user.uid, adminNote);
      setSelectedReport(null);
      setAdminNote("");
    } catch (err) {
      console.error("Fejl ved sletning:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteReport(reportId) {
    if (!window.confirm("Er du sikker på at du vil slette denne rapport?")) return;
    try {
      await deleteReport(reportId);
    } catch (err) {
      console.error("Fejl ved sletning af rapport:", err);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Access denied
  if (!loading && !isAdmin) {
    return (
      <Layout pageTitle="Adgang nægtet" showHomeButton>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          textAlign: "center",
          padding: "20px",
        }}>
          <div style={{ fontSize: "80px", marginBottom: "24px" }}>🚫</div>
          <h2 style={{ marginBottom: "12px", fontSize: "24px" }}>Adgang nægtet</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "400px" }}>
            Du har ikke tilladelse til at se denne side. Kun administratorer kan tilgå admin panelet.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/home")}>
            ← Tilbage til forsiden
          </button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout pageTitle="Admin Panel" showHomeButton>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p>Indlæser admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Panel" showHomeButton>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "24px",
          color: "white",
          boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700" }}>Admin Dashboard</h1>
              <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
                Håndter rapporterede indlæg og sikr et godt forum-miljø
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          marginBottom: "24px",
        }}>
          {[
            { key: "pending", label: "Afventer", icon: "⏳", color: "#f59e0b" },
            { key: "approved", label: "Godkendt", icon: "✅", color: "#22c55e" },
            { key: "hidden", label: "Skjult", icon: "👁️", color: "#3b82f6" },
            { key: "deleted", label: "Slettet", icon: "🗑️", color: "#ef4444" },
            { key: "all", label: "Total", icon: "📊", color: "#8b5cf6" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              style={{
                padding: "14px 8px",
                borderRadius: "12px",
                border: filter === stat.key ? `2px solid ${stat.color}` : "1px solid var(--card-border-color)",
                backgroundColor: filter === stat.key ? `${stat.color}15` : "var(--card-bg-color)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{stat.icon}</div>
              <div style={{ 
                fontSize: "22px", 
                fontWeight: "700",
                color: filter === stat.key ? stat.color : "var(--text-primary)",
                lineHeight: "1.2",
              }}>
                {counts[stat.key]}
              </div>
              <div style={{ 
                fontSize: "10px", 
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: "2px",
              }}>
                {stat.label}
              </div>
              {stat.key === "pending" && counts.pending > 0 && (
                <div style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  !
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div style={{
          backgroundColor: "var(--card-bg-color)",
          borderRadius: "16px",
          border: "1px solid var(--card-border-color)",
          overflow: "hidden",
        }}>
          {/* Section Header */}
          <div style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--card-border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--primary-color)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>
                {filter === "all" ? "📋" : STATUS_CONFIG[filter]?.icon || "📋"}
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                  {filter === "all" ? "Alle rapporter" : STATUS_CONFIG[filter]?.label || "Rapporter"}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  {filteredReports.length} {filteredReports.length === 1 ? "rapport" : "rapporter"}
                </p>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}>
              <div style={{ fontSize: "50px", marginBottom: "16px", opacity: 0.6 }}>
                {filter === "pending" ? "🎉" : "📭"}
              </div>
              <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "18px" }}>
                {filter === "pending" ? "Ingen ventende rapporter!" : "Ingen rapporter her"}
              </h3>
              <p style={{ margin: 0, fontSize: "14px" }}>
                {filter === "pending" 
                  ? "Alle rapporter er blevet håndteret. Godt arbejde! 🙌"
                  : "Der er ingen rapporter med denne status."}
              </p>
            </div>
          ) : (
            <div>
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  style={{
                    padding: "20px 24px",
                    borderBottom: index < filteredReports.length - 1 ? "1px solid var(--card-border-color)" : "none",
                    backgroundColor: selectedReport?.id === report.id ? "var(--input-bg)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Report Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      {/* Status Icon */}
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        backgroundColor: STATUS_CONFIG[report.status]?.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}>
                        {STATUS_CONFIG[report.status]?.icon}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: STATUS_CONFIG[report.status]?.bg,
                            color: STATUS_CONFIG[report.status]?.color,
                          }}>
                            {STATUS_CONFIG[report.status]?.label}
                          </span>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "500",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                          }}>
                            {REPORT_REASON_LABELS[report.reason] || report.reason}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          Rapporteret af <strong style={{ color: "var(--text-primary)" }}>{report.reporterName}</strong>
                          <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                    </div>

                    {report.status === "pending" && (
                      <button
                        onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                        }}
                      >
                        {selectedReport?.id === report.id ? "✕ Luk" : "⚡ Håndter"}
                      </button>
                    )}
                  </div>

                  {/* Post Content Card */}
                  <div style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    backgroundColor: "var(--primary-color)",
                    border: "1px solid var(--card-border-color)",
                    marginBottom: report.details || report.adminNote || selectedReport?.id === report.id ? "14px" : "0",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}>
                      <span>📝</span>
                      <span>Opslag af <strong style={{ color: "var(--text-primary)" }}>{report.postAuthorName}</strong></span>
                    </div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600" }}>
                      {report.postTitle || "Ingen titel"}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      maxHeight: "80px",
                      overflow: "auto",
                    }}>
                      {report.postContent || "Intet indhold"}
                    </p>
                  </div>

                  {/* Reporter's Details */}
                  {report.details && (
                    <div style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(245, 158, 11, 0.08)",
                      borderLeft: "3px solid #f59e0b",
                      marginBottom: report.adminNote || selectedReport?.id === report.id ? "14px" : "0",
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", marginBottom: "4px", color: "#f59e0b" }}>
                        💬 Rapportørens bemærkning
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>{report.details}</p>
                    </div>
                  )}

                  {/* Admin Note */}
                  {report.adminNote && (
                    <div style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      borderLeft: "3px solid #3b82f6",
                      marginBottom: selectedReport?.id === report.id ? "14px" : "0",
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", marginBottom: "4px", color: "#3b82f6" }}>
                        🛡️ Admin note
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>{report.adminNote}</p>
                    </div>
                  )}

                  {/* Action Panel */}
                  {selectedReport?.id === report.id && (
                    <div style={{
                      padding: "18px",
                      borderRadius: "12px",
                      backgroundColor: "var(--card-bg-color)",
                      border: "2px solid #6366f1",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                    }}>
                      <h4 style={{ margin: "0 0 14px 0", fontSize: "13px", fontWeight: "600", color: "#6366f1" }}>
                        🎯 Vælg handling
                      </h4>
                      
                      <div style={{ marginBottom: "14px" }}>
                        <label style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "var(--text-secondary)",
                        }}>
                          Admin note (valgfrit)
                        </label>
                        <textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Tilføj en intern note om din beslutning..."
                          rows={2}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--card-border-color)",
                            backgroundColor: "var(--input-bg)",
                            fontSize: "13px",
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        <button
                          onClick={() => handleApprove(report)}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 8px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: "#22c55e",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            transition: "transform 0.1s ease",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>✅</span>
                          <span>Godkend</span>
                          <span style={{ fontSize: "10px", opacity: 0.8 }}>Opslag OK</span>
                        </button>
                        <button
                          onClick={() => handleHide(report)}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 8px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            transition: "transform 0.1s ease",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>👁️</span>
                          <span>Skjul</span>
                          <span style={{ fontSize: "10px", opacity: 0.8 }}>Gem væk</span>
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 8px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: "#ef4444",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            transition: "transform 0.1s ease",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>🗑️</span>
                          <span>Slet</span>
                          <span style={{ fontSize: "10px", opacity: 0.8 }}>Permanent</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete handled report */}
                  {report.status !== "pending" && (
                    <div style={{ marginTop: "10px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--card-border-color)",
                          backgroundColor: "transparent",
                          color: "var(--text-secondary)",
                          fontSize: "11px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = "#ef4444";
                          e.currentTarget.style.color = "#ef4444";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "var(--card-border-color)";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                      >
                        🗑️ Fjern fra liste
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminPage;
