import { useState } from "react";

const JOURNEYS = [
  "House", "Branch2025_survey", "Branch2024_survey", "Customer l and r 2",
  "customer loyalty and retention", "Showrooms23", "Branches23", "Branch2022v1",
  "Branch2022", "Ruwwad2022", "Branches v2", "branchesv1", "Telesales V22",
  "telesale v6", "telesale v5", "retention v5", "Showroom1",
  "instant issuance V4", "KFH go V4", "IVR V3", "Telesales V4", "Ruwaad V4",
  "Retention", "Contact Center - did not log in", "Online Banking Full Browser",
  "ATMs Onsite", "ATMs Offsite", "Complaints", "Prepaid cards (branches)",
  "New Car Finance - Car dealers", "Direct sales",
  "Activation of card for account opened via mobile application",
  "Activation of debit card for account opened via direct sales", "Ijara",
  "New Operational lease - Car dealers", "Contact Center Logged In",
  "Mobile App", "Branches", "Upgrade of existing customers",
  "credit card usage", "Prepaid cards usage - nojoom",
  "Prepaid cards usage - oasis", "Tawarruq Usage", "Account Usage",
  "End of Operational lease", "Car Finance Usage", "Credit card (courier)",
  "Credit cards (branches)", "Prepaid card (courier)",
  "New Operational lease - KFH Showrooms", "Tawaruq"
];

const styles = `
  .ir-root {
    background: #0d1117;
    min-height: 100vh;
    padding: 24px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #e6edf3;
    box-sizing: border-box;
  }
  .ir-root *, .ir-root *::before, .ir-root *::after { box-sizing: border-box; }

  .ir-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }
  .ir-header-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #00b4d8, #0077b6);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .ir-title { font-size: 18px; font-weight: 600; color: #e6edf3; }
  .ir-subtitle { font-size: 12px; color: #8b949e; margin-top: 1px; }

  .ir-panel {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 16px;
  }
  .ir-panel-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8b949e;
    margin-bottom: 16px;
  }

  /* Mode toggle */
  .ir-mode-toggle {
    display: flex;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
    width: fit-content;
    margin-bottom: 0;
  }
  .ir-mode-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    cursor: pointer;
    background: transparent;
    color: #8b949e;
    font-family: inherit;
    transition: all 0.15s;
  }
  .ir-mode-btn.active {
    background: #21262d;
    color: #e6edf3;
    font-weight: 500;
    border: 1px solid #30363d;
  }

  /* Journey grid */
  .ir-journey-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .ir-journey-grid::-webkit-scrollbar { width: 4px; }
  .ir-journey-grid::-webkit-scrollbar-track { background: #0d1117; }
  .ir-journey-grid::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

  .ir-journey-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    border: 1px solid #21262d;
    cursor: pointer;
    transition: all 0.1s;
    font-size: 12px;
    color: #8b949e;
    background: #0d1117;
    user-select: none;
  }
  .ir-journey-item:hover { border-color: #388bfd; color: #e6edf3; }
  .ir-journey-item.selected {
    border-color: #1f6feb;
    background: rgba(31, 111, 235, 0.1);
    color: #58a6ff;
  }
  .ir-checkbox {
    width: 14px; height: 14px;
    border-radius: 3px;
    border: 1.5px solid #30363d;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.1s;
  }
  .ir-journey-item.selected .ir-checkbox {
    background: #1f6feb;
    border-color: #1f6feb;
  }
  .ir-checkbox-tick {
    width: 8px; height: 8px;
    display: none;
  }
  .ir-journey-item.selected .ir-checkbox-tick { display: block; }

  /* Select all bar */
  .ir-select-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .ir-select-bar-btn {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: #21262d;
    color: #8b949e;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.1s;
  }
  .ir-select-bar-btn:hover { border-color: #388bfd; color: #58a6ff; }
  .ir-count-badge {
    font-size: 12px;
    color: #58a6ff;
    background: rgba(31, 111, 235, 0.15);
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid rgba(31, 111, 235, 0.3);
  }

  /* Fields */
  .ir-fields-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 0;
  }
  .ir-field { display: flex; flex-direction: column; gap: 6px; }
  .ir-field label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8b949e;
  }
  .ir-field input, .ir-field select {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #e6edf3;
    font-size: 13px;
    padding: 8px 12px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }
  .ir-field input:focus, .ir-field select:focus { border-color: #388bfd; }
  .ir-field input::placeholder { color: #484f58; }
  .ir-field select option { background: #161b22; }

  /* Preview */
  .ir-preview {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 12px 14px;
    font-size: 11px;
    font-family: 'Consolas', 'Courier New', monospace;
    color: #8b949e;
    line-height: 1.6;
    max-height: 180px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .ir-preview::-webkit-scrollbar { width: 4px; }
  .ir-preview::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }
  .sql-kw { color: #ff7b72; }
  .sql-val { color: #a5d6ff; }
  .sql-str { color: #7ee787; }

  /* Footer buttons */
  .ir-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 4px;
  }
  .ir-btn-insert {
    padding: 9px 22px;
    border-radius: 6px;
    border: none;
    background: #238636;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
    display: flex; align-items: center; gap: 7px;
  }
  .ir-btn-insert:hover:not(:disabled) { background: #2ea043; }
  .ir-btn-insert:disabled { opacity: 0.45; cursor: not-allowed; }
  .ir-btn-reset {
    padding: 9px 16px;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: transparent;
    color: #8b949e;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .ir-btn-reset:hover { border-color: #ff7b72; color: #ff7b72; }

  /* Toast */
  .ir-toast {
    position: fixed;
    bottom: 24px; right: 24px;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    display: flex; align-items: center; gap: 8px;
    border: 1px solid;
    animation: slideIn 0.2s ease;
  }
  .ir-toast.success { background: #0f2a1a; color: #7ee787; border-color: #238636; }
  .ir-toast.error   { background: #2a0f0f; color: #ff7b72; border-color: #6e1a1a; }
  @keyframes slideIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Loading spinner */
  .ir-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Summary chips */
  .ir-summary { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .ir-chip {
    font-size: 11px; padding: 3px 10px; border-radius: 20px;
    background: rgba(31, 111, 235, 0.12);
    color: #58a6ff;
    border: 1px solid rgba(31, 111, 235, 0.25);
  }
`;

function buildSqlPreview(journeys, mobile, lang) {
  const mobile_ = mobile || "9655566835";
  const lang_ = lang === "2" ? "2" : "1";
  const journeyList = journeys.length
    ? journeys.map(j => `('${j}')`).join(",\n      ")
    : "('— select journeys —')";
  return (
    `<span class="sql-kw">INSERT INTO</span> d_CX_Customer_detail (...mobile, sms_mobile, journey, Preferred_Language...)\n` +
    `<span class="sql-kw">SELECT</span> <span class="sql-str">'300012100805'</span>, <span class="sql-str">'316280'</span>, ...,\n` +
    `       <span class="sql-val">'${mobile_}'</span>, <span class="sql-val">'${mobile_}'</span>, J.journey, <span class="sql-val">${lang_}</span>, ...\n` +
    `<span class="sql-kw">FROM</span> (<span class="sql-kw">VALUES</span>\n  ${journeyList}\n) <span class="sql-kw">AS</span> J(journey);`
  );
}

export default function InsertRecords({ apiBaseUrl = "http://localhost:5000" }) {
  const [mode, setMode] = useState("select"); // "select" | "all"
  const [selectedJourneys, setSelectedJourneys] = useState([]);
  const [mobile, setMobile] = useState("9655566835");
  const [lang, setLang] = useState("1");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);

  const activeJourneys = mode === "all" ? JOURNEYS : selectedJourneys;

  const toggleJourney = (j) => {
    setSelectedJourneys(prev =>
      prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]
    );
  };

  const selectAll = () => setSelectedJourneys([...JOURNEYS]);
  const clearAll = () => setSelectedJourneys([]);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInsert = async () => {
    if (activeJourneys.length === 0) {
      showToast("Please select at least one journey.", "error");
      return;
    }
    if (!mobile.trim()) {
      showToast("Mobile number is required.", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`${apiBaseUrl}/api/insert/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeys: activeJourneys,
          mobileNumber: mobile.trim(),
          preferredLanguage: parseInt(lang, 10),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setResult(data);
      showToast(`Inserted ${data.rowsInserted ?? activeJourneys.length} record(s) successfully.`, "success");
    } catch (e) {
      showToast(`Insert failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    } 
  };


console.log("✅ InsertRecords component LOADED");



  const handleReset = () => {
    setSelectedJourneys([]);
    setMobile("9655566835");
    setLang("1");
    setResult(null);
    setMode("select");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ir-root">

        {/* Header */}
        <div className="ir-header">
          <div className="ir-header-icon">➕</div>
          <div>
            <div className="ir-title">Insert Source Records</div>
            <div className="ir-subtitle">Inject test records into d_CX_Customer_detail for reconciliation</div>
          </div>
        </div>

        {/* Journey Selection Panel */}
        <div className="ir-panel">
          <div className="ir-panel-title">Journey Selection</div>

          <div className="ir-mode-toggle" style={{ marginBottom: 16 }}>
            <button
              className={`ir-mode-btn${mode === "select" ? " active" : ""}`}
              onClick={() => setMode("select")}
            >Specific journeys</button>
            <button
              className={`ir-mode-btn${mode === "all" ? " active" : ""}`}
              onClick={() => setMode("all")}
            >All journeys ({JOURNEYS.length})</button>
          </div>

          {mode === "select" && (
            <>
              <div className="ir-select-bar">
                <button className="ir-select-bar-btn" onClick={selectAll}>Select all</button>
                <button className="ir-select-bar-btn" onClick={clearAll}>Clear</button>
                {selectedJourneys.length > 0 && (
                  <span className="ir-count-badge">{selectedJourneys.length} selected</span>
                )}
              </div>
              <div className="ir-journey-grid">
                {JOURNEYS.map(j => (
                  <div
                    key={j}
                    className={`ir-journey-item${selectedJourneys.includes(j) ? " selected" : ""}`}
                    onClick={() => toggleJourney(j)}
                  >
                    <div className="ir-checkbox">
                      <svg className="ir-checkbox-tick" viewBox="0 0 8 8" fill="none">
                        <polyline points="1,4 3,6 7,2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === "all" && (
            <div className="ir-summary">
              {JOURNEYS.slice(0, 6).map(j => (
                <span key={j} className="ir-chip">{j}</span>
              ))}
              <span className="ir-chip">+{JOURNEYS.length - 6} more</span>
            </div>
          )}
        </div>

        {/* Config Panel */}
        <div className="ir-panel">
          <div className="ir-panel-title">Record Configuration</div>
          <div className="ir-fields-row">
            <div className="ir-field">
              <label>Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="e.g. 9655566835"
                maxLength={20}
              />
            </div>
            <div className="ir-field">
              <label>Preferred Language</label>
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="1">Arabic (1)</option>
                <option value="2">English (2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SQL Preview Panel */}
        <div className="ir-panel">
          <div className="ir-panel-title">SQL Preview</div>
          <div
            className="ir-preview"
            dangerouslySetInnerHTML={{
              __html: buildSqlPreview(activeJourneys, mobile, lang)
            }}
          />
        </div>

        {/* Footer */}
        <div className="ir-footer">
          <button
            className="ir-btn-insert"
            onClick={handleInsert}
            disabled={loading || activeJourneys.length === 0}
          >
            {loading ? <div className="ir-spinner" /> : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#fff" strokeWidth="1.5"/>
                <line x1="7" y1="4" x2="7" y2="10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="4" y1="7" x2="10" y2="7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            {loading ? "Inserting…" : `Insert ${activeJourneys.length} record${activeJourneys.length !== 1 ? "s" : ""}`}
          </button>
          <button className="ir-btn-reset" onClick={handleReset}>Reset</button>
          {result && (
            <span style={{ fontSize: 12, color: "#7ee787", marginLeft: 8 }}>
              ✓ {result.rowsInserted} row{result.rowsInserted !== 1 ? "s" : ""} inserted
            </span>
          )}
        </div>
      </div>

      {toast && (
        <div className={`ir-toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </>
  );
}
