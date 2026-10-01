// SAHYOG mark: two interlocking rings = people working together ("sahyog" means cooperation).
export default function Logo({ size = 40, withText = true, light = false }) {
  return (
    <div className={`logo ${light ? "logo--light" : ""}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={light ? "rgba(255,255,255,0.14)" : "#0f766e"} />
        <circle cx="26" cy="32" r="13" fill="none" stroke="#fff" strokeWidth="5" />
        <circle cx="38" cy="32" r="13" fill="none" stroke="#f59e0b" strokeWidth="5" />
      </svg>
      {withText && (
        <div className="logo__text">
          <span className="logo__name">SAHYOG</span>
          <span className="logo__tag">NGO Management</span>
        </div>
      )}
    </div>
  );
}
