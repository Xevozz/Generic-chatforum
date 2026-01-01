import { useState, useEffect } from 'react';
import { getUserByUid } from '../services/userService';
import { 
  getChatId,
  subscribeToChatMessages,
  markChatAsRead 
} from '../services/chatService';

function ChatsList({ user, profile, isOpen, onClose, onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    const loadChats = async () => {
      try {
        setLoading(true);
        
        // Lad mig hente alle chats fra Firestore
        const { subscribeToUserChats } = await import('../services/chatService');
        
        const unsubscribe = subscribeToUserChats(user.uid, async (chatsList) => {
          // For hver chat, hent info om den anden bruger
          const chatsWithUsers = await Promise.all(
            chatsList.map(async (chat) => {
              const otherUserId = chat.participants.find(id => id !== user.uid);
              const otherUser = await getUserByUid(otherUserId);
              
              return {
                ...chat,
                otherUserId,
                otherUser: otherUser || { displayName: 'Ukendt', id: otherUserId }
              };
            })
          );
          
          setChats(chatsWithUsers);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Fejl ved hentning af chats:", err);
        setLoading(false);
      }
    };

    const unsubPromise = loadChats();

    return () => {
      unsubPromise.then(unsub => unsub?.());
    };
  }, [isOpen, user?.uid]);

  const handleSelectChat = async (chat) => {
    // Markér som læst
    await markChatAsRead(chat.id, user.uid);
    
    // Fortæl parent-komponenten hvilken chat der blev valgt
    onSelectChat({
      chatId: chat.id,
      otherUser: chat.otherUser,
      otherUserId: chat.otherUserId
    });
    
    // Luk ChatsList
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 998,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg-color)',
          borderRadius: '12px',
          border: '1px solid var(--card-border-color)',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--card-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--input-bg)',
          }}
        >
          <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '700' }}>
            💬 Mine beskeder
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: 'var(--text-primary)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Chat List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              Indlæser chats...
            </div>
          ) : chats.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <p>Du har ingen aktive chats endnu</p>
              <p style={{ fontSize: '12px' }}>Besøg en brugers profil og start en chat! 💬</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'background 0.2s ease',
                  textAlign: 'left',
                  color: 'inherit',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--input-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--accent-color)',
                    flexShrink: 0,
                  }}
                >
                  {chat.otherUser?.profilePicture ? (
                    <img
                      src={chat.otherUser.profilePicture}
                      alt={chat.otherUser.displayName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {(chat.otherUser?.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: chat.unreadCount > 0 ? '700' : '600',
                      color: chat.unreadCount > 0 ? 'var(--accent-color)' : 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {chat.otherUser?.displayName || 'Ukendt bruger'}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: chat.unreadCount > 0 ? 'var(--accent-color)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: chat.unreadCount > 0 ? '500' : 'normal',
                    }}
                  >
                    {chat.lastMessage || 'Ingen beskeder endnu'}
                  </div>
                </div>

                {/* Time & Unread Badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {chat.lastMessageTime && (
                      <>
                        {new Date(chat.lastMessageTime.toDate?.() || chat.lastMessageTime).toLocaleDateString('da-DK', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--accent-color)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatsList;
