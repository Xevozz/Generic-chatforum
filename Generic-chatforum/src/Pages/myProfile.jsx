// src/pages/myProfile.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import PostList from "../components/Posts/PostList";
import { updateUserProfile } from "../services/userService";

// Foruddefinerede tema-farveskemaer med kontrastfulde farver og konsistent tekst
const THEME_PRESETS = [
  {
    name: "Hvid & Blå",
    primaryColor: "#ffffff",
    accentColor: "#007bff",
    cardBgColor: "#f0f4ff",
    cardBorderColor: "#d4deff",
    textPrimary: "#1a1a2e",
    textSecondary: "#5a5a7a",
    buttonBg: "#2563eb",
    buttonHoverBg: "#1d4ed8",
    navbarBg: "#ffffff",
    borderColor: "#d1d5db",
    inputBg: "#f9fafb",
    inputBorder: "#c1c1c1",
  },
  {
    name: "Lyseblå & Orange",
    primaryColor: "#e3f2fd",
    accentColor: "#1976d2",
    cardBgColor: "#f4a460",
    cardBorderColor: "#ff8c42",
    textPrimary: "#1976d2",
    textSecondary: "#1565c0",
    buttonBg: "#1976d2",
    buttonHoverBg: "#1565c0",
    navbarBg: "#e3f2fd",
    borderColor: "#90caf9",
    inputBg: "#f0f7ff",
    inputBorder: "#64b5f6",
  },
  {
    name: "Lysegrøn & Lilla",
    primaryColor: "#f1f8e9",
    accentColor: "#388e3c",
    cardBgColor: "#e8d4f1",
    cardBorderColor: "#d4a5dd",
    textPrimary: "#2e7d32",
    textSecondary: "#558b2f",
    buttonBg: "#388e3c",
    buttonHoverBg: "#2e7d32",
    navbarBg: "#f1f8e9",
    borderColor: "#81c784",
    inputBg: "#f7fef5",
    inputBorder: "#66bb6a",
  },
  {
    name: "Lyselilla & Gul",
    primaryColor: "#f3e5f5",
    accentColor: "#7b1fa2",
    cardBgColor: "#fff176",
    cardBorderColor: "#ffd54f",
    textPrimary: "#6a1b9a",
    textSecondary: "#7b1fa2",
    buttonBg: "#7b1fa2",
    buttonHoverBg: "#6a1b9a",
    navbarBg: "#f3e5f5",
    borderColor: "#ba68c8",
    inputBg: "#faf9ff",
    inputBorder: "#ce93d8",
  },
  {
    name: "Lyseorange & Blå",
    primaryColor: "#fff3e0",
    accentColor: "#e65100",
    cardBgColor: "#b3e5fc",
    cardBorderColor: "#81d4fa",
    textPrimary: "#e65100",
    textSecondary: "#f57c00",
    buttonBg: "#e65100",
    buttonHoverBg: "#d84315",
    navbarBg: "#fff3e0",
    borderColor: "#ffb74d",
    inputBg: "#fffaf0",
    inputBorder: "#ff9800",
  },
  {
    name: "Lyserød & Grøn",
    primaryColor: "#ffebee",
    accentColor: "#c62828",
    cardBgColor: "#c8e6c9",
    cardBorderColor: "#81c784",
    textPrimary: "#c62828",
    textSecondary: "#d32f2f",
    buttonBg: "#c62828",
    buttonHoverBg: "#ad1457",
    navbarBg: "#ffebee",
    borderColor: "#ef5350",
    inputBg: "#fffbfc",
    inputBorder: "#e53935",
  },
];

export default function MyProfile() {
  const { user, profile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return <p style={{ padding: 16 }}>Indlæser profil…</p>;
  if (!user || !profile) return <p style={{ padding: 16 }}>Du skal være logget ind.</p>;

  const email = profile.email || user.email;
  
  // Hent brugerens nuværende tema fra profilen (synkroniseres automatisk)
  const userTheme = profile.theme || THEME_PRESETS[0];

  // Funktion til at anvende tema til hele siden
  const applyTheme = (theme) => {
    if (!theme) theme = THEME_PRESETS[0];
    document.documentElement.style.setProperty("--primary-color", theme.primaryColor);
    document.documentElement.style.setProperty("--accent-color", theme.accentColor);
    document.documentElement.style.setProperty("--card-bg-color", theme.cardBgColor);
    document.documentElement.style.setProperty("--card-border-color", theme.cardBorderColor);
    document.documentElement.style.setProperty("--text-primary", theme.textPrimary);
    document.documentElement.style.setProperty("--text-secondary", theme.textSecondary);
    document.documentElement.style.setProperty("--button-bg", theme.buttonBg);
    document.documentElement.style.setProperty("--button-hover-bg", theme.buttonHoverBg);
    document.documentElement.style.setProperty("--navbar-bg", theme.navbarBg);
    document.documentElement.style.setProperty("--border-color", theme.borderColor);
    document.documentElement.style.setProperty("--input-bg", theme.inputBg);
    document.documentElement.style.setProperty("--input-border", theme.inputBorder);
  };

  // Anvend tema når komponenten monteres og når brugerens tema ændres
  useEffect(() => {
    applyTheme(userTheme);
  }, [userTheme]);

  async function handleThemeChange(theme) {
    setSaving(true);
    setMessage("");

    try {
      await updateUserProfile(user.uid, { theme });
      setMessage("Tema gemt!");
      // Anvend tema med det samme
      applyTheme(theme);
    } catch (err) {
      console.error("Fejl ved gemning af tema:", err);
      setMessage("Fejl ved gemning af tema.");
    } finally {
      setSaving(false);
    }
  }
  const initials =
    (profile.displayName || email || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("");

  return (
    <div>
      <Navbar pageTitle="Min profil" showHomeButton={true} />

      <Layout>
        <div className="profile-page">
          {/* Header card */}
          <section className="profile-hero">
            <div className="profile-hero-left">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-hero-text">
                <h1 className="profile-name">{profile.displayName}</h1>
                <p className="profile-sub">{email}</p>
              </div>
            </div>

            <div className="profile-hero-right">
              <div className="profile-pill">
                <span className="profile-pill-label">Status</span>
                <span className="profile-pill-value">Aktiv</span>
              </div>
              {profile.isAdmin && (
                <div className="profile-pill">
                  <span className="profile-pill-label">Rolle</span>
                  <span className="profile-pill-value">Admin</span>
                </div>
              )}
            </div>
          </section>

          {/* Info cards */}
          <div className="profile-grid">
            <section className="profile-card">
              <h2>Brugeroplysninger</h2>

              <div className="profile-row">
                <span className="profile-label">Navn</span>
                <span className="profile-value">{profile.displayName}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{email}</span>
              </div>

              <div className="profile-row profile-row--stack">
                <span className="profile-label">Om mig</span>
                <span className="profile-value">
                  {profile.about?.trim() ? profile.about : "—"}
                </span>
              </div>
            </section>

            <section className="profile-card">
              <h2>Kontakt</h2>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{email}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Telefon</span>
                <span className="profile-value">{profile.phone || "—"}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">By</span>
                <span className="profile-value">{profile.city || "—"}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Website</span>
                <span className="profile-value">{profile.website || "—"}</span>
              </div>
            </section>

            <section className="profile-card">
              <h2>Temavalg</h2>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                Vælg en farveskema til hele siden:
              </p>

              <div className="theme-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme)}
                    style={{
                      padding: "12px",
                      border: userTheme?.name === theme.name ? `3px solid ${theme.cardBgColor}` : "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: theme.primaryColor,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: userTheme?.name === theme.name ? `0 0 0 4px ${theme.cardBgColor}60` : "none",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: theme.cardBgColor,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: theme.textPrimary }}>
                      {theme.name}
                    </div>
                  </button>
                ))}
              </div>

              {message && (
                <p style={{ marginTop: "12px", fontSize: "14px", color: message.includes("Fejl") ? "#f44336" : "#4caf50" }}>
                  {message}
                </p>
              )}

              {saving && <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>Gemmer...</p>}
            </section>
          </div>

          {/* Posts section */}
          <section className="profile-card">
            <div className="profile-card-head">
              <h2>Mine opslag</h2>
              <span className="profile-muted">Seneste aktivitet</span>
            </div>

            {/* Midlertidigt: bruger din eksisterende PostList */}
            <PostList />
          </section>
        </div>
      </Layout>
    </div>
  );
}