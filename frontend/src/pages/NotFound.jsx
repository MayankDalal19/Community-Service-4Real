import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="notfound">
      <Logo />
      <h1>404</h1>
      <p>We could not find that page.</p>
      <Link to="/dashboard" className="btn btn--primary">Back to Dashboard</Link>
    </div>
  );
}
