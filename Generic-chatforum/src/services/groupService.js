import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Hent alle grupper live
export function listenToGroups(callback) {
  const groupsRef = collection(db, "groups");

  return onSnapshot(groupsRef, (snapshot) => {
    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(groups);
  });
}

// Opret en ny gruppe
export async function createGroup(name) {
  const groupsRef = collection(db, "groups");
  return addDoc(groupsRef, {
    name,
    createdAt: serverTimestamp(),
  });
}