import { useState } from "react";

export default function BulletList({ bullets, onCopy, onRemove, onEdit, onClear }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [draft, setDraft] = useState("");

  if (bullets.length === 0) {
    return (
      <div className="empty">
        <p>Your generated bullets will appear here.</p>
      </div>
    );
  }

  function startEdit(index, text) {
    setEditingIndex(index);
    setDraft(text);
  }

  function commitEdit() {
    if (editingIndex >= 0 && draft.trim()) {
      onEdit(editingIndex, draft.trim());
    }
    setEditingIndex(-1);
    setDraft("");
  }

  return (
    <section className="bullets">
      <div className="bullets-header">
        <h2>Generated bullets ({bullets.length})</h2>
        <div className="bullets-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onCopy(bullets.map((b) => `• ${b}`).join("\n"), "All bullets copied")}
          >
            Copy all
          </button>
          <button type="button" className="ghost-btn danger" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <ul>
        {bullets.map((bullet, i) => (
          <li key={`${i}-${bullet.slice(0, 20)}`} className="bullet">
            {editingIndex === i ? (
              <textarea
                className="bullet-edit"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit();
                  if (e.key === "Escape") {
                    setEditingIndex(-1);
                    setDraft("");
                  }
                }}
                autoFocus
                rows={2}
              />
            ) : (
              <p className="bullet-text" onDoubleClick={() => startEdit(i, bullet)}>
                {bullet}
              </p>
            )}
            <div className="bullet-actions">
              <button
                type="button"
                className="chip-btn"
                onClick={() => onCopy(bullet, "Bullet copied")}
                title="Copy"
              >
                Copy
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => (editingIndex === i ? commitEdit() : startEdit(i, bullet))}
                title="Edit"
              >
                {editingIndex === i ? "Save" : "Edit"}
              </button>
              <button
                type="button"
                className="chip-btn danger"
                onClick={() => onRemove(i)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="hint">Tip: double-click a bullet to edit. Cmd/Ctrl+Enter to save.</p>
    </section>
  );
}
