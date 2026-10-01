import Icon from "./Icon";

const LABELS = { loading: "Checking...", ok: "Connected", error: "Failed" };

// One line of the connection test: icon, title, result message, latency and a status pill.
export default function StatusRow({ icon, title, endpoint, result, children }) {
  return (
    <div className={`status-row is-${result.status}`}>
      <div className="status-row__icon">
        <Icon name={icon} size={22} />
      </div>

      <div className="status-row__main">
        <div className="status-row__top">
          <strong>{title}</strong>
          <code>{endpoint}</code>
        </div>
        <p className="status-row__msg">
          {result.status === "loading" ? "Waiting for response..." : result.message}
        </p>
        {result.status === "ok" && children}
      </div>

      <div className="status-row__side">
        <span className={`pill pill--${result.status}`}>
          {result.status === "loading" && <span className="spinner" />}
          {result.status === "ok" && <Icon name="check" size={14} />}
          {result.status === "error" && <Icon name="alert" size={14} />}
          {LABELS[result.status]}
        </span>
        {result.ms !== null && result.status !== "loading" && (
          <span className="status-row__ms">{result.ms} ms</span>
        )}
      </div>
    </div>
  );
}
