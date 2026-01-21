// src/pages/userProfile.jsx
// ======================================================
// Andre brugeres profil med statistik og chat-mulighed
// ======================================================
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import PostList from "../components/Posts/PostList";
import ChatModal from "../components/ChatModal";
import { getUserByUid, getUserStats } from "../services/userService";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  // Tjek om chat skal åbnes fra notifikation
  useEffect(() => {
    if (location.state?.openChat && !loading) {
      setChatOpen(true);
      // Slet state så det ikke åbner igen ved reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.openChat, loading]);

  useEffect(() => {
    if (!userId) {
      navigate("/home");
      return;
    }

    setLoading(true);
    Promise.all([
      getUserByUid(userId),
      getUserStats(userId),
    ])
      .then(([profileData, userStats]) => {
        if (!profileData) {
          navigate("/home");
          return;
        }
        setUserProfile(profileData);
        setStats(userStats);
      })
      .catch((err) => {
        console.error("Fejl ved hentning af bruger:", err);
        navigate("/home");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Layout>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Indlæser profil...</p>
          </div>
        </Layout>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Navbar />
        <Layout>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Bruger ikke fundet</p>
          </div>
        </Layout>
      </>
    );
  }

  const memberSinceDate = stats?.memberSinceDate
    ? new Date(stats.memberSinceDate).toLocaleDateString("da-DK")
    : "Ukendt";

  return (
    <>
      <Navbar />
      <Layout>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Profile Header */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-color)",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={userProfile.displayName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                >
                  {(userProfile.displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: "0 0 12px",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                }}
              >
                {userProfile.displayName}
              </h1>

              <p
                style={{
                  margin: "0 0 16px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                {userProfile.email}
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                    }}
                  >
                    {stats?.postCount || 0}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "4px",
                    }}
                  >
                    Opslag
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                    }}
                  >
                    {stats?.commentCount || 0}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "4px",
                    }}
                  >
                    Kommentarer
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor:
                        stats?.activityLevel === "Ekspert"
                          ? "#ffc107"
                          : stats?.activityLevel === "Erfaren"
                          ? "#2196F3"
                          : "#4caf50",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-block",
                    }}
                  >
                    {stats?.activityLevel || "Ny bruger"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "4px",
                    }}
                  >
                    Aktivitet
                  </div>
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                Medlem siden {memberSinceDate}
              </p>

              {/* Action Button */}
              {user && user.uid !== userId && (
                <button
                  onClick={() => setChatOpen(true)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "var(--button-bg)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--button-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--button-bg)";
                  }}
                >
                  💬 Send besked
                </button>
              )}
            </div>
          </div>

          {/* User's Posts */}
          <div>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#1a1a1a",
              }}
            >
              {userProfile.displayName}'s opslag
            </h2>
            <PostList userId={userId} />
          </div>
        </div>
      </Layout>

      {/* Chat Modal */}
      <ChatModal
        user={user}
        profile={profile}
        otherUser={userProfile}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}

export default UserProfile;

