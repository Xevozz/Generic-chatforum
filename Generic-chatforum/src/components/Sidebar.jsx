import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { listenToUserGroups, getGroupById } from "../services/groupService";
import { getUserByUid } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import ExploreGroupsModal from "./ExploreGroupsModal";

function Sidebar() {
  const [groups, setGroups] = useState([]);
  const [exploreModalOpen, setExploreModalOpen] = useState(false);
  const [activeGroupMembers, setActiveGroupMembers] = useState([]);
  const [activeGroupName, setActiveGroupName] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setGroups([]);
      return;
    }

    const unsub = listenToUserGroups(user.uid, (loadedGroups) => {
      setGroups(loadedGroups);
    });
    return () => unsub();
  }, [user?.uid]);

  // Check which group is active based on current path
  const isAllPostsActive = location.pathname === "/home";

  // Extract active group ID from URL
  const activeGroupId = location.pathname.startsWith("/groups/")
    ? location.pathname.split("/groups/")[1]
    : null;

  // Fetch members when active group changes
  useEffect(() => {
    if (!activeGroupId) {
      setActiveGroupMembers([]);
      setActiveGroupName("");
      return;
    }

    async function fetchGroupMembers() {
      setLoadingMembers(true);
      try {
        const group = await getGroupById(activeGroupId);
        if (group && group.members && group.members.length > 0) {
          setActiveGroupName(group.name);
          // Fetch user data for each member
          const memberPromises = group.members.map(async (memberId) => {
            const userData = await getUserByUid(memberId);
            return userData;
          });
          const members = await Promise.all(memberPromises);
          // Filter out null values (deleted users)
          setActiveGroupMembers(members.filter(Boolean));
        } else {
          setActiveGroupMembers([]);
          setActiveGroupName(group?.name || "");
        }
      } catch (error) {
        console.error("Error fetching group members:", error);
        setActiveGroupMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    }

    fetchGroupMembers();
  }, [activeGroupId]);
  
  return (
    <aside className="sidebar">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <h3 style={{ margin: 0 }}>Mine Grupper</h3>
        <button
          onClick={() => setExploreModalOpen(true)}
          title="Udforsk grupper"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "background 0.2s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "var(--input-bg)"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          🌐
        </button>
      </div>
      
      <ul>
        <li>
          <Link
            to="/home"
            style={{
              fontWeight: isAllPostsActive ? "700" : "400",
              color: isAllPostsActive ? "var(--accent-color)" : "inherit",
              opacity: isAllPostsActive ? "1" : "0.7",
            }}
          >
            📰 Mit feed
          </Link>
        </li>

        {groups.length === 0 && user?.uid && (
          <li style={{ 
            padding: "12px 0", 
            color: "var(--text-secondary)", 
            fontSize: "13px",
            opacity: 0.7,
          }}>
            Du er ikke medlem af nogen grupper endnu.
            <button
              onClick={() => setExploreModalOpen(true)}
              style={{
                display: "block",
                marginTop: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent-color)",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                width: "100%",
              }}
            >
              🌐 Udforsk grupper
            </button>
          </li>
        )}

        {groups.map((g) => {
          const isActive = location.pathname === `/groups/${g.id}`;
          return (
            <li key={g.id}>
              <Link
                to={`/groups/${g.id}`}
                style={{
                  fontWeight: isActive ? "700" : "400",
                  color: isActive ? "var(--accent-color)" : "inherit",
                  opacity: isActive ? "1" : "0.7",
                }}
              >
                {g.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Udforsk grupper knap i bunden */}
      {groups.length > 0 && (
        <button
          onClick={() => setExploreModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            marginTop: "16px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px dashed var(--card-border-color)",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--input-bg)";
            e.currentTarget.style.borderStyle = "solid";
            e.currentTarget.style.color = "var(--accent-color)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderStyle = "dashed";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          🌐 Udforsk grupper
        </button>
      )}

      {/* Medlems-boks - kun vist når en gruppe er aktiv */}
      {activeGroupId && (
        <div style={{
          marginTop: "20px",
          background: "var(--card-bg)",
          borderRadius: "12px",
          border: "1px solid var(--card-border-color)",
          overflow: "hidden",
        }}>
          {/* Header - klikbar for at udvide */}
          <button
            onClick={() => setMembersExpanded(!membersExpanded)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>👥</span>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Medlemmer</span>
              <span style={{
                background: "var(--accent-color)",
                color: "white",
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "10px",
                minWidth: "20px",
                textAlign: "center",
              }}>
                {loadingMembers ? "..." : activeGroupMembers.length}
              </span>
            </div>
            <span style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              transition: "transform 0.2s ease",
              transform: membersExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}>
              ▼
            </span>
          </button>

          {/* Stacked avatars preview når lukket */}
          {!membersExpanded && !loadingMembers && activeGroupMembers.length > 0 && (
            <div style={{
              padding: "0 14px 12px 14px",
              display: "flex",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", marginLeft: "8px" }}>
                {activeGroupMembers.slice(0, 5).map((member, index) => (
                  <div
                    key={member.id}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid var(--card-bg)",
                      marginLeft: index === 0 ? "0" : "-10px",
                      position: "relative",
                      zIndex: 5 - index,
                    }}
                  >
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.displayName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        background: "linear-gradient(135deg, var(--accent-color), #8b5cf6)",
                        color: "white",
                        fontWeight: "600",
                      }}>
                        {(member.displayName || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {activeGroupMembers.length > 5 && (
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--input-bg)",
                    border: "2px solid var(--card-bg)",
                    marginLeft: "-10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                  }}>
                    +{activeGroupMembers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Udvidet medlemsliste */}
          {membersExpanded && (
            <div style={{
              borderTop: "1px solid var(--card-border-color)",
              maxHeight: "250px",
              overflowY: "auto",
            }}>
              {loadingMembers ? (
                <div style={{
                  padding: "16px",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  textAlign: "center",
                }}>
                  Indlæser medlemmer...
                </div>
              ) : activeGroupMembers.length === 0 ? (
                <div style={{
                  padding: "16px",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  textAlign: "center",
                }}>
                  Ingen medlemmer fundet
                </div>
              ) : (
                <ul style={{
                  listStyle: "none",
                  padding: "8px",
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}>
                  {activeGroupMembers.map((member) => (
                    <li key={member.id}>
                      <Link
                        to={member.id === user?.uid ? "/my-profile" : `/user/${member.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background 0.2s ease",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "var(--input-bg)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}>
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt={member.displayName || "Bruger"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              background: "linear-gradient(135deg, var(--accent-color), #8b5cf6)",
                              color: "white",
                              fontWeight: "600",
                            }}>
                              {(member.displayName || "?")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: member.id === user?.uid ? "600" : "400",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {member.displayName || "Ukendt bruger"}
                          {member.id === user?.uid && (
                            <span style={{
                              marginLeft: "6px",
                              fontSize: "11px",
                              color: "var(--accent-color)",
                              fontWeight: "500",
                            }}>
                              (dig)
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explore Groups Modal */}
      <ExploreGroupsModal
        isOpen={exploreModalOpen}
        onClose={() => setExploreModalOpen(false)}
      />
    </aside>
  );
}

export default Sidebar;