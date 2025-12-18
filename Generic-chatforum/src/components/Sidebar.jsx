import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { listenToGroups } from "../services/groupService";

function Sidebar() {
  const [groups, setGroups] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const unsub = listenToGroups((loadedGroups) => {
      setGroups(loadedGroups);
    });
    return () => unsub();
  }, []);

  // Check which group is active based on current path
  const isAllPostsActive = location.pathname === "/home";
  
  return (
    <aside className="sidebar">
      <h3>Grupper</h3>
      <ul>
        <li>
          <Link
            to="/home"
            style={{
              fontWeight: isAllPostsActive ? "700" : "400",
              color: isAllPostsActive ? "var(--accent-color)" : "inherit",
              opacity: isAllPostsActive ? "1" : "0.7",
            }}
          >
            Alle opslag
          </Link>
        </li>

        {groups.map((g) => {
          const isActive = location.pathname === `/groups/${g.id}`;
          return (
            <li key={g.id}>
              <Link
                to={`/groups/${g.id}`}
                style={{
                  fontWeight: isActive ? "700" : "400",
                  color: isActive ? "var(--accent-color)" : "inherit",
                  opacity: isActive ? "1" : "0.7",
                }}
              >
                {g.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default Sidebar;