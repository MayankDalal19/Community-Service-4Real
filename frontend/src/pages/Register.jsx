import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleName: "Volunteer",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters";

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleName: form.roleName,
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <aside className="login__brand">
        <Logo light size={48} />
        <div className="login__pitch">
          <h2>Join the SAHYOG Community.</h2>
          <p>
            Create an account to manage volunteers, coordinate events, track donations, and help
            bring meaningful social impact to communities.
          </p>
          <ul>
            <li><Icon name="check" size={16} /> Secure token-based authentication (JWT)</li>
            <li><Icon name="check" size={16} /> Role-tailored access for Volunteers, Staff and Admins</li>
            <li><Icon name="check" size={16} /> Real-time NGO data coordination</li>
          </ul>
        </div>
        <small>Built for community impact · Supporting the UN SDGs</small>
      </aside>

      <main className="login__panel">
        <form className="login__card" onSubmit={handleSubmit} noValidate style={{ maxWidth: "450px" }}>
          <div className="login__mobile-logo"><Logo /></div>
          <h1>Create an account</h1>
          <p className="login__sub">Join SAHYOG NGO Management Platform</p>

          {serverError && (
            <div className="banner banner--error">
              <Icon name="alert" size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <div className={`field ${errors.fullName ? "has-error" : ""}`}>
            <label htmlFor="fullName">Full Name</label>
            <div className="field__control">
              <Icon name="user" size={18} />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Ravi Kumar"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && <span className="field__error">{errors.fullName}</span>}
          </div>

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email address</label>
            <div className="field__control">
              <Icon name="mail" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="ravi@ngo.org"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className="form-grid" style={{ gap: "12px" }}>
            <div className={`field ${errors.password ? "has-error" : ""}`}>
              <label htmlFor="password">Password</label>
              <div className="field__control">
                <Icon name="lock" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            <div className={`field ${errors.confirmPassword ? "has-error" : ""}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="field__control">
                <Icon name="lock" size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="roleName">Account Role</label>
            <div className="field__control">
              <Icon name="shield" size={18} />
              <select
                id="roleName"
                name="roleName"
                value={form.roleName}
                onChange={handleChange}
                style={{ width: "100%", background: "transparent", border: 0, outline: 0 }}
              >
                <option value="Volunteer">Volunteer (Event participation & attendance)</option>
                <option value="Staff">Staff (Operations, Beneficiaries, Logistics)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)", margin: "4px 0" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
