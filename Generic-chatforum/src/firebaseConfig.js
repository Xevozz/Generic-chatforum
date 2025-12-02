import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoS0RWPkMgVDHmFQ-vARaAJJCMb_uJU-E",
  authDomain: "generic-chat-forum-firebase.firebaseapp.com",
  projectId: "generic-chat-forum-firebase",
  storageBucket: "generic-chat-forum-firebase.firebasestorage.app",
  messagingSenderId: "221994763266",
  appId: "1:221994763266:web:79a20991e97b6f9a08d31b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);