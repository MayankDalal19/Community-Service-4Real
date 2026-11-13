import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState("profile"); // "profile" | "password"
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [profileMsg, setProfileMsg] = useState({ error: "", success: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passMsg, setPassMsg] = useState({ error: "", success: "" });
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ error: "", success: "" });
    if (!fullName.trim()) {
      setProfileMsg({ error: "Name cannot be empty", success: "" });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({ fullName: fullName.trim() });
      updateUser(res.data);
      setProfileMsg({ error: "", success: "Profile name updated successfully!" });
    } catch (err) {
      setProfileMsg({ error: err.message, success: "" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ error: "", success: "" });

    if (!passwords.currentPassword) {
      setPassMsg({ error: "Please enter your current password", success: "" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPassMsg({ error: "New password must be at least 6 characters long", success: "" });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMsg({ error: "New passwords do not match", success: "" });
      return;
    }

    setSavingPass(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPassMsg({ error: "", success: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassMsg({ error: err.message, success: "" });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal__head">
          <h2>Account Settings</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close modal">
            <Icon name="close" />
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 22px" }}>
          <button
            type="button"
            onClick={() => setTab("profile")}
            style={{
              padding: "12px 16px",
              border: 0,
              borderBottom: tab === "profile" ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              color: tab === "profile" ? "var(--primary)" : "var(--muted)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Profile Info
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            style={{
              padding: "12px 16px",
              border: 0,
              borderBottom: tab === "password" ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              color: tab === "password" ? "var(--primary)" : "var(--muted)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Change Password
          </button>
        </div>

        <div className="modal__body">
          {tab === "profile" && (
            <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {profileMsg.error && (
                <div className="banner banner--error">
                  <Icon name="alert" size={18} />
                  <span>{profileMsg.error}</span>
                </div>
              )}
              {profileMsg.success && (
                <div className="banner banner--ok">
                  <Icon name="check" size={18} />
                  <span>{profileMsg.success}</span>
                </div>
              )}

              <div className="field">
                <label>Email Address</label>
                <div className="field__control" style={{ background: "#f8faf9" }}>
                  <Icon name="mail" size={18} />
                  <input type="text" value={user?.email || ""} disabled style={{ cursor: "not-allowed", opacity: 0.8 }} />
                </div>
                <small style={{ color: "var(--muted)", fontSize: "12px" }}>Email cannot be changed.</small>
              </div>

              <div className="field">
                <label>Role</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span className={`pill pill--${user?.role === "Admin" ? "error" : user?.role === "Staff" ? "loading" : "ok"}`}>
                    <Icon name="shield" size={14} />
                    {user?.role || "Volunteer"}
                  </span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <div className="field__control">
                  <Icon name="user" size={18} />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="submit" className="btn btn--primary" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {tab === "password" && (
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {passMsg.error && (
                <div className="banner banner--error">
                  <Icon name="alert" size={18} />
                  <span>{passMsg.error}</span>
                </div>
              )}
              {passMsg.success && (
                <div className="banner banner--ok">
                  <Icon name="check" size={18} />
                  <span>{passMsg.success}</span>
                </div>
              )}

              <div className="field">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="field__control">
                  <Icon name="lock" size={18} />
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="newPassword">New Password (min 6 characters)</label>
                <div className="field__control">
                  <Icon name="lock" size={18} />
                  <input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="field__control">
                  <Icon name="lock" size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="submit" className="btn btn--primary" disabled={savingPass}>
                  {savingPass ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
