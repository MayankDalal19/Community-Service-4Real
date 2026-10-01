import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function Navbar({ title, onMenuClick }) {
  const navigate = useNavigate();

  // Real logout (clearing the JWT) arrives in Step 3. For now it returns to the login page.
  const handleLogout = () => navigate("/login");

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
        <div className="user-chip" title="Signed-in user (placeholder until Step 3)">
          <span className="user-chip__avatar">A</span>
          <div className="user-chip__info">
            <span className="user-chip__name">Admin User</span>
            <span className="user-chip__role">Administrator</span>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}
