import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");

    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill demo role credentials helper
  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setErrors({});
    setServerError("");
  };

  return (
    <div className="login">
      <aside className="login__brand">
        <Logo light size={48} />
        <div className="login__pitch">
          <h2>One place for everything your NGO does.</h2>
          <p>
            Volunteers, donors, donations, beneficiaries and events - managed together,
            securely, with the right access for every person on your team.
          </p>
          <ul>
            <li><Icon name="check" size={16} /> Secure token-based authentication (JWT)</li>
            <li><Icon name="check" size={16} /> Role-based access for Admin, Staff and Volunteers</li>
            <li><Icon name="check" size={16} /> Automated reports and full CSV data export</li>
          </ul>
        </div>
        <small>Built for community impact · Supporting the UN SDGs</small>
      </aside>

      <main className="login__panel">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <div className="login__mobile-logo"><Logo /></div>
          <h1>Welcome back</h1>
          <p className="login__sub">Sign in to continue to SAHYOG</p>

          {serverError && (
            <div className="banner banner--error">
              <Icon name="alert" size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email address</label>
            <div className="field__control">
              <Icon name="mail" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@ngo.org"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className={`field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <div className="field__control">
              <Icon name="lock" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)", margin: "4px 0" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Create an account
            </Link>
          </p>

          {/* Quick Demo Credentials Box */}
          <div
            style={{
              marginTop: "8px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px dashed var(--border)",
              background: "#fafcfb",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Quick Demo Logins (Click to fill)
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => fillCredentials("admin@sahyog.org", "Admin@123")}
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                <Icon name="shield" size={13} />
                Admin
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => fillCredentials("staff@sahyog.org", "Staff@123")}
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                <Icon name="user" size={13} />
                Staff
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => fillCredentials("volunteer@sahyog.org", "Volunteer@123")}
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                <Icon name="volunteers" size={13} />
                Volunteer
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
