import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ConnectionTest from "../components/ConnectionTest";
import Icon from "../components/Icon";
import { getStats } from "../services/statsService";
import { formatMoney } from "../utils/format";

const STATS = [
  { icon: "volunteers", label: "Volunteers", tone: "teal", key: "volunteers" },
  { icon: "donors", label: "Donors", tone: "rose", key: "donors" },
  { icon: "donations", label: "Total Donations", tone: "amber", key: "totalDonations", money: true },
  { icon: "beneficiaries", label: "Beneficiaries", tone: "blue", key: "beneficiaries" },
  { icon: "events", label: "Events", tone: "violet", key: "events", hintKey: "upcomingEvents", hintText: "upcoming" },
  { icon: "assistance", label: "Assistance Records", tone: "green", key: "assistance" },
];

const ROADMAP = [
  { step: "Step 1", title: "Foundation", text: "React + Express + MongoDB Atlas connected, base UI", status: "done" },
  { step: "Step 2", title: "Core NGO Management", text: "Volunteers, donors, donations, beneficiaries, events", status: "done" },
  { step: "Step 3", title: "Professional Features", text: "JWT, roles, analytics, reports, audit logs", status: "next" },
];

const STATUS_LABEL = { done: "Complete", next: "Up next", later: "Planned" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((res) => !cancelled && setStats(res.data))
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, []);

  const valueOf = (s) => {
    if (!stats) return "--";
    return s.money ? formatMoney(stats[s.key]) : stats[s.key];
  };

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <h2>Welcome to SAHYOG</h2>
          <p>Manage volunteers, donors, donations, beneficiaries and events in one place.</p>
        </div>
      </section>

      {error && (
        <div className="banner banner--error"><Icon name="alert" size={18} /><span>Could not load statistics: {error}</span></div>
      )}

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

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Project Roadmap</h2>
              <p className="card__sub">Where SAHYOG is right now</p>
            </div>
          </div>
          <ol className="roadmap">
            {ROADMAP.map((r) => (
              <li key={r.step} className={`roadmap__item is-${r.status}`}>
                <span className="roadmap__dot">
                  {r.status === "done" ? <Icon name="check" size={14} /> : null}
                </span>
                <div>
                  <div className="roadmap__top">
                    <strong>{r.step} · {r.title}</strong>
                    <span className={`pill pill--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
