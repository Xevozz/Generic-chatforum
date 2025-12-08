// src/pages/loginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// TODO: Importer auth-service / Firebase når I kobler rigtig login på.

function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email eller bruger-id
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("Udfyld både email / bruger-ID og password.");
      return;
    }

    try {
      setLoading(true);

      // TODO: Her skal I kalde jeres rigtige login-funktion
      // fx: await login(identifier, password);
      console.log("Logging in with:", { identifier, password });

      // Midlertidigt: sender brugeren til forsiden / homePage
      navigate("/home");
    } catch (err) {
      console.error("Login-fejl:", err);
      setError("Login mislykkedes. Tjek dine oplysninger.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log ind</h1>
        <p className="auth-subtitle">
          Log ind med din email eller dit bruger-ID.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email eller bruger-ID
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="fx niklas@example.com eller niklas123"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Har du ikke en bruger?</span>
          {/* Link til opret-bruger siden */}
          <Link to="/create-user" className="auth-link-btn">
            Opret bruger
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;