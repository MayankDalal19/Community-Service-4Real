import Icon from "./Icon";

// Dashboard summary tile. `value` stays "--" until real data arrives in Step 3.
export default function StatCard({ icon, label, value = "--", hint, tone = "teal" }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon tone-${tone}`}>
        <Icon name={icon} size={22} />
      </div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </div>
  );
}
