// src/components/Navbar.jsx
// ======================================================
// Navigationsbar med søgning, notifikationer, chat og bruger-menu
// ======================================================
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "./CreatePostModal";
import AdvancedSearchModal from "./AdvancedSearchModal";
import PostModal from "./PostModal.jsx";
import NotificationBanner from "./NotificationBanner";
import ChatsList from "./ChatsList";
import ChatModal from "./ChatModal";

import {
  listenToNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationsService";
import { getUserByUid } from "../services/userService";
import { subscribeToUserChats } from "../services/chatService";
import { checkIsAdmin } from "../services/reportService";

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

  // Banner notifikation state
  const [bannerNotif, setBannerNotif] = useState(null);

  // PostModal state
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  // ChatsList state
  const [chatsListOpen, setChatsListOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [chats, setChats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const displayName = profile?.displayName || user?.email || "";

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.uid) {
        setIsAdmin(false);
        return;
      }
      const adminStatus = await checkIsAdmin(user.uid);
      setIsAdmin(adminStatus);
    }
    checkAdmin();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const unsub = listenToNotifications(user.uid, (newNotifications) => {
      // Tjek hvis nye chat-notifikationer er kommet
      const newChatNotifs = newNotifications.filter(n => n.type === 'chat' && !n.isRead);
      if (newChatNotifs.length > 0) {
        const newest = newChatNotifs[0];
        setBannerNotif({
          id: newest.id,
          message: `💬 ${newest.fromUserName} sendte dig en besked`,
          type: 'chat',
          notification: newest,
        });
      }

      setNotifications(newNotifications);
    }, {
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

  // Listen til chats for at tælle ulæste beskeder
  useEffect(() => {
    if (!user?.uid) {
      setTotalUnreadChats(0);
      return;
    }

    const unsubscribe = subscribeToUserChats(user.uid, (chatsList) => {
      setChats(chatsList);
      const totalUnread = chatsList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      setTotalUnreadChats(totalUnread);
    });

    return () => unsubscribe?.();
  }, [user?.uid]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  function notificationText(n) {
    const name = n.fromUserName || "Ukendt bruger";
    if (n.type === "comment") return `${name} kommenterede dit opslag`;
    if (n.type === "like") return `${name} likede dit opslag`;
    if (n.type === "chat") return `💬 ${name} sendte dig en besked`;
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

      // ✅ Hvis det er en chat-notifikation, åbn chat-modalet direkte
      if (notification.type === 'chat' && notification.fromUserId) {
        const otherUser = await getUserByUid(notification.fromUserId);
        setSelectedChat({
          chatId: null,
          otherUser: otherUser || { displayName: 'Ukendt', id: notification.fromUserId },
          otherUserId: notification.fromUserId
        });
        setChatModalOpen(true);
      } else if (notification.postId) {
        // ✅ Sæt postId (modal åbner via useEffect)
        setSelectedPostId(notification.postId);
      } else {
        console.warn("Notifikation mangler type og data:", notification);
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

  function handleChatNotificationClick() {
    if (bannerNotif?.notification?.fromUserId) {
      // Markér som læst
      if (bannerNotif.notification.id && user?.uid) {
        markNotificationRead(bannerNotif.notification.id).catch(e => console.error(e));
      }
      // Navigér til brugerens profil med flag for at åbne chat
      navigate(`/user/${bannerNotif.notification.fromUserId}`, { 
        state: { openChat: true } 
      });
      setBannerNotif(null);
    }
  }

  function handleChatSelected(chatInfo) {
    setSelectedChat(chatInfo);
    setChatModalOpen(true);
    setChatsListOpen(false);
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
          {user && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                className="btn btn-outline"
                onClick={() => setChatsListOpen(true)}
                title="Se alle dine beskeder"
                style={{ marginLeft: "12px" }}
              >
                💬 Beskeder
              </button>
              {totalUnreadChats > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "var(--accent-color)",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {totalUnreadChats}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-center">
          <div className="navbar-page-title navbar-page-title--big">
            {pageTitle}
          </div>
        </div>

        <div className="navbar-right">
          {user && (
            <>
              {isAdmin && (
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/admin")}
                  title="Admin Panel"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "var(--error-color, #ef4444)",
                    color: "var(--error-color, #ef4444)",
                  }}
                >
                  🛡️ Admin
                </button>
              )}
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
            <button
              className="btn btn-outline"
              onClick={() => setAdvancedSearchOpen(true)}
              title="Søg i opslag"
              style={{ 
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔍 Søg i opslag
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

      {/* Chat Notification Banner */}
      {bannerNotif && (
        <NotificationBanner
          message={bannerNotif.message}
          type="chat"
          duration={5000}
          onClick={handleChatNotificationClick}
          onClose={() => {
            setBannerNotif(null);
            // Markér som læst
            if (bannerNotif.notification?.id && user?.uid) {
              markNotificationRead(bannerNotif.notification.id).catch(e => console.error(e));
            }
          }}
        />
      )}

      {/* ChatsList Modal */}
      {user && (
        <ChatsList
          user={user}
          profile={profile}
          isOpen={chatsListOpen}
          onClose={() => setChatsListOpen(false)}
          onSelectChat={handleChatSelected}
        />
      )}

      {/* ChatModal for selected chat */}
      {user && selectedChat && (
        <ChatModal
          user={user}
          profile={profile}
          otherUser={selectedChat.otherUser}
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setSelectedChat(null);
          }}
        />
      )}
    </>
  );
}

export default Navbar;