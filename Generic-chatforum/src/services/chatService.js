// src/services/chatService.js
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { createChatNotification } from "./notificationsService";

// Opretter standardiseret chat-id mellem to brugere
export function getChatId(userId1, userId2) {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}_${ids[1]}`;
}

// Sender en besked
export async function sendMessage(chatId, senderId, senderName, senderAvatar, messageText, recipientId) {
  if (!messageText.trim()) {
    throw new Error("Beskeden kan ikke være tom");
  }

  const messagesRef = collection(db, "chats", chatId, "messages");
  const newMessageRef = doc(messagesRef);

  await setDoc(newMessageRef, {
    id: newMessageRef.id,
    senderId,
    senderName,
    senderAvatar,
    text: messageText.trim(),
    timestamp: serverTimestamp(),
    isRead: false,
  });

  // Opdater chat-dokumentet med seneste besked
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: messageText.trim(),
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Send notifikation til modtager
  if (recipientId) {
    try {
      await createChatNotification({
        toUserId: recipientId,
        fromUserId: senderId,
        fromUserName: senderName,
        messagePreview: messageText,
      });
    } catch (err) {
      console.error("Fejl ved sending af notifikation:", err);
    }
  }

  return newMessageRef.id;
}

// Real-time listener på chat-beskeder
export function subscribeToChatMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.error("Fejl ved real-time chat:", error);
  });

  return unsubscribe;
}

// Henter eller opretter chat-dokument
export async function getOrCreateChat(userId1, userId2, user1Name, user1Avatar, user2Name, user2Avatar) {
  const chatId = getChatId(userId1, userId2);
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      // Opret ny chat
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        participantNames: [user1Name, user2Name],
        participantAvatars: [user1Avatar, user2Avatar],
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return chatId;
  } catch (error) {
    console.error("Fejl ved oprettelse af chat:", error);
    throw error;
  }
}

// Markér alle beskeder som læst
export async function markChatAsRead(chatId, userId) {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(
      messagesRef,
      where("isRead", "==", false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      const msg = doc.data();
      // Kun markér beskeder som blev sendt AF ANDRE (ikke af brugeren selv)
      if (msg.senderId !== userId) {
        batch.update(doc.ref, { isRead: true });
      }
    });

    // Opdater også chat-dokumentet så subscribeToUserChats triggeres
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, {
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error("Fejl ved markering af chat som læst:", error);
  }
}
// Real-time listener på alle chats for en bruger
export function subscribeToUserChats(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  const unreadListeners = new Map();
  let isInitialized = false;

  // Listen til chats
  const chatsUnsub = onSnapshot(q, (snapshot) => {
    const chatIds = new Set();

    // Opbyg chats med unread count
    const processChats = async () => {
      const chatsWithUnread = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatId = doc.id;
          const chatData = doc.data();
          const otherUserId = chatData.participants.find(id => id !== userId);

          chatIds.add(chatId);

          // Hent ulæste messages for denne chat
          const messagesRef = collection(db, "chats", chatId, "messages");
          const unreadQuery = query(
            messagesRef,
            where("isRead", "==", false),
            where("senderId", "==", otherUserId)
          );

          const unreadSnapshot = await getDocs(unreadQuery);

          // Setup real-time listener hvis ikke allerede gjort
          if (!unreadListeners.has(chatId)) {
            const unreadUnsub = onSnapshot(unreadQuery, () => {
              // Når messages ændres, refresh hele listen
              processChats();
            });
            unreadListeners.set(chatId, unreadUnsub);
          }

          return {
            id: chatId,
            ...chatData,
            unreadCount: unreadSnapshot.size,
            otherUserId,
          };
        })
      );

      // Cleanup listeners for deleted chats
      for (const [chatId, unsub] of unreadListeners.entries()) {
        if (!chatIds.has(chatId)) {
          unsub();
          unreadListeners.delete(chatId);
        }
      }

      // Callback med data
      callback(chatsWithUnread);
      isInitialized = true;
    };

    processChats().catch(err => {
      console.error("Fejl ved processing af chats:", err);
      if (!isInitialized) {
        callback([]);
        isInitialized = true;
      }
    });
  }, (error) => {
    console.error("Fejl ved real-time chats listener:", error);
    if (!isInitialized) {
      callback([]);
      isInitialized = true;
    }
  });

  // Return cleanup function
  return () => {
    chatsUnsub();
    unreadListeners.forEach(unsub => unsub());
    unreadListeners.clear();
  };
}