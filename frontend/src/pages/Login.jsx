import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_USERS = [
  { role: "Admin", email: "admin@sahyog.org", password: "Admin@123" },
  { role: "Staff", email: "staff@sahyog.org", password: "Staff@123" },
  { role: "Volunteer", email: "volunteer@sahyog.org", password: "Volunteer@123" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Volunteer",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSelectDemo = (demo) => {
    setSelectedDemo(demo.role);
    setMode("login");
    setForm((prev) => ({
      ...prev,
      email: demo.email,
      password: demo.password,
    }));
    setErrors({});
    setServerError("");
  };

  const validate = () => {
    const next = {};
    if (mode === "register" && !form.fullName.trim()) {
      next.fullName = "Full name is required";
    }
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!form.password) {
      next.password = "Password is required";
    } else if (mode === "register" && form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.email.trim(), form.password);
      } else {
        await register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <aside className="login__brand">
        <Logo light size={48} />
        <div className="login__pitch">
          <h2>One place for everything your NGO does.</h2>
          <p>
            Volunteers, donors, donations, beneficiaries and events - managed together,
            securely, with role-based access for every person on your team.
          </p>
          <ul>
            <li>
              <Icon name="check" size={16} /> Role-based access for Admin, Staff and Volunteers
            </li>
            <li>
              <Icon name="check" size={16} /> Secure JWT authentication with hashed passwords
            </li>
            <li>
              <Icon name="check" size={16} /> Centralized reports and audit tracking
            </li>
          </ul>
        </div>
        <small>Built for community impact · Supporting the UN SDGs</small>
      </aside>

      <main className="login__panel">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <div className="login__mobile-logo">
            <Logo />
          </div>

          <div>
            <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
            <p className="login__sub">
              {mode === "login"
                ? "Sign in to continue to SAHYOG"
                : "Join SAHYOG to contribute or manage operations"}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => {
                setMode("login");
                setServerError("");
                setErrors({});
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
              onClick={() => {
                setMode("register");
                setServerError("");
                setErrors({});
                setSelectedDemo(null);
              }}
            >
              Register
            </button>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="banner banner--error" role="alert">
              <Icon name="alert" size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Registration: Full Name */}
          {mode === "register" && (
            <div className={`field ${errors.fullName ? "has-error" : ""}`}>
              <label htmlFor="fullName">Full name</label>
              <div className="field__control">
                <Icon name="user" size={18} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Maya Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.fullName && <span className="field__error">{errors.fullName}</span>}
            </div>
          )}

          {/* Email Address */}
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
                disabled={submitting}
              />
            </div>
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <div className="field__control">
              <Icon name="lock" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "register" ? "Minimum 6 characters" : "Enter your password"}
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>

          {/* Registration: Role Selection */}
          {mode === "register" && (
            <div className="field">
              <label htmlFor="role">Account role</label>
              <div className="field__control">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="Volunteer">Volunteer (Event participation & self-profile)</option>
                  <option value="Staff">Staff (Manage NGO programs & donors)</option>
                  <option value="Admin">Admin (Full administrative access)</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
              </>
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>

          {/* Quick Fill Test Accounts (for fast evaluation) */}
          {mode === "login" && (
            <div className="demo-accounts">
              <span className="demo-accounts__title">Quick test accounts</span>
              <div className="demo-accounts__pills">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    className={`demo-pill ${selectedDemo === demo.role ? "is-active" : ""}`}
                    onClick={() => handleSelectDemo(demo)}
                    title={`Click to fill: ${demo.email}`}
                  >
                    <span>{demo.role}</span>
                    <span className="demo-pill__badge">Test</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Switch mode footer */}
          <p className="auth-switch">
            {mode === "login" ? (
              <>
                Don't have an account yet?
                <button type="button" onClick={() => setMode("register")}>
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button type="button" onClick={() => setMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}
