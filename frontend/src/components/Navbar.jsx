import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, onMenuClick, onOpenProfile }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button
          type="button"
          className="icon-btn navbar__menu"
          onClick={onMenuClick}
          aria-label="Toggle navigation drawer"
          title="Open menu"
        >
          <Icon name="menu" />
        </button>
        <h1 className="navbar__title">{title}</h1>
      </div>

      <div className="navbar__right">
        {/* Profile edit button accessible to ANY role */}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onOpenProfile}
          title="Edit your profile and password"
          style={{ gap: "6px" }}
        >
          <Icon name="user" size={15} />
          <span>Edit Profile</span>
        </button>

        {/* User identification chip */}
        <button
          type="button"
          className="user-chip"
          onClick={onOpenProfile}
          title="Click to edit profile"
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
          title="Sign out of SAHYOG"
        >
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}
