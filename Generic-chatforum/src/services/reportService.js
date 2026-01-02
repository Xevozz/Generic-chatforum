// src/services/reportService.js
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Opret en rapport
export async function createReport({
  postId,
  postTitle,
  postContent,
  postAuthorId,
  postAuthorName,
  reporterId,
  reporterName,
  reason,
  details = "",
}) {
  const reportRef = doc(collection(db, "reports"));
  
  await setDoc(reportRef, {
    id: reportRef.id,
    postId,
    postTitle,
    postContent,
    postAuthorId,
    postAuthorName,
    reporterId,
    reporterName,
    reason,
    details,
    status: "pending", // pending, approved, hidden, deleted
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reportRef.id;
}

// Hent alle rapporter (til admin)
export async function getAllReports() {
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Real-time listener til rapporter
export function subscribeToReports(callback) {
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(reports);
  }, (error) => {
    console.error("Fejl ved real-time reports listener:", error);
  });
}

// Hent rapporter efter status
export async function getReportsByStatus(status) {
  const reportsRef = collection(db, "reports");
  const q = query(
    reportsRef, 
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Opdater rapport status
export async function updateReportStatus(reportId, status, adminId, adminNote = "") {
  const reportRef = doc(db, "reports", reportId);
  
  await updateDoc(reportRef, {
    status,
    handledBy: adminId,
    adminNote,
    updatedAt: serverTimestamp(),
  });
}

// Godkend rapport (marker opslaget som OK)
export async function approveReport(reportId, adminId, adminNote = "") {
  await updateReportStatus(reportId, "approved", adminId, adminNote);
}

// Skjul opslaget
export async function hidePost(reportId, postId, adminId, adminNote = "") {
  // Opdater post til at være skjult
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    isHidden: true,
    hiddenAt: serverTimestamp(),
    hiddenBy: adminId,
  });
  
  // Opdater rapport status
  await updateReportStatus(reportId, "hidden", adminId, adminNote);
}

// Slet opslaget
export async function deleteReportedPost(reportId, postId, adminId, adminNote = "") {
  // Slet post
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
  
  // Opdater rapport status
  await updateReportStatus(reportId, "deleted", adminId, adminNote);
}

// Slet rapport
export async function deleteReport(reportId) {
  const reportRef = doc(db, "reports", reportId);
  await deleteDoc(reportRef);
}

// Tjek om bruger er admin
export async function checkIsAdmin(userId) {
  if (!userId) return false;
  
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().isAdmin === true;
  }
  
  return false;
}

// Gør en bruger til admin (kun for setup)
export async function setUserAsAdmin(userId, isAdmin = true) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isAdmin,
    updatedAt: serverTimestamp(),
  });
}
