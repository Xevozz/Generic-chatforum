// src/Pages/groupPage.jsx
import { useParams } from "react-router-dom";
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
  const [group, setGroup] = useState(null);

  // ✅ NYT: søgefelt-state til gruppesiden
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [groupId]);

  const title = group?.name || "Gruppe";

  return (
    <div>
      <Navbar
        pageTitle={title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="layout-grid">
        <Sidebar />

        <div className="feed">
          <CreatePost fixedGroupId={groupId} hideGroupSelector />

          <PostList groupId={groupId} searchQuery={searchQuery} />
        </div>

        <RightPanel />
      </div>
    </div>
  );
}

export default GroupPage;