// ── Small shared UI pieces: icons, avatar, spinner, empty state ──

export const Icon = ({ name, size = 18, className = "", strokeWidth = 1.9 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };

  switch (name) {
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 1.8" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.4" />
          <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.2a3.4 3.4 0 0 1 0 5.9" />
          <path d="M17.5 14.5a5.5 5.5 0 0 1 3 5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case "bowl":
      return (
        <svg {...common}>
          <path d="M4 12h16a8 8 0 0 1-16 0Z" />
          <path d="M12 4v2M7 5.5 5.5 7M17 5.5 18.5 7" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c0-8 5-13 14-13 0 9-5 14-14 14" />
          <path d="M5 19c2-5 6-9 11-11" />
        </svg>
      );
    case "store":
      return (
        <svg {...common}>
          <path d="M4 8.5 5.5 4h13L20 8.5" />
          <path d="M4 8.5A2.5 2.5 0 0 0 9 8.8 2.5 2.5 0 0 0 14 8.8 2.5 2.5 0 0 0 20 8.5" />
          <path d="M5.5 11v9h13v-9" />
          <path d="M9.5 20v-5h5v5" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m4.5 12.5 5 5 10-11" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H9" />
          <path d="m15.5 16.5 4.5-4.5-4.5-4.5M20 12H9.5" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20.5s-7.5-4.7-9.3-9.4C1.4 7.8 3.6 4.7 6.9 4.7c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.4-1.8 4.7-9.3 9.4-9.3 9.4Z" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-2.3-5.6" />
          <path d="M20 3.5V8h-4.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2.8 4.5 5.5v5.7c0 4.6 3.2 8 7.5 9.9 4.3-1.9 7.5-5.3 7.5-9.9V5.5L12 2.8Z" />
          <path d="m8.8 11.8 2.3 2.3 4.2-4.4" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="m3.5 17 5.5-5.5 4 4L20 8" />
          <path d="M15 8h5v5" />
        </svg>
      );
    case "gauge":
      return (
        <svg {...common}>
          <path d="M4.5 19a9 9 0 1 1 15 0" />
          <path d="m12 13.5 4-5" />
          <circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 10v4.5" />
          <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "route":
      return (
        <svg {...common}>
          <circle cx="5.5" cy="5.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
          <path d="M8 5.5h6.5a4 4 0 0 1 0 8H9.5a4 4 0 0 0 0 8H16" />
        </svg>
      );
    default:
      return null;
  }
};

// ── Initials avatar with deterministic gradient ──
const AVATAR_COLORS = [
  ["#16a34a", "#15803d"],
  ["#f97316", "#ea580c"],
  ["#2563eb", "#1d4ed8"],
  ["#9333ea", "#7e22ce"],
  ["#0891b2", "#0e7490"],
  ["#db2777", "#be185d"],
];

export const Avatar = ({ name = "?", size = 36, className = "" }) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [c1, c2] = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      {initials}
    </span>
  );
};

export const Spinner = ({ text }) => (
  <div className="center" style={{ padding: 48 }}>
    <div className="spinner" />
    {text && <p className="muted" style={{ marginTop: 12 }}>{text}</p>}
  </div>
);

export const Empty = ({ icon = "search", title, sub }) => (
  <div className="empty">
    <Icon name={icon} size={42} />
    <h3>{title}</h3>
    {sub && <p>{sub}</p>}
  </div>
);
