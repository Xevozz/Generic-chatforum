// src/Pages/groupPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import PostList from "../components/Posts/PostList";

function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);

  // Hent gruppens data (navn osv.) ud fra URL'ens groupId
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

  const title = group?.name || "Gruppe";

  return (
    <div>
      {/* Topbar – viser gruppenavn i midten */}
      <Navbar pageTitle={title} />

      {/* Samme 3-kolonne layout som på forsiden */}
      <div className="layout-grid">
        <Sidebar />

        <div className="feed">
          {/* Ekstra overskrift inde i selve feedet (valgfri) */}
          <h2>{title}</h2>

          {/* Viser kun opslag fra denne gruppe */}
          <PostList groupId={groupId} />
        </div>

        <RightPanel />
      </div>
    </div>
  );
}

export default GroupPage;