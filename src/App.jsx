import { useEffect, useState } from "react";
import InputForm from "./components/InputForm.jsx";
import BulletList from "./components/BulletList.jsx";

const STORAGE_KEYS = {
  darkMode: "arbg:darkMode",
  form: "arbg:form",
  bullets: "arbg:bullets",
};

const DEFAULT_FORM = {
  jobRole: "",
  yearsOfExperience: "",
  skills: "",
  workDescription: "",
  count: 5,
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [bullets, setBullets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const dm = localStorage.getItem(STORAGE_KEYS.darkMode);
      if (dm !== null) setDarkMode(JSON.parse(dm));

      const form = localStorage.getItem(STORAGE_KEYS.form);
      if (form) setFormData({ ...DEFAULT_FORM, ...JSON.parse(form) });

      const stored = localStorage.getItem(STORAGE_KEYS.bullets);
      if (stored) setBullets(JSON.parse(stored));
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  // Persist changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode));
  }, [darkMode]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.form, JSON.stringify(formData));
  }, [formData]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bullets, JSON.stringify(bullets));
  }, [bullets]);

  // Auto-clear the toast after a moment.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleGenerate(data) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Request failed: ${res.status}`);
      }
      if (!Array.isArray(json.bullets) || json.bullets.length === 0) {
        throw new Error("The model returned no bullets. Try adding more detail.");
      }
      setBullets((prev) => [...json.bullets, ...prev]);
      setToast(`Generated ${json.bullets.length} bullets`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleClearBullets() {
    if (bullets.length === 0) return;
    if (confirm("Clear all generated bullets?")) setBullets([]);
  }

  function handleRemoveBullet(index) {
    setBullets((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEditBullet(index, newText) {
    setBullets((prev) => prev.map((b, i) => (i === index ? newText : b)));
  }

  async function handleCopy(text, label = "Copied to clipboard") {
    try {
      await navigator.clipboard.writeText(text);
      setToast(label);
    } catch {
      setError("Clipboard access was blocked by the browser.");
    }
  }

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <div className="app">
        <header className="app-header">
          <h1>AI Resume Bullet Generator</h1>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        <p className="subtitle">
          Paste your raw work notes and get polished, ATS-friendly bullet points — powered by Claude.
        </p>

        <InputForm
          value={formData}
          onChange={setFormData}
          onSubmit={handleGenerate}
          loading={loading}
        />

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        <BulletList
          bullets={bullets}
          onCopy={handleCopy}
          onRemove={handleRemoveBullet}
          onEdit={handleEditBullet}
          onClear={handleClearBullets}
        />

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
