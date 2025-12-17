import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listenToGroups } from "../services/groupService";

function Sidebar() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const unsub = listenToGroups((loadedGroups) => {
      setGroups(loadedGroups);
    });
    return () => unsub();
  }, []);

  return (
    <aside className="sidebar">
      <h3>Grupper</h3>
      <ul>
        <li>
          <Link to="/home">Alle opslag</Link>
        </li>

        {groups.map((g) => (
          <li key={g.id}>
            <Link to={`/groups/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;