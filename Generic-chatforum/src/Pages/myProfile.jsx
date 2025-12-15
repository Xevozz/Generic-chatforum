// src/pages/myProfile.jsx
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import PostList from "../components/Posts/PostList";

export default function MyProfile() {
  const { user, profile, loading } = useAuth();

  if (loading) return <p style={{ padding: 16 }}>Indlæser profil…</p>;
  if (!user || !profile) return <p style={{ padding: 16 }}>Du skal være logget ind.</p>;

  const email = profile.email || user.email;
  const initials =
    (profile.displayName || email || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("");

  return (
    <div>
      <Navbar pageTitle="Min profil" />

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