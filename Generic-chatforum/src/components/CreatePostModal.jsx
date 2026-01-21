// src/components/CreatePostModal.jsx
// ======================================================
// Modal til oprettelse af nyt opslag
// ======================================================
import { useState, useEffect } from "react";
import { listenToGroups } from "../services/groupService";
import { createPost } from "../services/postsService";
import { useAuth } from "../context/AuthContext";

function CreatePostModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, profile } = useAuth();

  useEffect(() => {
    const unsub = listenToGroups(setGroups);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) setError("");
  }, [isOpen]);

  async function handleCreate() {
    if (!title.trim()) return setError("Du skal skrive en overskrift.");
    if (title.trim().length < 3) return setError("Overskriften skal være mindst 3 tegn.");
    if (!content.trim()) return setError("Du skal skrive en beskrivelse.");
    if (content.trim().length < 10) return setError("Beskrivelsen skal være mindst 10 tegn.");
    if (!selectedGroup) return setError("Du skal vælge en gruppe.");
    if (!user) return setError("Du skal være logget ind.");

    setSaving(true);

    try {
      await createPost({
        title,
        content,
        groupId: selectedGroup,
        authorId: user.uid,
        authorName: profile?.displayName || user.email,
      });

      setTitle("");
      setContent("");
      setSelectedGroup("");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke oprette opslag. Prøv igen.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Lav nyt opslag</h2>

        <label>Overskrift</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Beskrivelse</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />

        <label>Vælg gruppe</label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">Vælg gruppe...</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-buttons">
          <button onClick={onClose} disabled={saving}>Luk</button>
          <button onClick={handleCreate} disabled={saving}>
            {saving ? "Opretter..." : "Opret"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;