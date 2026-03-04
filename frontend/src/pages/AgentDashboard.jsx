import { useState, useEffect } from "react";
import { getAdminMetrics, getAdminEscalations } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useApp } from "../context/AppContext";
import { t as getT } from "../i18n/translations";

const SENTIMENT_COLORS = {
  negative: "#e03e3e",
  positive: "#0da574",
  neutral: "#f59e0b",
};
const LANG_COLORS = ["#1a4fa0", "#f0a500"];

const StatCard = ({ label, value, sub, color = "var(--color-primary)" }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: "2.2rem",
        fontWeight: 900,
        color,
        lineHeight: 1,
        marginBottom: 4,
      }}
    >
      {value}
    </div>
    <div
      style={{ fontWeight: 700, marginBottom: 2, color: "var(--text-primary)" }}
    >
      {label}
    </div>
    {sub && (
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
        {sub}
      </div>
    )}
  </div>
);

const AgentDashboard = () => {
  const { language } = useApp();
  const lbl = getT(language);
  const [metrics, setMetrics] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    try {
      const [metricsRes, escalRes] = await Promise.all([
        getAdminMetrics(),
        getAdminEscalations(),
      ]);
      setMetrics(metricsRes.data.metrics);
      setEscalations(escalRes.data.escalations);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const displayEscalations =
    escalations.length > 0
      ? escalations
      : [
          {
            id: "ESC1001",
            customerName: "Arjun Sharma",
            mobile: "98XXXXX210",
            intent: "fraud",
            language: "en",
            sentiment: "negative",
            status: "open",
            createdAt: new Date().toISOString(),
            summary: "Customer reported unauthorized transaction.",
            customer: { balance: 125420 },
          },
          {
            id: "ESC1002",
            customerName: "Priya Patel",
            mobile: "99XXXXX655",
            intent: "complaint",
            language: "hi",
            sentiment: "negative",
            status: "open",
            createdAt: new Date(Date.now() - 300000).toISOString(),
            summary: "ATM withdrawal issue.",
            customer: { balance: 87350 },
          },
          {
            id: "ESC1003",
            customerName: "Rajesh Kumar",
            mobile: "77XXXXX233",
            intent: "escalate",
            language: "en",
            sentiment: "negative",
            status: "resolved",
            createdAt: new Date(Date.now() - 900000).toISOString(),
            summary: "Card block request escalated.",
            customer: { balance: 4200 },
          },
        ];

  const langData = metrics
    ? [
        { name: "English", value: metrics.languageUsage?.en || 0 },
        { name: "Hindi", value: metrics.languageUsage?.hi || 0 },
      ]
    : [
        { name: "English", value: 2 },
        { name: "Hindi", value: 1 },
      ];

  const intentData =
    metrics?.topIntents?.length > 0
      ? metrics.topIntents
      : [
          { intent: "balance", count: 12 },
          { intent: "statement", count: 8 },
          { intent: "loan", count: 6 },
          { intent: "complaint", count: 4 },
          { intent: "fraud", count: 2 },
        ];

  return (
    <div className="page-wrapper">
      {/* ── Landing Hero with image ──────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: 280 }}>
        <img
          src="/banking_tech_bg.png"
          alt="Ramsetu Technology"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(8,12,36,0.92) 0%, rgba(13,37,80,0.88) 60%, rgba(26,79,160,0.75) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "44px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1100,
            margin: "0 auto",
            width: "100%",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                borderRadius: "999px",
                padding: "4px 14px",
                marginBottom: 14,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#2ecc9a",
                  display: "inline-block",
                }}
              />
              Live · Auto-refreshing every 15s
            </div>
            <h1 style={{ color: "white", marginBottom: 8, fontSize: "2.2rem" }}>
              {lbl.dashTitle}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                margin: 0,
                maxWidth: 460,
                lineHeight: 1.6,
              }}
            >
              {lbl.dashSub}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              onClick={loadData}
              style={{
                padding: "10px 22px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
                backdropFilter: "blur(6px)",
              }}
            >
              {lbl.refresh}
            </button>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.45)",
                marginTop: 6,
              }}
            >
              {lbl.lastRefresh}: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "28px 32px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard
            label={lbl.totalSessions}
            value={metrics?.totalSessions ?? 3}
            sub="AI conversations"
          />
          <StatCard
            label={lbl.escalations}
            value={metrics?.totalEscalations ?? displayEscalations.length}
            sub={`${metrics?.openEscalations ?? 2} ${lbl.open}`}
            color="var(--color-danger)"
          />
          <StatCard
            label={lbl.aiHandled}
            value={metrics?.totalAIHandled ?? 0}
            sub="No escalation needed"
            color="var(--color-success)"
          />
          <StatCard
            label={lbl.escalationRate}
            value={metrics?.escalationRate ?? "33%"}
            sub="vs. total sessions"
            color="var(--color-warning)"
          />
          <StatCard
            label={lbl.avgHandle}
            value={`${metrics?.avgHandlingTimeMin ?? 2.4}m`}
            sub="Per session"
            color="#7c3aed"
          />
        </div>

        {/* Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>{lbl.langUsage}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={langData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {langData.map((_, i) => (
                    <Cell key={i} fill={LANG_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>{lbl.topIntents}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={intentData}
                barSize={28}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                />
                <XAxis dataKey="intent" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalation Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>{lbl.escalatedCases}</h3>
            <span className="badge badge-danger">
              {displayEscalations.filter((e) => e.status === "open").length}{" "}
              {lbl.open}
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg-page)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  {[
                    "Ticket",
                    "Customer",
                    "Intent",
                    "Language",
                    "Status",
                    "Sentiment",
                    "Summary",
                    "Time",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayEscalations.map((esc, i) => (
                  <tr
                    key={esc.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      background:
                        i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {esc.id}
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600 }}>{esc.customerName}</div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {esc.mobile}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="badge badge-primary">
                        {esc.intent.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {esc.language === "hi" ? "Hindi" : "English"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className={`badge ${esc.status === "open" ? "badge-danger" : "badge-success"}`}
                      >
                        {esc.status === "open" ? lbl.open : lbl.resolved}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          color: SENTIMENT_COLORS[esc.sentiment] || "#888",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {esc.sentiment === "negative"
                          ? lbl.negative
                          : esc.sentiment === "positive"
                            ? lbl.positive
                            : lbl.neutral}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        maxWidth: 240,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {esc.summary}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(esc.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
