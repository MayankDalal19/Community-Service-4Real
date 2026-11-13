import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MODULES } from "../config/modules";

const TITLES = {
  "/dashboard": "Dashboard",
  "/reports": "Reports & Analytics",
  "/users": "User Administration",
  ...Object.fromEntries(Object.values(MODULES).map((m) => [`/${m.path}`, m.title])),
};

// Shell shared by every logged-in page: Sidebar + Navbar + page content.
// Step 2 modules simply become child routes rendered in <Outlet />.
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the page changes.
  useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar title={TITLES[pathname] || "SAHYOG"} onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
