import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div className="spinner" style={{ width: "32px", height: "32px", borderWidth: "3px" }} />
          <span style={{ color: "var(--muted)", fontWeight: 500 }}>Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="page" style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--danger-soft)", color: "var(--danger)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Icon name="alert" size={32} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Access Restricted</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Your account ({user?.role || "User"}) does not have permission to view this section.
            Required role: <strong>{allowedRoles.join(" or ")}</strong>.
          </p>
          <div>
            <Link to="/dashboard" className="btn btn--primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
