import StatCard from "../components/StatCard";
import ConnectionTest from "../components/ConnectionTest";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { icon: "volunteers", label: "Volunteers", tone: "teal" },
  { icon: "donors", label: "Donors", tone: "rose" },
  { icon: "donations", label: "Total Donations", tone: "amber" },
  { icon: "beneficiaries", label: "Beneficiaries", tone: "blue" },
  { icon: "events", label: "Events", tone: "violet" },
  { icon: "assistance", label: "Assistance Records", tone: "green" },
];

const ROADMAP = [
  { step: "Step 1", title: "Foundation", text: "React + Express + MongoDB Atlas connected, base UI", status: "done" },
  { step: "Step 2", title: "Core NGO Management", text: "Volunteers, donors, donations, beneficiaries, events", status: "next" },
  { step: "Step 3", title: "Authentication & Security", text: "JWT auth, password hashing, RBAC, session protection", status: "done" },
];

const STATUS_LABEL = { done: "Complete", next: "Up next", later: "Planned" };

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <h2>Welcome back, {user?.fullName || "Team Member"}</h2>
          <p>
            You are signed in as <strong>{user?.role}</strong> ({user?.email}).
            Authentication, JWT tokens, and role-based permissions are active.
          </p>
        </div>
      </section>

      <section className="stat-grid" aria-label="Summary">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} hint="Available after Step 2" />
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
