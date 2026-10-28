import Icon from "./Icon";
import StatusRow from "./StatusRow";
import useApiHealth from "../hooks/useApiHealth";

// The Step 1 + Step 3 proof: React -> Express -> MongoDB Atlas + JWT Auth, each link tested separately.
export default function ConnectionTest() {
  const { api, db, auth, loading, allOk, recheck } = useApiHealth();

  let banner = { tone: "loading", text: "Testing system connections and session..." };
  if (!loading && allOk) {
    banner = { tone: "ok", text: "All systems operational - React, Express, MongoDB Atlas and JWT Authentication are verified." };
  } else if (!loading && api.status === "error") {
    banner = { tone: "error", text: "The frontend cannot reach the backend. Start it with: cd backend && npm run dev" };
  } else if (!loading && db.status === "error") {
    banner = { tone: "error", text: "The API is running, but the database check failed. Check MONGODB_URI in backend/.env." };
  } else if (!loading && auth.status === "error") {
    banner = { tone: "error", text: "Authentication session expired or invalid. Please re-authenticate." };
  }

  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">System & Auth Status</h2>
          <p className="card__sub">Live check of API, Database, and JWT Session</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={recheck} disabled={loading}>
          <Icon name="refresh" size={17} className={loading ? "spin" : ""} />
          Re-test
        </button>
      </div>

      <div className={`banner banner--${banner.tone}`}>
        <Icon name={banner.tone === "ok" ? "check" : banner.tone === "error" ? "alert" : "info"} size={18} />
        <span>{banner.text}</span>
      </div>

      <div className="status-list">
        <StatusRow icon="server" title="Express API" endpoint="GET /api/health" result={api}>
          {api.data && (
            <dl className="kv">
              <div><dt>Service</dt><dd>{api.data.service}</dd></div>
              <div><dt>Environment</dt><dd>{api.data.environment}</dd></div>
              <div><dt>Uptime</dt><dd>{api.data.uptimeSeconds}s</dd></div>
            </dl>
          )}
        </StatusRow>

        <StatusRow icon="database" title="MongoDB Atlas" endpoint="GET /api/health/db" result={db}>
          {db.data && (
            <>
              <dl className="kv">
                <div><dt>Database</dt><dd>{db.data.database}</dd></div>
                <div><dt>Users</dt><dd>{db.data.totalUsers}</dd></div>
              </dl>
              <div className="chips">
                {db.data.roles.map((role) => (
                  <span key={role.id} className="chip">{role.name}</span>
                ))}
              </div>
            </>
          )}
        </StatusRow>

        <StatusRow icon="lock" title="JWT Authentication" endpoint="GET /api/auth/me" result={auth}>
          {auth.data?.user && (
            <dl className="kv">
              <div><dt>Authenticated User</dt><dd>{auth.data.user.fullName}</dd></div>
              <div><dt>Email</dt><dd>{auth.data.user.email}</dd></div>
              <div><dt>Active Role</dt><dd>{auth.data.user.role}</dd></div>
            </dl>
          )}
        </StatusRow>
      </div>
    </section>
  );
}
