import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ResourcePage from "./components/ResourcePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { MODULE_KEYS, MODULES } from "./config/modules";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Everything inside the layout shares Sidebar + Navbar.
          Step 3 will wrap this group in a ProtectedRoute. */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* One route per Step 2 module: /volunteers, /donors, /donations ...
            `key` makes React reset the page state when you switch modules. */}
        {MODULE_KEYS.map((key) => (
          <Route
            key={key}
            path={`/${MODULES[key].path}`}
            element={<ResourcePage key={key} moduleKey={key} />}
          />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
