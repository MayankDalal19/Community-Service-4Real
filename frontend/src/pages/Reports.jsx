import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import StatCard from "../components/StatCard";
import { reportsService } from "../services/reportsService";
import { formatMoney } from "../utils/format";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    let cancelled = false;
    reportsService
      .getSummary()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async (moduleName) => {
    setDownloading(moduleName);
    try {
      await reportsService.downloadCsv(moduleName);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setDownloading("");
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: "center", padding: "48px 0" }}>
        <div className="spinner" style={{ width: "32px", height: "32px", margin: "0 auto 12px" }} />
        <span style={{ color: "var(--muted)" }}>Loading analytics and NGO reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="banner banner--error">
          <Icon name="alert" size={18} />
          <span>Could not generate reports: {error}</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const donationsByMethod = data?.donationsByMethod || [];
  const assistanceByType = data?.assistanceByType || [];
  const monthlyDonations = data?.monthlyDonations || [];
  const beneficiariesByCategory = data?.beneficiariesByCategory || [];

  const maxMethodAmount = Math.max(...donationsByMethod.map((d) => d.amount), 1);
  const maxAssistanceValue = Math.max(...assistanceByType.map((a) => a.value), 1);

  return (
    <div className="page">
      <div className="welcome">
        <div>
          <h2>Impact & Financial Reports</h2>
          <p>
            Track donations, assistance delivery, volunteer engagement and download data export sheets
            for accounting and regulatory compliance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="stat-grid" aria-label="Key Performance Indicators">
        <StatCard
          icon="donations"
          label="Total Donations Raised"
          tone="amber"
          value={formatMoney(kpis.totalDonations)}
        />
        <StatCard
          icon="assistance"
          label="Aid Delivered Value"
          tone="green"
          value={formatMoney(kpis.totalAssistanceValue)}
        />
        <StatCard
          icon="beneficiaries"
          label="Active Beneficiaries"
          tone="blue"
          value={kpis.activeBeneficiaries || 0}
        />
        <StatCard
          icon="volunteers"
          label="Active Volunteers"
          tone="teal"
          value={kpis.activeVolunteers || 0}
        />
      </section>

      {/* Export Section */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">Data Export & Audit Sheets</h2>
            <p className="card__sub">Generate CSV spreadsheets for offline analysis, accounting and audits</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {[
            { id: "donations", label: "Donations Ledger", icon: "donations" },
            { id: "volunteers", label: "Volunteers Directory", icon: "volunteers" },
            { id: "beneficiaries", label: "Beneficiaries Registry", icon: "beneficiaries" },
            { id: "assistance", label: "Aid Delivery Log", icon: "assistance" },
            { id: "events", label: "Events Summary", icon: "events" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className="btn btn--ghost"
              onClick={() => handleExport(item.id)}
              disabled={Boolean(downloading)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Icon name={downloading === item.id ? "refresh" : "download"} size={16} className={downloading === item.id ? "spin" : ""} />
              <span>{downloading === item.id ? "Exporting..." : `Download ${item.label}`}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Analytics Breakdown Grid */}
      <div className="grid-2">
        {/* Donations by Payment Method */}
        <div className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Donations by Payment Channel</h2>
              <p className="card__sub">Contributions grouped by gateway & method</p>
            </div>
          </div>

          {donationsByMethod.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>
              No donation records available yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {donationsByMethod.map((item) => {
                const pct = Math.round((item.amount / maxMethodAmount) * 100);
                return (
                  <div key={item.method} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                      <span style={{ fontWeight: 600 }}>{item.method}</span>
                      <span style={{ color: "var(--muted)" }}>
                        {formatMoney(item.amount)} ({item.count} contributions)
                      </span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--accent)",
                          borderRadius: "999px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aid Delivered by Category */}
        <div className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Assistance by Sector</h2>
              <p className="card__sub">Value of help distributed per cause</p>
            </div>
          </div>

          {assistanceByType.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>
              No assistance records logged yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {assistanceByType.map((item) => {
                const pct = Math.round((item.value / maxAssistanceValue) * 100);
                return (
                  <div key={item.type} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                      <span style={{ fontWeight: 600 }}>{item.type}</span>
                      <span style={{ color: "var(--muted)" }}>
                        {formatMoney(item.value)} ({item.count} deliveries)
                      </span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--primary)",
                          borderRadius: "999px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Donations Timeline */}
      {monthlyDonations.length > 0 && (
        <div className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Monthly Donations Growth</h2>
              <p className="card__sub">Collection timeline over past months</p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end", minHeight: "140px", paddingTop: "20px" }}>
            {monthlyDonations.map((m) => {
              const maxMo = Math.max(...monthlyDonations.map((x) => x.amount), 1);
              const heightPct = Math.max(Math.round((m.amount / maxMo) * 100), 15);
              return (
                <div
                  key={m.label}
                  style={{
                    flex: "1 1 60px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)" }}>
                    {formatMoney(m.amount)}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "48px",
                      height: `${heightPct}px`,
                      background: "linear-gradient(180deg, var(--primary), var(--primary-dark))",
                      borderRadius: "6px 6px 0 0",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
