// src/components/Posts/CreatePost.js

import { useState } from "react";
import { createPost } from "src/Services/postsService";

/**
 * CreatePost:
 * - Viser et simpelt tekstfelt + knap
 * - Opretter et nyt dokument i Firestore ("posts")
 * - Bruger createPost fra postsService
 */
function CreatePost() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    // Tomt opslag, skal ikke oprettes
    if (!content.trim()) {
      setError("Opslaget må ikke være tomt.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // TODO: når I får auth, kan I sende rigtig user-id med
      await createPost(content.trim(), null);

      // Nulstil formular
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

      <button type="submit" disabled={saving}>
        {saving ? "Opretter..." : "Opret opslag"}
      </button>
    </form>
  );
}

export default CreatePost;