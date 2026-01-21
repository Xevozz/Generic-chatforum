// src/components/UserHoverCard.jsx
// ======================================================
// Hover-kort der viser brugerinfo ved hover på brugernavn
// ======================================================
import { useEffect, useState } from "react";
import { getUserStats, isUserOnline, getUserByUid } from "../services/userService";

function UserHoverCard({ userId, userName, isVisible, position }) {
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !userId) {
      return;
    }

    console.log(`[UserHoverCard] Fetching stats for userId: ${userId}`);
    setLoading(true);
    setStats(null);
    
    // Fetch both in parallel for faster loading
    Promise.all([
      getUserByUid(userId),
      getUserStats(userId)
    ])
      .then(([profile, statsData]) => {
        console.log(`[UserHoverCard] Got stats: posts=${statsData?.postCount}, comments=${statsData?.commentCount}`);
        setUserProfile(profile);
        setStats(statsData);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isVisible, userId]);

  if (!isVisible || !position) {
    return null;
  }

  // Show loading state while fetching
  if (!userProfile) {
    return (
      <div
        style={{
          position: "fixed",
          top: position?.top || 0,
          left: position?.left || 0,
          zIndex: 1000,
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "14px 16px",
          minWidth: "280px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: "12px", color: "#999" }}>Indlæser...</div>
      </div>
    );
  }

  const isOnline = userProfile.lastActive ? isUserOnline(userProfile.lastActive) : false;
  const memberSinceDate = stats?.memberSinceDate
    ? new Date(stats.memberSinceDate).toLocaleDateString("da-DK")
    : "Ukendt";

  return (
    <div
      style={{
        position: "fixed",
        top: position?.top || 0,
        left: position?.left || 0,
        zIndex: 1000,
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "14px 16px",
        minWidth: "280px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        pointerEvents: "auto",
      }}
    >
      {/* Header med avatar og navn */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "6px",
            backgroundColor: "var(--accent-color)",
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {userProfile.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt={userName}
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
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
          )}

          {/* Online indikator */}
          {isOnline && (
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
            />
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              fontSize: "14px",
              color: "#1a1a1a",
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: isOnline ? "#4caf50" : "#999",
              marginTop: "2px",
              fontWeight: "500",
            }}
          >
            {isOnline ? "🟢 Online" : "⚫ Offline"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1a1a1a",
            }}
          >
            {stats?.postCount || 0}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              marginTop: "2px",
            }}
          >
            Opslag
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1a1a1a",
            }}
          >
            {stats?.commentCount || 0}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              marginTop: "2px",
            }}
          >
            Kommentarer
          </div>
        </div>
      </div>

      {/* Aktivitet badge */}
      {stats && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#666",
            }}
          >
            Aktivitet:
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor:
                stats.activityLevel === "Ekspert"
                  ? "#ffc107"
                  : stats.activityLevel === "Erfaren"
                  ? "#2196F3"
                  : "#4caf50",
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
            }}
          >
            {stats.activityLevel}
          </span>
        </div>
      )}

      {/* Member siden */}
      <div
        style={{
          fontSize: "11px",
          color: "#999",
          borderTop: "1px solid #eee",
          paddingTop: "10px",
          textAlign: "center",
        }}
      >
        Medlem siden {memberSinceDate}
      </div>
    </div>
  );
}

export default UserHoverCard;
