// src/components/ExploreGroupsModal.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { listenToGroups, joinGroup, leaveGroup, createGroup } from "../services/groupService";
import { useAuth } from "../context/AuthContext";

function ExploreGroupsModal({ isOpen, onClose }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null); // groupId being joined/left
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = listenToGroups((loadedGroups) => {
      setGroups(loadedGroups);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const isMember = (group) => {
    const members = group.members || [];
    return members.includes(user?.uid);
  };

  const handleJoinLeave = async (group) => {
    if (!user?.uid) return;

    setJoining(group.id);
    try {
      if (isMember(group)) {
        await leaveGroup(group.id, user.uid);
      } else {
        await joinGroup(group.id, user.uid);
      }
    } catch (err) {
      console.error("Fejl ved join/leave:", err);
    } finally {
      setJoining(null);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user?.uid) return;

    setCreating(true);
    try {
      await createGroup(
        newGroupName.trim(),
        user.uid,
        profile?.displayName || user.email
      );
      setNewGroupName("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("Fejl ved oprettelse af gruppe:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleGoToGroup = (groupId) => {
    onClose();
    navigate(`/groups/${groupId}`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate into my groups and other groups
  const myGroups = filteredGroups.filter((g) => isMember(g));
  const otherGroups = filteredGroups.filter((g) => !isMember(g));

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
          borderRadius: "16px",
          border: "1px solid var(--card-border-color)",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--card-border-color)",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>🌐</span>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                  Udforsk grupper
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
                  Find og deltag i interessante fællesskaber
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search & Create */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--card-border-color)" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="🔍 Søg efter grupper..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid var(--card-border-color)",
                backgroundColor: "var(--input-bg)",
                fontSize: "14px",
              }}
            />
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                background: showCreateForm ? "var(--text-secondary)" : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {showCreateForm ? "✕ Annuller" : "➕ Opret gruppe"}
            </button>
          </div>

          {/* Create Group Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateGroup} style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Navn på ny gruppe..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--card-border-color)",
                    backgroundColor: "var(--input-bg)",
                    fontSize: "14px",
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creating || !newGroupName.trim()}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#22c55e",
                    color: "white",
                    cursor: creating || !newGroupName.trim() ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    opacity: creating || !newGroupName.trim() ? 0.6 : 1,
                  }}
                >
                  {creating ? "Opretter..." : "Opret"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Groups List */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              <p>Indlæser grupper...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
              <p>Ingen grupper fundet</p>
              {searchTerm && <p style={{ fontSize: "13px" }}>Prøv at søge efter noget andet</p>}
            </div>
          ) : (
            <>
              {/* Mine grupper */}
              {myGroups.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                    marginBottom: "12px",
                  }}>
                    ✅ Mine grupper ({myGroups.length})
                  </h3>
                  {myGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={true}
                      isJoining={joining === group.id}
                      onJoinLeave={() => handleJoinLeave(group)}
                      onGoTo={() => handleGoToGroup(group.id)}
                    />
                  ))}
                </div>
              )}

              {/* Andre grupper */}
              {otherGroups.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                    marginBottom: "12px",
                  }}>
                    🌐 Udforsk ({otherGroups.length})
                  </h3>
                  {otherGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={false}
                      isJoining={joining === group.id}
                      onJoinLeave={() => handleJoinLeave(group)}
                      onGoTo={() => handleGoToGroup(group.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Group Card Component
function GroupCard({ group, isMember, isJoining, onJoinLeave, onGoTo }) {
  const memberCount = group.memberCount || group.members?.length || 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        backgroundColor: "var(--primary-color)",
        borderRadius: "12px",
        border: "1px solid var(--card-border-color)",
        marginBottom: "10px",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{ flex: 1, cursor: "pointer" }}
        onClick={onGoTo}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: isMember
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "var(--input-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: isMember ? "white" : "var(--text-secondary)",
            }}
          >
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
              {group.name}
            </h4>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
              👥 {memberCount} {memberCount === 1 ? "medlem" : "medlemmer"}
              {group.createdByName && (
                <span> • Oprettet af {group.createdByName}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onJoinLeave}
          disabled={isJoining}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: isMember ? "1px solid var(--card-border-color)" : "none",
            backgroundColor: isMember ? "transparent" : "#22c55e",
            color: isMember ? "var(--text-secondary)" : "white",
            cursor: isJoining ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            opacity: isJoining ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {isJoining ? "..." : isMember ? "Forlad" : "➕ Deltag"}
        </button>
        {isMember && (
          <button
            onClick={onGoTo}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--accent-color)",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Åbn →
          </button>
        )}
      </div>
    </div>
  );
}

export default ExploreGroupsModal;
