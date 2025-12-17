// src/components/AdvancedSearchModal.jsx
import { useState } from "react";

function AdvancedSearchModal({ isOpen, onClose, onApplyFilters }) {
  const [keywords, setKeywords] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  function handleApply() {
    const filters = {
      keywords: keywords.trim().toLowerCase(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      sortBy,
    };
    onApplyFilters(filters);
    onClose();
  }

  function handleReset() {
    setKeywords("");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Avanceret søgning</h2>

        <div>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            Søg efter keywords
          </label>
          <input
            type="text"
            placeholder="Fx: JavaScript, design, projekter..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            style={{ marginBottom: 14 }}
          />
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 14px" }}>
            Søger i titler, beskrivelser og forfatternavn
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Fra dato
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Til dato
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            Sortering
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Nyeste først</option>
            <option value="oldest">Ældste først</option>
            <option value="most-liked">Mest liket</option>
          </select>
        </div>

        <div className="modal-buttons">
          <button onClick={handleReset} style={{ marginRight: "auto" }}>
            Nulstil
          </button>
          <button onClick={onClose}>Annuller</button>
          <button onClick={handleApply}>Anvend filtrer</button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchModal;