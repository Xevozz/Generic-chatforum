import { useState, useEffect } from "react";
import { listenToGroups } from "../services/groupService";
import { createPost } from "../services/postsService";

function CreatePostModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = listenToGroups(setGroups);
    return () => unsub();
  }, []);

  // Nulstil fejl når modal åbnes/lukkes
  useEffect(() => {
    if (isOpen) {
      setError("");
    }
  }, [isOpen]);

  async function handleCreate() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // === VALIDERING ===
    if (!trimmedTitle) {
      setError("Du skal skrive en overskrift til dit opslag.");
      return;
    }
    if (trimmedTitle.length < 3) {
      setError("Overskriften skal mindst være 3 tegn.");
      return;
    }
    if (!trimmedContent) {
      setError("Du skal skrive en beskrivelse til dit opslag.");
      return;
    }
    if (trimmedContent.length < 10) {
      setError("Beskrivelsen skal mindst være 10 tegn.");
      return;
    }
    if (trimmedContent.length > 2000) {
      setError("Beskrivelsen må højst være 2000 tegn.");
      return;
    }
    if (!selectedGroup) {
      setError("Du skal vælge en gruppe, før du kan oprette opslaget.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      // Lige nu gemmer vi titel+tekst sammen i Content-feltet,
      // så vi ikke behøver ændre jeres postsService.
      const combinedText = `${trimmedTitle}\n\n${trimmedContent}`;

      await createPost(combinedText, null, selectedGroup);

      // Ryd felter og luk modal
      setTitle("");
      setContent("");
      setSelectedGroup("");
      onClose();
    } catch (err) {
      console.error("Fejl ved oprettelse af opslag:", err);
      setError("Noget gik galt. Prøv igen om lidt.");
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Skriv en titel..."
        />

        <label>Beskrivelse</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Skriv noget..."
        />

        <label>Vælg gruppe</label>
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

        {/* Fejlbesked */}
        {error && <p className="modal-error">{error}</p>}

        <div className="modal-buttons">
          <button onClick={onClose} disabled={saving}>
            Luk
          </button>
          <button onClick={handleCreate} disabled={saving}>
            {saving ? "Opretter..." : "Opret"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;