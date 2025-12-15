import { useAuth } from "../context/AuthContext";
import PostList from "../components/Posts/PostList";
import Navbar from "../components/Navbar";

function MyProfile() {
  const { user, profile, loading } = useAuth();

  if (loading) return <p>Indlæser profil...</p>;
  if (!user || !profile) return <p>Du skal være logget ind.</p>;

  return (
    <div className="my-profile-page" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>Min profil</h1>

      {/* PROFIL INFO */}
      <section className="profile-card">
        <h2>Brugeroplysninger</h2>
        <p><strong>Navn:</strong> {profile.displayName}</p>
        <p><strong>Email:</strong> {profile.email || user.email}</p>

        {profile.about && (
          <p><strong>Om mig:</strong> {profile.about}</p>
        )}
      </section>

      {/* KONTAKT */}
      <section className="profile-card">
        <h2>Kontakt</h2>
        <p><strong>Email:</strong> {profile.email || user.email}</p>
        {profile.phone && <p><strong>Telefon:</strong> {profile.phone}</p>}
        {profile.city && <p><strong>By:</strong> {profile.city}</p>}
      </section>

      {/* MINE OPSLAG */}
      <section>
        <h2>Mine opslag</h2>
        <PostList authorId={user.uid} />
      </section>
    </div>
  );
}

export default MyProfile;