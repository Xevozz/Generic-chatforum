// src/components/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "./CreatePostModal";

function Navbar({ pageTitle = "Alle opslag" }) {
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
        {/* Left side */}
        <div className="navbar-left">
          <span className="navbar-app-title">Chat Forum</span>
        </div>

        {/* Center: search + page title */}
        <div className="navbar-center">
          <input className="navbar-search" placeholder="Søgefelt" />
          <div className="navbar-page-title">{pageTitle}</div>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {profile && (
            <span className="navbar-username">
              {profile.displayName || user.email}
            </span>
          )}

          {/* Create Post button */}
          {user && (
            <button
              className="btn btn-outline"
              onClick={() => setOpen(true)}
            >
              Lav opslag
            </button>
          )}

          {/* Login/Logout button */}
          <button className="btn btn-primary" onClick={handleLoginLogout}>
            {user ? "Log ud" : "Log ind"}
          </button>
        </div>
      </header>

      {/* Modal */}
      <CreatePostModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default Navbar;