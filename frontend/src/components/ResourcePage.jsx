import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import RecordForm from "./RecordForm";
import { MODULES } from "../config/modules";
import { createCrudService } from "../services/crudService";
import { formatDate, formatMoney } from "../utils/format";

const BADGE_TONE = {
  Active: "ok", Delivered: "ok", Completed: "ok",
  Inactive: "later", Closed: "later",
  Upcoming: "loading", Ongoing: "loading", Planned: "loading",
  Cancelled: "error",
};

function renderCell(col, row) {
  const v = row[col.key];
  switch (col.type) {
    case "date": return formatDate(v);
    case "money": return formatMoney(v);
    case "count": return (v || []).length;
    case "ref": return v?.[col.labelKey] || "-";
    case "badge": return v ? <span className={`pill pill--${BADGE_TONE[v] || "later"}`}>{v}</span> : "-";
    case "list":
      return v?.length ? (
        <div className="chips">{v.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}{v.length > 3 && <span className="chip">+{v.length - 3}</span>}</div>
      ) : "-";
    default: return v === null || v === undefined || v === "" ? "-" : v;
  }
}

// One page that powers all six modules, driven entirely by config/modules.js
export default function ResourcePage({ moduleKey }) {
  const config = MODULES[moduleKey];
  const service = useMemo(() => createCrudService(config.path), [config.path]);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState({ page: 1, search: "", filter: "" });

  const [formState, setFormState] = useState(null); // null | { record }  (record null => add)
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(null); // record awaiting confirmation
  const [deleteError, setDeleteError] = useState("");
  const [refOptions, setRefOptions] = useState({});

  const requestId = useRef(0);

  // ---- load the table ----
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const query = { page: params.page, limit: 10 };
      if (params.search) query.search = params.search;
      if (params.filter && config.filter) query[config.filter.name] = params.filter;
      const res = await service.list(query);
      if (id !== requestId.current) return; // a newer request replaced this one
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      if (id === requestId.current) setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [service, params, config.filter]);

  useEffect(() => { load(); }, [load]);

  // ---- debounce typing in the search box ----
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => (p.search === searchInput.trim() ? p : { ...p, search: searchInput.trim(), page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ---- options for dropdowns that point at another module (donor, beneficiary, volunteers) ----
  useEffect(() => {
    const refFields = config.fields.filter((f) => f.ref);
    refFields.forEach(async (f) => {
      try {
        const res = await createCrudService(f.ref.path).list({ limit: 100 });
        setRefOptions((p) => ({
          ...p,
          [f.name]: res.data.items.map((it) => ({ value: it._id, label: it[f.ref.labelKey] })),
        }));
      } catch {
        /* the form still opens; the dropdown will just be empty */
      }
    });
  }, [config.fields]);

  // ---- toast auto-hide ----
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // ---- actions ----
  const openForm = (record = null) => { setFormError(""); setFormState({ record }); };
  const closeForm = useCallback(() => setFormState(null), []);

  const handleSave = async (payload) => {
    const record = formState.record;
    setSaving(true);
    setFormError("");
    try {
      if (record) await service.update(record._id, payload);
      else await service.create(payload);
      setFormState(null);
      setNotice(`${config.singular} ${record ? "updated" : "added"} successfully`);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setDeleteError("");
    try {
      await service.remove(deleting._id);
      setDeleting(null);
      setNotice(`${config.singular} deleted`);
      if (items.length === 1 && params.page > 1) setParams((p) => ({ ...p, page: p.page - 1 }));
      else load();
    } catch (err) {
      setDeleteError(err.message); // e.g. "This donor has donations and cannot be deleted"
    } finally {
      setSaving(false);
    }
  };

  const { page, pages, total } = pagination;

  return (
    <div className="page">
      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">{config.title}</h2>
            <p className="card__sub">{config.subtitle}</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => openForm()}>
            <Icon name="plus" size={18} /> Add {config.singular}
          </button>
        </div>

        <div className="toolbar">
          <div className="toolbar__search">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={config.searchPlaceholder}
              aria-label={`Search ${config.title}`}
            />
          </div>
          {config.filter && (
            <select
              className="toolbar__select"
              value={params.filter}
              onChange={(e) => setParams((p) => ({ ...p, filter: e.target.value, page: 1 }))}
              aria-label="Filter"
            >
              <option value="">{config.filter.label}</option>
              {config.filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>

        {notice && <div className="banner banner--ok toast"><Icon name="check" size={18} /><span>{notice}</span></div>}
        {error && <div className="banner banner--error"><Icon name="alert" size={18} /><span>{error}</span></div>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {config.columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 && (
                <tr><td colSpan={config.columns.length + 1} className="table__empty">Loading...</td></tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr><td colSpan={config.columns.length + 1} className="table__empty">
                  {params.search || params.filter ? "No records match your search." : `No ${config.title.toLowerCase()} yet. Click "Add ${config.singular}" to create the first one.`}
                </td></tr>
              )}
              {items.map((row) => (
                <tr key={row._id} className={loading ? "is-stale" : ""}>
                  {config.columns.map((c) => (
                    <td key={c.key} className={c.strong ? "is-strong" : ""}>{renderCell(c, row)}</td>
                  ))}
                  <td className="table__actions">
                    <button type="button" className="icon-btn" title="Edit" aria-label="Edit" onClick={() => openForm(row)}>
                      <Icon name="edit" size={18} />
                    </button>
                    <button type="button" className="icon-btn icon-btn--danger" title="Delete" aria-label="Delete" onClick={() => { setDeleteError(""); setDeleting(row); }}>
                      <Icon name="trash" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>{total} record{total === 1 ? "" : "s"}</span>
          <div className="pagination__btns">
            <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1 || loading} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button type="button" className="btn btn--ghost btn--sm" disabled={page >= pages || loading} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}>Next</button>
          </div>
        </div>
      </section>

      {formState && (
        <RecordForm
          config={config}
          record={formState.record}
          refOptions={refOptions}
          saving={saving}
          error={formError}
          onSubmit={handleSave}
          onClose={closeForm}
        />
      )}

      {deleting && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !saving && setDeleting(null)}>
          <div className="modal modal--sm" role="alertdialog" aria-modal="true">
            <div className="modal__head"><h2>Delete {config.singular}?</h2></div>
            <div className="modal__body">
              <p>This permanently removes the record. This cannot be undone.</p>
              {deleteError && <div className="banner banner--error"><Icon name="alert" size={18} /><span>{deleteError}</span></div>}
            </div>
            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setDeleting(null)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={saving}>{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
