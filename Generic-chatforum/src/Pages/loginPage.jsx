import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmailOrUsername } from "../services/authService";

function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email eller brugernavn
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
      await loginWithEmailOrUsername(identifier.trim(), password);
      navigate("/home");
    } catch (err) {
      console.error("Login-fejl:", err);
      setError(err?.message || "Login mislykkedes. Tjek dine oplysninger.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page--clean">
      <header className="auth-topbar">
        <div className="auth-brand">
        </div>
      </header>

      <main className="auth-shell">
        <div className="auth-card auth-card--lift">
          <div className="auth-card-header">
            <h1 className="auth-title">Log ind</h1>
            <p className="auth-subtitle">
              Brug din email eller dit brugernavn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="identifier">
                Email eller brugernavn
              </label>
              <div className="auth-inputwrap">
                <span className="auth-inputicon" aria-hidden="true">👤</span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="fx niklas@example.com eller niklas123"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>

              <div className="auth-inputwrap">
                <span className="auth-inputicon" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPw((v) => !v)}
                  disabled={loading}
                  aria-label={showPw ? "Skjul password" : "Vis password"}
                  title={showPw ? "Skjul password" : "Vis password"}
                >
                  {showPw ? "Skjul" : "Vis"}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-errorbox" role="alert">
                <span className="auth-erroricon" aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-primary-btn auth-primary-btn--big"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Logger ind...
                </>
              ) : (
                "Log ind"
              )}
            </button>

            <div className="auth-hint">
              Ved login accepterer du, at appen bruger din konto til at vise indhold tilknyttet dig.
            </div>
          </form>

          <div className="auth-footer auth-footer--split">
            <span>Har du ikke en bruger?</span>
            <Link to="/create-user" className="auth-link-btn">
              Opret bruger
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;