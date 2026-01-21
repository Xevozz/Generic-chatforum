// src/Pages/groupPage.jsx
// ======================================================
// Side til visning af en specifik gruppes opslag
// ======================================================
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import PostList from "../components/Posts/PostList";
import CreatePost from "../components/Posts/CreatePost";

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState(null);

  useEffect(() => {
    if (!groupId) return;

    const ref = doc(db, "groups", groupId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() });
      } else {
        setGroup(null);
      }
    });

    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    setSearchQuery("");
    setAdvancedFilters(null);
  }, [groupId]);

  const title = group?.name || "Gruppe";

  return (
    <div>
      <Navbar
        pageTitle={title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApplyAdvancedFilters={setAdvancedFilters}
        showHomeButton={true}
      />

      <div className="layout-grid">
        <Sidebar />

        <div className="feed">
          <CreatePost fixedGroupId={groupId} hideGroupSelector />

          <PostList 
            groupId={groupId} 
            searchQuery={searchQuery} 
            advancedFilters={advancedFilters}
          />
        </div>

        <RightPanel />
      </div>
    </div>
  );
}

export default GroupPage;