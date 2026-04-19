import { useState } from "react";

export default function InputForm({ value, onChange, onSubmit, loading }) {
  const [touched, setTouched] = useState(false);

  function update(field) {
    return (e) => onChange({ ...value, [field]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!value.jobRole.trim() || !value.workDescription.trim()) return;
    onSubmit({
      ...value,
      count: Number(value.count) || 5,
    });
  }

  const missingRole = touched && !value.jobRole.trim();
  const missingWork = touched && !value.workDescription.trim();

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="row">
        <label className="field">
          <span>Job role *</span>
          <input
            type="text"
            value={value.jobRole}
            onChange={update("jobRole")}
            placeholder="e.g. Senior Software Engineer"
            aria-invalid={missingRole}
          />
          {missingRole && <small className="field-error">Required</small>}
        </label>

        <label className="field">
          <span>Years of experience</span>
          <input
            type="number"
            min="0"
            max="60"
            value={value.yearsOfExperience}
            onChange={update("yearsOfExperience")}
            placeholder="e.g. 5"
          />
        </label>
      </div>

      <label className="field">
        <span>Key skills</span>
        <input
          type="text"
          value={value.skills}
          onChange={update("skills")}
          placeholder="e.g. React, Node.js, PostgreSQL, AWS"
        />
      </label>

      <label className="field">
        <span>Work description / raw notes *</span>
        <textarea
          rows={6}
          value={value.workDescription}
          onChange={update("workDescription")}
          placeholder="Describe what you did — projects, responsibilities, outcomes. Numbers help!"
          aria-invalid={missingWork}
        />
        {missingWork && <small className="field-error">Required</small>}
      </label>

      <div className="row actions">
        <label className="field count-field">
          <span>How many bullets?</span>
          <input
            type="number"
            min="1"
            max="10"
            value={value.count}
            onChange={update("count")}
          />
        </label>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden /> Generating…
            </>
          ) : (
            "Generate bullets"
          )}
        </button>
      </div>
    </form>
  );
}
