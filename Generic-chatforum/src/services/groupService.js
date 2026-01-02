import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  query,
  where,
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

// Hent kun grupper som brugeren er medlem af (real-time)
export function listenToUserGroups(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const groupsRef = collection(db, "groups");
  
  return onSnapshot(groupsRef, (snapshot) => {
    const groups = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((group) => {
        const members = group.members || [];
        return members.includes(userId);
      });
    callback(groups);
  });
}

// Hent en enkelt gruppe
export async function getGroupById(groupId) {
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) {
    return null;
  }
  
  return { id: groupSnap.id, ...groupSnap.data() };
}

// Opret en ny gruppe
export async function createGroup(name, creatorId, creatorName) {
  const groupsRef = collection(db, "groups");
  const docRef = await addDoc(groupsRef, {
    name,
    createdBy: creatorId,
    createdByName: creatorName,
    members: [creatorId], // Opretteren er automatisk medlem
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
  return docRef;
}

// Meld ind i en gruppe
export async function joinGroup(groupId, userId) {
  const groupRef = doc(db, "groups", groupId);
  
  await updateDoc(groupRef, {
    members: arrayUnion(userId),
  });

  // Opdater memberCount
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const members = groupSnap.data().members || [];
    await updateDoc(groupRef, {
      memberCount: members.length,
    });
  }
}

// Meld ud af en gruppe
export async function leaveGroup(groupId, userId) {
  const groupRef = doc(db, "groups", groupId);
  
  await updateDoc(groupRef, {
    members: arrayRemove(userId),
  });

  // Opdater memberCount
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const members = groupSnap.data().members || [];
    await updateDoc(groupRef, {
      memberCount: members.length,
    });
  }
}

// Tjek om bruger er medlem af en gruppe
export async function isUserMember(groupId, userId) {
  const group = await getGroupById(groupId);
  if (!group) return false;
  
  const members = group.members || [];
  return members.includes(userId);
}