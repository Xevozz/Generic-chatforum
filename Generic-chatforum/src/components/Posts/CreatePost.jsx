// src/components/Posts/CreatePost.jsx

import { useState } from "react";
import { createPost } from "../../services/postsService.js";

function CreatePost() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Opslaget må ikke være tomt.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // authorId = null, indtil I kobler auth på
      await createPost(content.trim(), null);
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