// src/components/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "./CreatePostModal";

function Navbar({
  pageTitle = "Alle opslag",
  searchQuery = "",
  onSearchChange,
}) {
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  async function handleLoginLogout() {
    if (user) {
      await logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  return (
    <>
      <header className="navbar">
        {/* Left */}
        <div className="navbar-left">
          <span className="navbar-app-title">Chat Forum</span>
        </div>

        {/* Center: kun titel */}
        <div className="navbar-center">
          <div className="navbar-page-title navbar-page-title--big">
            {pageTitle}
          </div>
        </div>

        {/* Right: username + søg + knapper */}
        <div className="navbar-right">
          {profile && (
            <span className="navbar-username">
              {profile.displayName || user.email}
            </span>
          )}

          <input
            className="navbar-search navbar-search--right"
            placeholder="Søg i opslag…"
            value={searchQuery}
            onChange={(e) =>
              onSearchChange ? onSearchChange(e.target.value) : null
            }
          />

          {user && (
            <button className="btn btn-outline" onClick={() => setOpen(true)}>
              Lav opslag
            </button>
          )}

          <button
            className={`btn ${user ? "btn-logout" : "btn-primary"}`}
            onClick={handleLoginLogout}
          >
            {user ? "Log ud" : "Log ind"}
          </button>
        </div>
      </header>

      <CreatePostModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}

export default Navbar;