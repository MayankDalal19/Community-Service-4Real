import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text-subtle)",
        gap: "1rem"
      }}>
        <div className="spinner" style={{
          width: 36,
          height: 36,
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ fontSize: "0.95rem" }}>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "4rem auto",
        textAlign: "center",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>
          <Icon name="alert" size={48} />
        </div>
        <h2>Access Restricted</h2>
        <p style={{ color: "var(--color-text-subtle)", margin: "0.75rem 0 1.5rem" }}>
          Your role <strong>({user?.role})</strong> does not have permission to access this page.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children ? children : <Outlet />;
}
