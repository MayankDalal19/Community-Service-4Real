import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function Navbar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
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
        <div className="user-chip" title={`Signed in as ${user?.email || "user"}`}>
          <span className="user-chip__avatar">{initial}</span>
          <div className="user-chip__info">
            <span className="user-chip__name">{user?.fullName || "User"}</span>
            <span className="user-chip__role">{user?.role || "Member"}</span>
          </div>
        </div>
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
