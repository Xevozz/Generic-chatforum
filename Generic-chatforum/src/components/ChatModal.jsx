// src/components/ChatModal.jsx
// ======================================================
// Modal til privat chat mellem to brugere
// ======================================================
import { useState, useEffect, useRef } from "react";
import {
  getOrCreateChat,
  subscribeToChatMessages,
  sendMessage,
  markChatAsRead,
} from "../services/chatService";

function ChatModal({ user, profile, otherUser, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatIdRef = useRef(null);

  // Scroll til bund
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll til bund med smooth behavior
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll når messages opdateres
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, loading]);

  // Scroll til bund når modal åbner
  useEffect(() => {
    if (isOpen && !loading) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isOpen, loading]);

  // Setup chat når modal åbner
  useEffect(() => {
    if (!isOpen || !user || !profile || !otherUser) {
      return;
    }

    const setupChat = async () => {
      try {
        setLoading(true);
        setError("");

        // Opret eller hent chat
        const chatId = await getOrCreateChat(
          user.uid,
          otherUser.id,
          profile.displayName,
          profile.profilePicture || "",
          otherUser.displayName,
          otherUser.profilePicture || ""
        );

        chatIdRef.current = chatId;

        // Abonner på beskeder
        const unsubscribe = subscribeToChatMessages(chatId, setMessages);

        // Markér som læst
        await markChatAsRead(chatId, user.uid);

        setLoading(false);

        return unsubscribe;
      } catch (err) {
        console.error("Fejl ved setup af chat:", err);
        setError("Fejl ved indlæsning af chat");
        setLoading(false);
      }
    };

    let unsubscribePromise = setupChat();

    return () => {
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, [isOpen, user, profile, otherUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;
    if (!chatIdRef.current) return;

    setSending(true);
    setError("");

    try {
      await sendMessage(
        chatIdRef.current,
        user.uid,
        profile.displayName,
        profile.profilePicture || "",
        messageText,
        otherUser.id
      );

      setMessageText("");
    } catch (err) {
      console.error("Fejl ved sending af besked:", err);
      setError("Fejl ved sending af besked");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--card-bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--card-border-color)",
          width: "90%",
          maxWidth: "600px",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--card-border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--input-bg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "var(--accent-color)",
              }}
            >
              {otherUser?.profilePicture ? (
                <img
                  src={otherUser.profilePicture}
                  alt={otherUser.displayName}
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
                    fontWeight: "bold",
                  }}
                >
                  {(otherUser?.displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>
                {otherUser?.displayName}
              </h3>
              <p style={{ margin: "0", fontSize: "12px", color: "var(--text-secondary)" }}>
                Privat chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
            title="Luk chat"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "var(--primary-color)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 16px" }}>
              Indlæser chat...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 16px" }}>
              <p>Ingen beskeder endnu. Start samtalen! 💬</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.senderId === user.uid ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-end",
                    flexDirection: msg.senderId === user.uid ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "var(--accent-color)",
                      flexShrink: 0,
                    }}
                  >
                    {msg.senderAvatar ? (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
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
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {(msg.senderName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: msg.senderId === user.uid ? "var(--button-bg)" : "var(--input-bg)",
                      color: msg.senderId === user.uid ? "white" : "var(--text-primary)",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      wordWrap: "break-word",
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        fontSize: "11px",
                        opacity: 0.7,
                        marginTop: "4px",
                      }}
                    >
                      {msg.timestamp
                        ? new Date(msg.timestamp.toDate?.() || msg.timestamp).toLocaleTimeString("da-DK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "..."}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--card-border-color)",
            backgroundColor: "var(--input-bg)",
          }}
        >
          {error && (
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#f44336" }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Skriv en besked..."
              disabled={sending || loading}
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: "20px",
                fontSize: "14px",
                backgroundColor: "var(--card-bg-color)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim() || loading}
              style={{
                padding: "10px 20px",
                backgroundColor: sending || loading ? "#ccc" : "var(--button-bg)",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: sending || !messageText.trim() || loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {sending ? "Sender..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
