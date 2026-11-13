import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import ConnectionTest from "../components/ConnectionTest";
import Icon from "../components/Icon";
import { getStats } from "../services/statsService";
import { formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { icon: "volunteers", label: "Volunteers", tone: "teal", key: "volunteers" },
  { icon: "donors", label: "Donors", tone: "rose", key: "donors" },
  { icon: "donations", label: "Total Donations", tone: "amber", key: "totalDonations", money: true },
  { icon: "beneficiaries", label: "Beneficiaries", tone: "blue", key: "beneficiaries" },
  { icon: "events", label: "Events", tone: "violet", key: "events", hintKey: "upcomingEvents", hintText: "upcoming" },
  { icon: "assistance", label: "Assistance Records", tone: "green", key: "assistance" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const currentRole = user?.role || "Volunteer";

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((res) => !cancelled && setStats(res.data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const valueOf = (s) => {
    if (!stats) return "--";
    return s.money ? formatMoney(stats[s.key]) : stats[s.key];
  };

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <h2>Welcome back, {user?.fullName || "User"}!</h2>
          <p>
            You are signed in as <strong>{currentRole}</strong>. Monitor NGO activities,
            manage team resources, and track community impact.
          </p>
        </div>
      </section>

      {error && (
        <div className="banner banner--error">
          <Icon name="alert" size={18} />
          <span>Could not load statistics: {error}</span>
        </div>
      )}

      {/* Primary Statistics Grid */}
      <section className="stat-grid" aria-label="Summary">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            tone={s.tone}
            value={valueOf(s)}
            hint={stats && s.hintKey ? `${stats[s.hintKey]} ${s.hintText}` : undefined}
          />
        ))}
      </section>

      <div className="grid-2">
        <ConnectionTest />

        {/* Role-tailored Quick Actions Card (Replaces the steps and roadmap) */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Quick Actions & Shortcuts</h2>
              <p className="card__sub">Tools and features for your account role ({currentRole})</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentRole === "Admin" && (
              <>
                <Link to="/donations" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="donations" size={18} />
                  <span>Record New Donation</span>
                </Link>
                <Link to="/users" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="users" size={18} />
                  <span>User Administration & Permissions</span>
                </Link>
                <Link to="/reports" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="reports" size={18} />
                  <span>View Financial & Impact Reports</span>
                </Link>
                <Link to="/events" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="events" size={18} />
                  <span>Coordinate NGO Events & Drives</span>
                </Link>
              </>
            )}

            {currentRole === "Staff" && (
              <>
                <Link to="/donations" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="donations" size={18} />
                  <span>Record New Donation</span>
                </Link>
                <Link to="/beneficiaries" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="beneficiaries" size={18} />
                  <span>Register Beneficiary / Family</span>
                </Link>
                <Link to="/volunteers" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="volunteers" size={18} />
                  <span>Manage Volunteers & Schedules</span>
                </Link>
                <Link to="/reports" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="reports" size={18} />
                  <span>View Reports & Download CSV</span>
                </Link>
              </>
            )}

            {currentRole === "Volunteer" && (
              <>
                <Link to="/events" className="btn btn--primary" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="events" size={18} />
                  <span>Browse Upcoming NGO Events & Camps</span>
                </Link>
                <div style={{ padding: "14px", borderRadius: "10px", background: "var(--bg)", marginTop: "6px" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "14px" }}>Volunteer Access</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                    You have access to view community drives, upcoming events, and participate in field activities.
                    For administrative access, please contact your NGO coordinator.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
