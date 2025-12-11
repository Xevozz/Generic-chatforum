// src/components/Posts/CreatePost.jsx

import { useState, useEffect } from "react";
import { createPost } from "../../services/postsService";
import { listenToGroups } from "../../services/groupService";
import { useAuth } from "../../context/AuthContext";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { user, profile } = useAuth();

  // Hent grupper til dropdown
  useEffect(() => {
    const unsub = listenToGroups((loadedGroups) => {
      setGroups(loadedGroups);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      return setError("Du skal skrive en overskrift.");
    }
    if (title.trim().length < 3) {
      return setError("Overskriften skal være mindst 3 tegn.");
    }
    if (!content.trim()) {
      return setError("Du skal skrive en beskrivelse.");
    }
    if (content.trim().length < 10) {
      return setError("Beskrivelsen skal være mindst 10 tegn.");
    }
    if (!selectedGroup) {
      return setError("Du skal vælge en gruppe.");
    }
    if (!user) {
      return setError("Du skal være logget ind for at oprette et opslag.");
    }

    setSaving(true);

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        groupId: selectedGroup,
        authorId: user.uid,
        authorName: profile?.displayName || user.email,
      });

      // Nulstil felter
      setTitle("");
      setContent("");
      setSelectedGroup("");
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

      {/* Titel */}
      <input
        type="text"
        placeholder="Overskrift"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: "6px" }}
      />

      {/* Beskrivelse */}
      <textarea
        placeholder="Hvad vil du dele?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {/* Vælg gruppe */}
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ marginTop: "6px" }}
      >
        <option value="">Vælg gruppe...</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      {error && (
        <p style={{ color: "red", marginTop: "6px", fontSize: "14px" }}>
          {error}
        </p>
      )}

            <button
          type="submit"
          disabled={saving}
          className="create-post-submit"
        >
  {saving ? "Opretter..." : "Opret opslag"}
</button>
    </form>
  );
}

export default CreatePost;