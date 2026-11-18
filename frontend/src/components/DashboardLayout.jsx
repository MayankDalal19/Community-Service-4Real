import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProfileModal from "./ProfileModal";
import { MODULES } from "../config/modules";

const TITLES = {
  "/dashboard": "Community Dashboard",
  "/reports": "Reports & Analytics",
  "/users": "User Administration",
  ...Object.fromEntries(Object.values(MODULES).map((m) => [`/${m.path}`, m.title])),
};

// Shell shared by all logged-in views: Sidebar drawer (opens on click) + Navbar + content.
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the drawer whenever the navigation path changes.
  useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => {
          setSidebarOpen(false);
          setProfileOpen(true);
        }}
      />
      <div className="app-main">
        <Navbar
          title={TITLES[pathname] || "SAHYOG"}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <main className="app-content">
          <Outlet context={{ onOpenProfile: () => setProfileOpen(true) }} />
        </main>
      </div>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
