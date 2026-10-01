import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";

// Only Dashboard is live in Step 1. The rest are shown as "Soon" so the
// final layout is visible and Step 2 just flips `to` on for each module.
const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Volunteers", icon: "volunteers", soon: "Step 2" },
  { label: "Donors", icon: "donors", soon: "Step 2" },
  { label: "Donations", icon: "donations", soon: "Step 2" },
  { label: "Beneficiaries", icon: "beneficiaries", soon: "Step 2" },
  { label: "Assistance", icon: "assistance", soon: "Step 2" },
  { label: "Events", icon: "events", soon: "Step 2" },
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
          <span>Step 1 · Foundation</span>
        </div>
      </aside>
    </>
  );
}
