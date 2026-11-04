import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";

// Dashboard + the six Step 2 modules are live. Reports arrives in Step 3.
const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Volunteers", icon: "volunteers", to: "/volunteers" },
  { label: "Donors", icon: "donors", to: "/donors" },
  { label: "Donations", icon: "donations", to: "/donations" },
  { label: "Beneficiaries", icon: "beneficiaries", to: "/beneficiaries" },
  { label: "Assistance", icon: "assistance", to: "/assistance" },
  { label: "Events", icon: "events", to: "/events" },
  { label: "Reports", icon: "reports", soon: "Step 3" },
];

export default function Sidebar({ open, onClose }) {
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
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <div key={item.label} className="nav-item is-disabled" aria-disabled="true">
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
                <em className="nav-item__soon">{item.soon}</em>
              </div>
            )
          )}
        </nav>

        <div className="sidebar__footer">
          <span>SAHYOG v1.0</span>
          <span>Step 2 · Core Modules</span>
        </div>
      </aside>
    </>
  );
}
