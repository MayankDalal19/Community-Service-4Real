import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const ALL_NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard", roles: ["Admin", "Staff", "Volunteer"] },
  { label: "Volunteers", icon: "volunteers", to: "/volunteers", roles: ["Admin", "Staff"] },
  { label: "Donors", icon: "donors", to: "/donors", roles: ["Admin", "Staff"] },
  { label: "Donations", icon: "donations", to: "/donations", roles: ["Admin", "Staff"] },
  { label: "Beneficiaries", icon: "beneficiaries", to: "/beneficiaries", roles: ["Admin", "Staff"] },
  { label: "Assistance", icon: "assistance", to: "/assistance", roles: ["Admin", "Staff"] },
  { label: "Events", icon: "events", to: "/events", roles: ["Admin", "Staff", "Volunteer"] },
  { label: "Reports", icon: "reports", to: "/reports", roles: ["Admin", "Staff"] },
  { label: "Users", icon: "users", to: "/users", roles: ["Admin"] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const currentRole = user?.role || "Volunteer";

  const visibleItems = ALL_NAV_ITEMS.filter((item) =>
    !item.roles || item.roles.includes(currentRole)
  );

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar__brand">
          <Logo light />
          <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__section">Menu</p>
          {visibleItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>SAHYOG v1.0</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "6px",
                background: currentRole === "Admin" ? "rgba(239,68,68,0.25)" : currentRole === "Staff" ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)",
                color: "#fff",
              }}
            >
              {currentRole}
            </span>
          </div>
          <span>Full Operations & Auth Live</span>
        </div>
      </aside>
    </>
  );
}
