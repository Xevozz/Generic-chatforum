

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
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
    <header className="navbar">
      {/* Venstre – titel */}
      <div className="navbar-left">
        <span className="navbar-app-title">Chat Forum</span>
      </div>

      {/* Midten – din søgning / “Alle opslag” osv. (kan være som før) */}
      <div className="navbar-center">
        {/* ... eksisterende søgefelt + fane ... */}
      </div>

      {/* Højre – brugernavn + knap */}
      <div className="navbar-right">
        {profile && (
          <span className="navbar-username">
            {profile.displayName || user.email}
          </span>
        )}

        <button className="btn btn-primary" onClick={handleLoginLogout}>
          {user ? "Log ud" : "Log ind"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;