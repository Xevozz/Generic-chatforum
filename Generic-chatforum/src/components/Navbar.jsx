// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "./CreatePostModal";
import AdvancedSearchModal from "./AdvancedSearchModal";
import PostModal from "./PostModal.jsx";

import {
  listenToNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationsService";

function Navbar({
  pageTitle = "Alle opslag",
  searchQuery = "",
  onSearchChange,
  onApplyAdvancedFilters,
  showHomeButton = false,
}) {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [isOpen, setOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // PostModal state
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const displayName = profile?.displayName || user?.email || "";

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const unsub = listenToNotifications(user.uid, setNotifications, {
      limit: 25,
    });

    return () => unsub && unsub();
  }, [user?.uid]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }

    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  // ✅ Bulletproof: når vi har et postId, så åbn modal automatisk
  useEffect(() => {
    if (selectedPostId) setPostModalOpen(true);
  }, [selectedPostId]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  function notificationText(n) {
    const name = n.fromUserName || "Ukendt bruger";
    if (n.type === "comment") return `${name} kommenterede dit opslag`;
    if (n.type === "like") return `${name} likede dit opslag`;
    return `${name} interagerede med dit opslag`;
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      if (user?.uid) await markAllNotificationsRead(user.uid);
    } catch (e) {
      console.error("Fejl ved markér alle som læst:", e);
    }
  }

  async function handleNotificationClick(notification) {
    try {
      // ✅ Korrekt: markNotificationRead tager KUN notificationId
      if (!notification.isRead) {
        await markNotificationRead(notification.id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      setNotifOpen(false);

      // ✅ Sæt postId (modal åbner via useEffect ovenfor)
      if (notification.postId) {
        setSelectedPostId(notification.postId);
      } else {
        console.warn("Notifikation mangler postId:", notification);
      }
    } catch (error) {
      console.error("Fejl ved håndtering af notifikation:", error);
    }
  }

  async function handleLoginLogout() {
    if (user) {
      await logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  function handleApplyFilters(filters) {
    if (onApplyAdvancedFilters) {
      onApplyAdvancedFilters(filters);
    }
    setAdvancedSearchOpen(false);
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          {showHomeButton && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/home")}
              title="Gå til forsiden"
              style={{ marginRight: "12px" }}
            >
              ← Forside
            </button>
          )}
          <button
            type="button"
            className="navbar-app-title-btn"
            onClick={() => navigate("/home")}
            title="Gå til forsiden"
          >
            Chat Forum
          </button>
        </div>

        <div className="navbar-center">
          <div className="navbar-page-title navbar-page-title--big">
            {pageTitle}
          </div>
        </div>

        <div className="navbar-right">
          {user && (
            <>
              <button
                className="navbar-profile-btn"
                onClick={() => navigate("/my-profile")}
                title="Gå til min profil"
              >
                Min profil
              </button>

              {displayName && (
                <span className="navbar-username-muted">{displayName}</span>
              )}
            </>
          )}

          {user && (
            <div className="notif" ref={notifRef}>
              <button
                type="button"
                className="btn btn-outline notif-btn"
                onClick={() => setNotifOpen((v) => !v)}
                title="Notifikationer"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifikationer</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notif-markall"
                        onClick={handleMarkAllRead}
                      >
                        Markér alle som læst
                      </button>
                    )}
                  </div>

                  {unreadNotifications.length === 0 ? (
                    <div className="notif-empty">Ingen notifikationer endnu.</div>
                  ) : (
                    <div className="notif-list">
                      {unreadNotifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="notif-item is-unread"
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-item-text">
                            {notificationText(n)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {typeof onSearchChange === "function" && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="navbar-search navbar-search--right"
                placeholder="Søg i opslag…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <button
                className="btn btn-outline"
                onClick={() => setAdvancedSearchOpen(true)}
                title="Avanceret søgning"
                style={{ whiteSpace: "nowrap" }}
              >
                🔍 Filtrer Søgning
              </button>
            </div>
          )}

          {user && (
            <button className="btn btn-outline" onClick={() => setOpen(true)}>
              Lav opslag
            </button>
          )}

          <button
            className={`btn ${user ? "btn-logout" : "btn-primary"}`}
            onClick={handleLoginLogout}
          >
            {user ? "Log ud" : "Log ind"}
          </button>
        </div>
      </header>

      <CreatePostModal isOpen={isOpen} onClose={() => setOpen(false)} />
      <AdvancedSearchModal
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
      <PostModal
        postId={selectedPostId}
        isOpen={postModalOpen}
        onClose={() => {
          setPostModalOpen(false);
          setSelectedPostId(null);
        }}
      />
    </>
  );
}

export default Navbar;