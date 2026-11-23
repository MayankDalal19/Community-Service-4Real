import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import StatCard from "../components/StatCard";
import Slideshow from "../components/Slideshow";
import Icon from "../components/Icon";
import { getStats } from "../services/statsService";
import { createCrudService } from "../services/crudService";
import { formatDate, formatMoney } from "../utils/format";
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
  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");

  const currentRole = (typeof user?.role === "object" ? user?.role?.name : user?.role) || "Volunteer";

  useEffect(() => {
    let cancelled = false;

    // Load summary statistics
    getStats()
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    // Load active community events for the records table
    const eventService = createCrudService("events");
    eventService
      .list({ limit: 4 })
      .then((res) => {
        if (!cancelled) setRecentEvents(res.data?.items || []);
      })
      .catch(() => {
        // Non-blocking if events fail to load
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });

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
      {/* Welcome Banner - Clean and relevant */}
      <section className="welcome">
        <div>
          <h2>Welcome, {user?.fullName || "User"}</h2>
          <p>Community service dashboard and live activity metrics.</p>
        </div>
      </section>

      {/* 4 Continuous Photo Slideshow (Donations & Community Outreach) */}
      <Slideshow canViewModules={currentRole !== "Volunteer"} />

      {error && (
        <div className="banner banner--error">
          <Icon name="alert" size={18} />
          <span>Could not load statistics: {error}</span>
        </div>
      )}

      {/* Primary Records & Statistics Grid (Shown Below Slideshow) */}
      <section className="stat-grid" aria-label="Summary Statistics">
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

      {/* Records & Active Community Drives Grid */}
      <div className="grid-2">
        {/* Active Community Drives Table */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Upcoming Community Drives</h2>
              <p className="card__sub">Recent schedules and volunteer relief activities</p>
            </div>
            <Link to="/events" className="btn btn--ghost btn--sm">
              <span>View All Events</span>
              <Icon name="chevronRight" size={14} />
            </Link>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Event / Drive</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td colSpan={4} className="table__empty">
                      Loading community drives...
                    </td>
                  </tr>
                ) : recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table__empty">
                      No events currently scheduled.
                    </td>
                  </tr>
                ) : (
                  recentEvents.map((evt) => (
                    <tr key={evt._id}>
                      <td className="is-strong">{evt.title}</td>
                      <td>{formatDate(evt.eventDate)}</td>
                      <td>{evt.location || "-"}</td>
                      <td>
                        <span
                          className={`pill pill--${
                            evt.status === "Completed"
                              ? "ok"
                              : evt.status === "Cancelled"
                              ? "error"
                              : "loading"
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Record Navigation & Profile Access */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Quick Navigation</h2>
              <p className="card__sub">Direct access to records and account tools</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentRole === "Admin" && (
              <>
                <Link to="/donations" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="donations" size={18} />
                  <span>Donations Ledger & Receipts</span>
                </Link>
                <Link to="/reports" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="reports" size={18} />
                  <span>Financial & Aid Reports</span>
                </Link>
                <Link to="/users" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="users" size={18} />
                  <span>User Directory & Permissions</span>
                </Link>
                <Link to="/volunteers" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="volunteers" size={18} />
                  <span>Volunteers Directory</span>
                </Link>
              </>
            )}

            {currentRole === "Staff" && (
              <>
                <Link to="/donations" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="donations" size={18} />
                  <span>Donations Ledger</span>
                </Link>
                <Link to="/beneficiaries" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="beneficiaries" size={18} />
                  <span>Beneficiaries Registry</span>
                </Link>
                <Link to="/assistance" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="assistance" size={18} />
                  <span>Aid Delivery Records</span>
                </Link>
                <Link to="/reports" className="btn btn--ghost" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="reports" size={18} />
                  <span>Reports & CSV Export</span>
                </Link>
              </>
            )}

            {currentRole === "Volunteer" && (
              <>
                <Link to="/events" className="btn btn--primary" style={{ justifyContent: "flex-start", gap: "12px" }}>
                  <Icon name="events" size={18} />
                  <span>Participate in NGO Events & Camps</span>
                </Link>
              </>
            )}

            {/* Profile edit shortcut available for ANY role */}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onOpenProfile}
              style={{ justifyContent: "flex-start", gap: "12px", marginTop: "4px" }}
            >
              <Icon name="user" size={18} />
              <span>Edit My Profile & Password</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
