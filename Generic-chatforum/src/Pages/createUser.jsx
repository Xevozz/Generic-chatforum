// src/pages/createUser.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

function CreateUserPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [about, setAbout] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // --- Hjælpefunktioner til validering ---
  // Simpel email-syntax (ikke perfekt, men god nok til klient-side)
  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  // Password: min 8 tegn, mindst ét bogstav + mindst ét tal
  function isStrongPassword(value) {
    if (value.length < 8) return false;

    const hasLetter = /[A-Za-z]/.test(value);
    const hasDigit = /\d/.test(value);

    return hasLetter && hasDigit;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);


    // --- Validering af felter ---
    if (!displayName.trim()) {
      setError("Du skal vælge et brugernavn.");
      return;
    }

    if (!email.trim()) {
      setError("Email skal udfyldes.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Email ser ikke korrekt ud. Tjek at den er skrevet rigtigt.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password skal være mindst 8 tegn og indeholde både tal og bogstaver."
      );
      return;
    }

    if (password !== password2) {
      setError("Passwords matcher ikke.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        about: about.trim(),
      });

      // Efter oprettelse → send til login/Homepage
      navigate("/login");
    } catch (err) {
      console.error("Opret-bruger-fejl:", err);
      setError(err.message || "Kunne ikke oprette bruger. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Opret ny bruger</h1>
        <p className="auth-subtitle">
          Udfyld felterne herunder for at oprette en konto.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Brugernavn
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Det navn andre ser i chatten"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fx niklas@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindst 8 tegn, tal + bogstaver"
            />
          </label>

          <label>
            Gentag password
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Gentag dit password"
            />
          </label>

          <label>
            Kort beskrivelse (valgfri)
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              placeholder="Fx interesser, studie, hvad du bruger forummet til..."
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? "Opretter bruger..." : "Opret bruger"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Har du allerede en konto?</span>
          <Link to="/login" className="auth-link-btn">
            Gå til login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreateUserPage;