import { useEffect, useState } from "react";
import Icon from "./Icon";
import { toDateInput, today } from "../utils/format";

// Turn a saved record (or defaults) into plain form values.
function initialValues(fields, record) {
  const v = {};
  for (const f of fields) {
    const raw = record?.[f.name];
    if (record) {
      if (f.type === "ref") v[f.name] = raw?._id || raw || "";
      else if (f.type === "multiref") v[f.name] = (raw || []).map((x) => x._id || x);
      else if (f.type === "tags") v[f.name] = (raw || []).join(", ");
      else if (f.type === "date") v[f.name] = toDateInput(raw);
      else v[f.name] = raw ?? "";
    } else if (f.type === "multiref") v[f.name] = [];
    else if (f.type === "date") v[f.name] = today();
    else v[f.name] = f.default ?? "";
  }
  return v;
}

// Turn form values into the JSON body the API expects.
function toPayload(fields, values) {
  const body = {};
  for (const f of fields) {
    const val = values[f.name];
    if (f.type === "tags") body[f.name] = String(val).split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "number") body[f.name] = val === "" ? "" : Number(val);
    else body[f.name] = typeof val === "string" ? val.trim() : val;
  }
  return body;
}

export default function RecordForm({ config, record, refOptions, saving, error, onSubmit, onClose }) {
  const { fields, singular } = config;
  const isEdit = Boolean(record);
  const [values, setValues] = useState(() => initialValues(fields, record));
  const [errors, setErrors] = useState({});

  // Escape closes the dialog
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const set = (name, val) => {
    setValues((p) => ({ ...p, [name]: val }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const toggleMulti = (name, id) => {
    const cur = values[name] || [];
    set(name, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    for (const f of fields) {
      const val = values[f.name];
      const empty = Array.isArray(val) ? val.length === 0 : String(val ?? "").trim() === "";
      if (f.required && empty) found[f.name] = `${f.label} is required`;
    }
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(toPayload(fields, values));
  };

  const renderControl = (f) => {
    const common = { id: f.name, name: f.name, value: values[f.name] };
    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={3} onChange={(e) => set(f.name, e.target.value)} />;
      case "select":
        return (
          <select {...common} onChange={(e) => set(f.name, e.target.value)}>
            {(f.allowEmpty || !f.default) && <option value="">Select...</option>}
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "ref":
        return (
          <select {...common} onChange={(e) => set(f.name, e.target.value)}>
            <option value="">Select {f.label.toLowerCase()}...</option>
            {(refOptions[f.name] || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      default: {
        const type = f.type === "tags" ? "text" : f.type || "text";
        return (
          <input
            {...common}
            type={type}
            min={type === "number" ? 0 : undefined}
            placeholder={f.placeholder}
            onChange={(e) => set(f.name, e.target.value)}
          />
        );
      }
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmit={handleSubmit} noValidate>
        <div className="modal__head">
          <h2 id="modal-title">{isEdit ? `Edit ${singular}` : `Add ${singular}`}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={saving}>
            <Icon name="close" />
          </button>
        </div>

        <div className="modal__body">
          {error && (
            <div className="banner banner--error"><Icon name="alert" size={18} /><span>{error}</span></div>
          )}

          <div className="form-grid">
            {fields.map((f) => (
              <div key={f.name} className={`field ${f.full ? "is-full" : ""} ${errors[f.name] ? "has-error" : ""}`}>
                <label htmlFor={f.name}>{f.label}{f.required && <span className="req"> *</span>}</label>

                {f.type === "multiref" ? (
                  <div className="check-list">
                    {(refOptions[f.name] || []).length === 0 && <span className="muted">Nothing to choose from yet.</span>}
                    {(refOptions[f.name] || []).map((o) => (
                      <label key={o.value} className="check-item">
                        <input
                          type="checkbox"
                          checked={(values[f.name] || []).includes(o.value)}
                          onChange={() => toggleMulti(f.name, o.value)}
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className={`field__control ${f.type === "textarea" ? "field__control--area" : ""}`}>
                    {renderControl(f)}
                  </div>
                )}

                {errors[f.name] && <span className="field__error">{errors[f.name]}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : `Add ${singular}`}
          </button>
        </div>
      </form>
    </div>
  );
}
