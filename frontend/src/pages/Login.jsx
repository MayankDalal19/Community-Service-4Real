import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Icon from "../components/Icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Step 1: UI only. Step 3 replaces this with api.post("/auth/login") + JWT.
    navigate("/dashboard");
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
            <li><Icon name="check" size={16} /> Role-based access for Admin, Staff and Volunteers</li>
            <li><Icon name="check" size={16} /> Replace scattered spreadsheets with one system</li>
            <li><Icon name="check" size={16} /> Reports and a clear record of every activity</li>
          </ul>
        </div>
        <small>Built for community impact · Supporting the UN SDGs</small>
      </aside>

      <main className="login__panel">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <div className="login__mobile-logo"><Logo /></div>
          <h1>Welcome back</h1>
          <p className="login__sub">Sign in to continue to SAHYOG</p>

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

          <button type="submit" className="btn btn--primary btn--block">Sign in</button>

          <div className="banner banner--info">
            <Icon name="info" size={18} />
            <span>Demo mode: real authentication (JWT) is added in Step 3. Any valid-looking email works for now.</span>
          </div>
        </form>
      </main>
    </div>
  );
}
