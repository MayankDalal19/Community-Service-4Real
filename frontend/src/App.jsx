import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import ResourcePage from "./components/ResourcePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import { MODULE_KEYS, MODULES } from "./config/modules";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app shell - requires authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Core NGO CRUD modules */}
            {MODULE_KEYS.map((key) => (
              <Route
                key={key}
                path={`/${MODULES[key].path}`}
                element={<ResourcePage key={key} moduleKey={key} />}
              />
            ))}

            {/* Reports & Analytics (Admin and Staff) */}
            <Route element={<ProtectedRoute allowedRoles={["Admin", "Staff"]} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* User Administration (Admin only) */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
