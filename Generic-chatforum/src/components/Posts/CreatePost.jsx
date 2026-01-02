// src/components/Posts/CreatePost.jsx
import { useState, useEffect } from "react";
import { createPost } from "../../services/postsService";
import { listenToUserGroups } from "../../services/groupService";
import { useAuth } from "../../context/AuthContext";

function CreatePost({
  fixedGroupId = "",        // ✅ bruges på GroupPage
  hideGroupSelector = false // ✅ bruges på GroupPage
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(fixedGroupId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { user, profile } = useAuth();

  // Hent KUN grupper brugeren er medlem af
  useEffect(() => {
    if (!user?.uid) {
      setGroups([]);
      return;
    }

    const unsub = listenToUserGroups(user.uid, (loadedGroups) => {
      setGroups(loadedGroups);
    });
    return () => unsub();
  }, [user?.uid]);

  // ✅ Auto-vælg gruppen, når man er inde i en gruppe-side
  useEffect(() => {
    if (fixedGroupId) {
      setSelectedGroup(fixedGroupId);
    }
  }, [fixedGroupId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!user?.uid) {
      return setError("Du skal være logget ind for at oprette et opslag.");
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    // ✅ hvis fixedGroupId findes, brug den — ellers brug dropdown-valg
    const cleanGroupId = (fixedGroupId || selectedGroup || "").trim() || null;

    if (cleanTitle.length < 3) {
      return setError("Overskriften skal være mindst 3 tegn.");
    }
    if (cleanContent.length < 10) {
      return setError("Beskrivelsen skal være mindst 10 tegn.");
    }
    if (!cleanGroupId) {
      return setError("Du skal vælge en gruppe.");
    }

    setSaving(true);

    try {
      await createPost({
        title: cleanTitle,
        content: cleanContent,
        groupId: cleanGroupId,
        authorId: user.uid,
        authorName: profile?.displayName || user.email || "Ukendt bruger",
      });

      // Reset felter
      setTitle("");
      setContent("");

      // ✅ hvis man er inde i en gruppe, behold gruppen valgt
      if (!fixedGroupId) setSelectedGroup("");
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

      <input
        type="text"
        placeholder="Overskrift"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Hvad vil du dele?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      {/* ✅ Dropdown skjules på gruppe-siden */}
      {!hideGroupSelector && (
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Vælg gruppe...</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={saving} className="create-post-submit">
        {saving ? "Opretter..." : "Opret opslag"}
      </button>
    </form>
  );
}

export default CreatePost;