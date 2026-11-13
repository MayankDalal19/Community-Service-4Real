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
import { MODULES } from "./config/modules";

const OPERATIONAL_MODULE_KEYS = [
  "volunteers",
  "donors",
  "donations",
  "beneficiaries",
  "assistance",
];

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
            {/* Dashboard (all authenticated roles) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Events module (All roles: Admin, Staff, and Volunteer) */}
            <Route
              path={`/${MODULES.events.path}`}
              element={<ResourcePage key="events" moduleKey="events" />}
            />

            {/* Core NGO Management modules (Admin and Staff only) */}
            <Route element={<ProtectedRoute allowedRoles={["Admin", "Staff"]} />}>
              {OPERATIONAL_MODULE_KEYS.map((key) => (
                <Route
                  key={key}
                  path={`/${MODULES[key].path}`}
                  element={<ResourcePage key={key} moduleKey={key} />}
                />
              ))}
              {/* Reports & Analytics */}
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
