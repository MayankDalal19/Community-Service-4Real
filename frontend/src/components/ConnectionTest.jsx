import { useState } from "react";
import Icon from "./Icon";
import StatusRow from "./StatusRow";
import useApiHealth from "../hooks/useApiHealth";
import { seedMockDataApi } from "../services/healthService";

// The Step 1 proof: React -> Express -> MongoDB Atlas, each link tested separately.
export default function ConnectionTest() {
  const { api, db, loading, allOk, recheck } = useApiHealth();
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState("");

  let banner = { tone: "loading", text: "Testing the connection..." };
  if (!loading && allOk) banner = { tone: "ok", text: "All systems connected - React, Express and MongoDB Atlas are talking to each other." };
  else if (!loading && api.status === "error") banner = { tone: "error", text: "The frontend cannot reach the backend. Start it with: cd backend && npm run dev" };
  else if (!loading) banner = { tone: "error", text: "The API is running, but the database check failed. Check MONGODB_URI in backend/.env and the Atlas Network Access list." };

  const handleSeed = async (reset = false) => {
    setSeeding(true);
    setSeedNotice("");
    try {
      const res = await seedMockDataApi(reset);
      setSeedNotice(res.message || "Mock dataset successfully loaded!");
      recheck();
      // Reload stats after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setSeedNotice(`Seed failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">System Connection Test</h2>
          <p className="card__sub">Live check of the full request flow</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {db.status === "ok" && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => handleSeed(true)}
              disabled={seeding}
              title="Loads realistic sample volunteers, donors, donations, beneficiaries and events"
            >
              <Icon name="database" size={15} />
              <span>{seeding ? "Loading data..." : "Reset Mock Data"}</span>
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={recheck} disabled={loading}>
            <Icon name="refresh" size={15} className={loading ? "spin" : ""} />
            <span>Re-test</span>
          </button>
        </div>
      </div>

      <div className={`banner banner--${banner.tone}`}>
        <Icon name={banner.tone === "ok" ? "check" : banner.tone === "error" ? "alert" : "info"} size={18} />
        <span>{banner.text}</span>
      </div>

      {seedNotice && (
        <div className="banner banner--ok" style={{ marginTop: "12px" }}>
          <Icon name="check" size={18} />
          <span>{seedNotice}</span>
        </div>
      )}

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
      </div>
    </section>
  );
}
