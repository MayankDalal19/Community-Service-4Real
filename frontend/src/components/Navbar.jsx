import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Navbar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
    <>
      <header className="navbar">
        <div className="navbar__left">
          <button
            type="button"
            className="icon-btn navbar__menu"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Icon name="menu" />
          </button>
          <h1 className="navbar__title">{title}</h1>
        </div>

        <div className="navbar__right">
          <button
            type="button"
            className="user-chip"
            onClick={() => setProfileOpen(true)}
            title="Click to view profile & settings"
            style={{ border: "none", cursor: "pointer", background: "var(--bg)", textAlign: "left" }}
          >
            <span className="user-chip__avatar">{initial}</span>
            <div className="user-chip__info">
              <span className="user-chip__name">{user?.fullName || "User"}</span>
              <span className="user-chip__role">{user?.role || "Volunteer"}</span>
            </div>
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out of SAHYOG"
          >
            <Icon name="logout" />
          </button>
        </div>
      </header>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
