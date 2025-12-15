// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "./CreatePostModal";

import {
  listenToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationsService";

function Navbar({
  pageTitle = "Alle opslag",
  searchQuery = "",
  onSearchChange,
}) {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [isOpen, setOpen] = useState(false);

  // 🔔 Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const displayName = profile?.displayName || user?.email || "";

  // 🔔 Live notifications
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

  // 🔔 Luk dropdown ved klik udenfor
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function notificationText(n) {
    const name = n.fromUserName || "Ukendt bruger";
    if (n.type === "comment") return `${name} kommenterede dit opslag`;
    if (n.type === "like") return `${name} likede dit opslag`;
    return `${name} interagerede med dit opslag`;
  }

  async function handleClickNotification(n) {
    if (!n.isRead) {
      await markNotificationRead(n.id);
    }

    if (n.groupId) navigate(`/groups/${n.groupId}`);
    else navigate("/");

    setNotifOpen(false);
  }

  async function handleMarkAllRead() {
    if (user?.uid) {
      await markAllNotificationsRead(user.uid);
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

  return (
    <>
      <header className="navbar">
        {/* LEFT */}
        <div className="navbar-left">
          <button
            type="button"
            className="navbar-app-title-btn"
            onClick={() => navigate("/home")}
            title="Gå til forsiden"
          >
            Chat Forum
          </button>
        </div>

        {/* CENTER */}
        <div className="navbar-center">
          <div className="navbar-page-title navbar-page-title--big">
            {pageTitle}
          </div>
        </div>

        {/* RIGHT */}
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
                <span className="navbar-username-muted">
                  {displayName}
                </span>
              )}
            </>
          )}

          {/* 🔔 Notifications */}
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

                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      Ingen notifikationer endnu.
                    </div>
                  ) : (
                    <div className="notif-list">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className={`notif-item ${
                            n.isRead ? "is-read" : "is-unread"
                          }`}
                          onClick={() => handleClickNotification(n)}
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
            <input
              className="navbar-search navbar-search--right"
              placeholder="Søg i opslag…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
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
    </>
  );
}

export default Navbar;