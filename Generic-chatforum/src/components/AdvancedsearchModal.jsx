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
        <h2>🔍 Søg i opslag</h2>

        <div>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            Søgeord
          </label>
          <input
            type="text"
            placeholder="Søg efter titler, beskrivelser, forfattere..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            autoFocus
            style={{ 
              marginBottom: 8,
              padding: "12px 14px",
              fontSize: "15px",
            }}
          />
        </div>

        {/* Avancerede filtre - collapsible */}
        <details style={{ marginTop: "16px" }}>
          <summary style={{ 
            cursor: "pointer", 
            fontWeight: 600, 
            color: "var(--text-secondary)",
            fontSize: "13px",
            marginBottom: "12px",
          }}>
            ⚙️ Avancerede filtre
          </summary>
          
          <div style={{ 
            padding: "12px",
            background: "var(--input-bg)",
            borderRadius: "8px",
            marginTop: "8px",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block", fontSize: "13px" }}>
                  Fra dato
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block", fontSize: "13px" }}>
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
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block", fontSize: "13px" }}>
                Sortering
              </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Nyeste først</option>
                <option value="oldest">Ældste først</option>
                <option value="most-liked">Mest liket</option>
              </select>
            </div>
          </div>
        </details>

        <div className="modal-buttons">
          <button onClick={handleReset} style={{ marginRight: "auto" }}>
            Nulstil
          </button>
          <button onClick={onClose}>Annuller</button>
          <button onClick={handleApply} className="btn btn-primary">Søg</button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchModal;