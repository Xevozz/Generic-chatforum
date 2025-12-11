// src/components/Posts/CreatePost.jsx

import { useState } from "react";
import { createPost } from "../../services/postsService.js";
import { useAuth } from "../../context/AuthContext"; // <-- ny import

function CreatePost() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Hent nuværende bruger + profil (displayName, isAdmin osv.)
  const { user, profile } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    // 1) Tjek om der er tekst
    if (!content.trim()) {
      setError("Opslaget må ikke være tomt.");
      return;
    }

    // 2) Tjek om bruger er logget ind
    if (!user) {
      setError("Du skal være logget ind for at oprette et opslag.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 3) Brug den nye createPost-signatur (objekt)
      await createPost({
        content: content.trim(),
        authorId: user.uid,
        authorName: profile?.displayName || user.email,
      });

      setContent("");
    } catch (err) {
      console.error("Fejl ved oprettelse af post:", err);
      setError("Noget gik galt. Prøv igen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-post">
      <h3>Lav nyt opslag</h3>

      <textarea
        placeholder="Hvad vil du dele?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        className="create-post-submit"
        disabled={saving}
      >
        {saving ? "Opretter..." : "Opret opslag"}
      </button>
    </form>
  );
}

export default CreatePost;