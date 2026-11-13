import { useCallback, useEffect, useState } from "react";
import Icon from "../components/Icon";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

export default function Users() {
  const { user: currentUser } = useAuth();

  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({ fullName: "", email: "", password: "", roleId: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load roles
  useEffect(() => {
    userService
      .getRoles()
      .then((res) => {
        setRoles(res.data);
        if (res.data.length && !addForm.roleId) {
          const defaultRole = res.data.find((r) => r.name === "Volunteer") || res.data[0];
          setAddForm((prev) => ({ ...prev, roleId: defaultRole._id }));
        }
      })
      .catch((err) => console.error("Error loading roles:", err.message));
  }, []);

  // Load users list
  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      const res = await userService.getUsers(params);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadUsers(1);
    }, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.password || !addForm.roleId) {
      setFormError("All fields are required");
      return;
    }
    if (addForm.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await userService.createUser(addForm);
      setAddModalOpen(false);
      setAddForm({ fullName: "", email: "", password: "", roleId: roles[0]?._id || "" });
      setNotice("User account created successfully");
      loadUsers(1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await userService.updateUser(editingUser._id, {
        fullName: editingUser.fullName,
        roleId: editingUser.role?._id || editingUser.roleId,
        isActive: editingUser.isActive,
      });
      setEditingUser(null);
      setNotice("User updated successfully");
      loadUsers(pagination.page);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setSaving(true);
    try {
      await userService.deleteUser(deletingUser._id);
      setDeletingUser(null);
      setNotice("User removed successfully");
      loadUsers(pagination.page);
    } catch (err) {
      alert(`Could not delete user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const rolePillClass = (roleName) => {
    if (roleName === "Admin") return "pill--error";
    if (roleName === "Staff") return "pill--loading";
    return "pill--ok";
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">User Administration</h2>
            <p className="card__sub">Manage team members, volunteer accounts and role authorizations</p>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              setFormError("");
              setAddModalOpen(true);
            }}
          >
            <Icon name="plus" size={16} />
            <span>Add User</span>
          </button>
        </div>

        {notice && (
          <div className="banner banner--ok toast" style={{ marginBottom: "16px" }}>
            <Icon name="check" size={18} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="banner banner--error" style={{ marginBottom: "16px" }}>
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar__search">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="toolbar__select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table__empty">
                    {loading ? "Loading users..." : "No users matched the criteria."}
                  </td>
                </tr>
              ) : (
                items.map((u) => {
                  const isSelf = currentUser?.id === u._id;
                  const roleName = u.role?.name || "Volunteer";
                  return (
                    <tr key={u._id}>
                      <td className="is-strong">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{u.fullName}</span>
                          {isSelf && <span className="chip" style={{ fontSize: "10px" }}>You</span>}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`pill ${rolePillClass(roleName)}`}>
                          <Icon name="shield" size={12} />
                          {roleName}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${u.isActive ? "pill--ok" : "pill--later"}`}>
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="table__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => {
                            setFormError("");
                            setEditingUser({
                              ...u,
                              roleId: u.role?._id || "",
                            });
                          }}
                          title="Edit user role and status"
                          style={{ marginRight: "6px" }}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            onClick={() => setDeletingUser(u)}
                            title="Remove user"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <span>
              Showing {items.length} of {pagination.total} users (Page {pagination.page} of {pagination.pages})
            </span>
            <div className="pagination__btns">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pagination.page <= 1}
                onClick={() => loadUsers(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadUsers(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h2>Add New User</h2>
              <button type="button" className="icon-btn" onClick={() => setAddModalOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal__body">
                {formError && (
                  <div className="banner banner--error">
                    <Icon name="alert" size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="modalFullName">Full Name *</label>
                  <div className="field__control">
                    <Icon name="user" size={18} />
                    <input
                      id="modalFullName"
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="modalEmail">Email Address *</label>
                  <div className="field__control">
                    <Icon name="mail" size={18} />
                    <input
                      id="modalEmail"
                      type="email"
                      required
                      placeholder="priya@ngo.org"
                      value={addForm.email}
                      onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="modalPassword">Initial Password * (min 6 characters)</label>
                  <div className="field__control">
                    <Icon name="lock" size={18} />
                    <input
                      id="modalPassword"
                      type="password"
                      required
                      placeholder="Enter temporary password"
                      value={addForm.password}
                      onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="modalRole">Assigned Role *</label>
                  <div className="field__control">
                    <Icon name="shield" size={18} />
                    <select
                      id="modalRole"
                      value={addForm.roleId}
                      onChange={(e) => setAddForm((f) => ({ ...f, roleId: e.target.value }))}
                      style={{ width: "100%", background: "transparent", border: 0, outline: 0 }}
                    >
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} - {r.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h2>Edit User: {editingUser.fullName}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditingUser(null)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal__body">
                {formError && (
                  <div className="banner banner--error">
                    <Icon name="alert" size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="field">
                  <label>Full Name</label>
                  <div className="field__control">
                    <Icon name="user" size={18} />
                    <input
                      type="text"
                      value={editingUser.fullName}
                      onChange={(e) => setEditingUser((u) => ({ ...u, fullName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Email</label>
                  <div className="field__control" style={{ background: "#f8faf9" }}>
                    <Icon name="mail" size={18} />
                    <input type="email" value={editingUser.email} disabled style={{ opacity: 0.7 }} />
                  </div>
                </div>

                <div className="field">
                  <label>Role</label>
                  <div className="field__control">
                    <Icon name="shield" size={18} />
                    <select
                      value={editingUser.roleId || editingUser.role?._id}
                      onChange={(e) => setEditingUser((u) => ({ ...u, roleId: e.target.value }))}
                      style={{ width: "100%", background: "transparent", border: 0, outline: 0 }}
                      disabled={currentUser?.id === editingUser._id}
                    >
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.description})
                        </option>
                      ))}
                    </select>
                  </div>
                  {currentUser?.id === editingUser._id && (
                    <small style={{ color: "var(--muted)" }}>You cannot modify your own administrator role.</small>
                  )}
                </div>

                <div className="field">
                  <label>Account Status</label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="status"
                        checked={editingUser.isActive === true}
                        onChange={() => setEditingUser((u) => ({ ...u, isActive: true }))}
                      />
                      <span>Active</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="status"
                        checked={editingUser.isActive === false}
                        onChange={() => setEditingUser((u) => ({ ...u, isActive: false }))}
                        disabled={currentUser?.id === editingUser._id}
                      />
                      <span>Deactivated</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deletingUser && (
        <div className="modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h2>Confirm Deletion</h2>
              <button type="button" className="icon-btn" onClick={() => setDeletingUser(null)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="modal__body">
              <p>
                Are you sure you want to remove user <strong>{deletingUser.fullName}</strong> ({deletingUser.email})?
              </p>
              <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                This user will no longer be able to log in to SAHYOG.
              </p>
            </div>
            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
