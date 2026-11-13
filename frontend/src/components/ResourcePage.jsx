import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import RecordForm from "./RecordForm";
import { MODULES } from "../config/modules";
import { createCrudService } from "../services/crudService";
import { formatDate, formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const currentRole = user?.role || "Volunteer";

  // Role permissions:
  // - Admin: create, edit, delete on everything
  // - Staff: create, edit; delete on operational items, but NOT on donors/donations
  // - Volunteer: read-only access (no create, edit, or delete)
  const canCreate = currentRole === "Admin" || currentRole === "Staff";
  const canEdit = currentRole === "Admin" || currentRole === "Staff";
  const canDelete =
    currentRole === "Admin" ||
    (currentRole === "Staff" && moduleKey !== "donors" && moduleKey !== "donations");
  const showActions = canEdit || canDelete;

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

  // ---- load options for dropdowns that link to another module ----
  const refFields = useMemo(() => config.fields.filter((f) => f.ref), [config.fields]);

  useEffect(() => {
    let cancelled = false;
    refFields.forEach(async (f) => {
      try {
        const s = createCrudService(f.ref.path);
        const res = await s.list({ limit: 100 });
        if (!cancelled) {
          setRefOptions((prev) => ({
            ...prev,
            [f.name]: res.data.items.map((it) => ({ value: it._id, label: it[f.ref.labelKey] })),
          }));
        }
      } catch {
        // Dropdown will show an empty list; user can still type or retry
      }
    });
    return () => { cancelled = true; };
  }, [refFields]);

  // ---- form handling ----
  const openForm = (record = null) => {
    if (!canCreate && !record) return;
    if (!canEdit && record) return;
    setFormError("");
    setFormState({ record });
  };

  const closeForm = () => {
    setFormState(null);
    setFormError("");
  };

  const handleSave = async (formData) => {
    setSaving(true);
    setFormError("");
    const isEdit = Boolean(formState?.record);
    try {
      if (isEdit) {
        await service.update(formState.record._id, formData);
        setNotice(`${config.singular} updated`);
      } else {
        await service.create(formData);
        setNotice(`${config.singular} created`);
      }
      closeForm();
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting || !canDelete) return;
    setSaving(true);
    setDeleteError("");
    try {
      await service.remove(deleting._id);
      setDeleting(null);
      setNotice(`${config.singular} deleted`);
      if (items.length === 1 && params.page > 1) setParams((p) => ({ ...p, page: p.page - 1 }));
      else load();
    } catch (err) {
      setDeleteError(err.message);
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
          {/* Only show Add button if user has permission to create */}
          {canCreate && (
            <button type="button" className="btn btn--primary" onClick={() => openForm()}>
              <Icon name="plus" size={18} /> Add {config.singular}
            </button>
          )}
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
                {showActions && <th className="table__actions">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 && (
                <tr><td colSpan={config.columns.length + (showActions ? 1 : 0)} className="table__empty">Loading...</td></tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr><td colSpan={config.columns.length + (showActions ? 1 : 0)} className="table__empty">
                  {params.search || params.filter
                    ? "No records match your search."
                    : canCreate
                      ? `No ${config.title.toLowerCase()} yet. Click "Add ${config.singular}" to create the first one.`
                      : `No ${config.title.toLowerCase()} found.`
                  }
                </td></tr>
              )}
              {items.map((row) => (
                <tr key={row._id} className={loading ? "is-stale" : ""}>
                  {config.columns.map((c) => (
                    <td key={c.key} className={c.strong ? "is-strong" : ""}>{renderCell(c, row)}</td>
                  ))}
                  {showActions && (
                    <td className="table__actions">
                      {canEdit && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit"
                          aria-label="Edit"
                          onClick={() => openForm(row)}
                          style={{ marginRight: canDelete ? "6px" : 0 }}
                        >
                          <Icon name="edit" size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          title="Delete"
                          aria-label="Delete"
                          onClick={() => { setDeleteError(""); setDeleting(row); }}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="pagination">
            <span>
              Showing {items.length} of {total} {config.title.toLowerCase()}
              {pages > 1 && ` (page ${page} of ${pages})`}
            </span>
            {pages > 1 && (
              <div className="pagination__btns">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={page >= pages || loading}
                  onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit modal */}
      {formState && canCreate && (
        <RecordForm
          config={config}
          initial={formState.record}
          refOptions={refOptions}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {/* Delete confirmation modal */}
      {deleting && canDelete && (
        <div className="modal-backdrop" onClick={() => !saving && setDeleting(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal__head">
              <h2>Delete {config.singular}</h2>
              <button type="button" className="icon-btn" onClick={() => setDeleting(null)} aria-label="Close" disabled={saving}>
                <Icon name="close" />
              </button>
            </div>
            <div className="modal__body">
              {deleteError ? (
                <div className="banner banner--error"><Icon name="alert" size={18} /><span>{deleteError}</span></div>
              ) : (
                <p>Are you sure you want to delete this {config.singular.toLowerCase()}? This action cannot be undone.</p>
              )}
            </div>
            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setDeleting(null)} disabled={saving}>
                {deleteError ? "Close" : "Cancel"}
              </button>
              {!deleteError && (
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                  {saving ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
