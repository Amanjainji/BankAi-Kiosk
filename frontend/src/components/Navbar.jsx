// =============================================================
// Navbar — top bar with brand, mode switcher, language, accessibility
// =============================================================
import { Link, useNavigate } from "react-router-dom";
import { useApp, SUPPORTED_LANGUAGES } from "../context/AppContext";

const MODE_OPTIONS = [
  { value: "kiosk", label: "Branch Kiosk", route: "/" },
  { value: "desk", label: "Frontline Desk", route: "/desk" },
  { value: "ivr", label: "Contact Center", route: "/ivr" },
];

const Navbar = () => {
  const {
    customer,
    logout,
    language,
    setLanguage,
    largeText,
    toggleLargeText,
    highContrast,
    toggleHighContrast,
    mode,
    setMode,
    isAuthenticated,
  } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("banking_token");
    navigate("/");
  };

  const handleModeChange = (e) => {
    const selected = e.target.value;
    const option = MODE_OPTIONS.find((o) => o.value === selected);
    setMode(selected);
    if (option) navigate(option.route);
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">B</div>
        <div>
          <div>RamSetu Platform</div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 400,
              color: "var(--text-muted)",
              marginTop: -2,
            }}
          >
            {MODE_OPTIONS.find((m) => m.value === mode)?.label ||
              "Branch Kiosk"}
          </div>
        </div>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Mode switcher — navigates on change */}
        <select
          value={mode}
          onChange={handleModeChange}
          style={{
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--border-color)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          {MODE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--border-color)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: "0.82rem",
            cursor: "pointer",
            maxWidth: 130,
          }}
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>

        {/* Accessibility */}
        <button
          className={`btn btn-sm ${largeText ? "btn-primary" : "btn-secondary"}`}
          onClick={toggleLargeText}
          title="Toggle Large Text"
          style={{ fontWeight: 700 }}
        >
          Aa
        </button>
        <button
          className={`btn btn-sm ${highContrast ? "btn-primary" : "btn-secondary"}`}
          onClick={toggleHighContrast}
          title="Toggle Dark Mode"
        >
          {highContrast ? "Light" : "Dark"}
        </button>

        {/* Nav links */}
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          Dashboard
        </Link>

        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
            >
              {customer?.name?.split(" ")[0]}
            </span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
