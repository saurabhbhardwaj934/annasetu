import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar, Icon } from "./ui.jsx";
import { useToast } from "./Toast.jsx";
import { ROLE_META } from "../utils/format.js";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/feed", label: "Find food" },
  { to: "/post", label: "Post donation" },
  { to: "/my-donations", label: "My donations" },
  { to: "/my-claims", label: "My claims" },
  { to: "/impact", label: "Impact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    push("Logged out. Phir milenge! 👋");
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="container nav-in">
        <Link to="/" className="logo">
          <span className="logo-badge">
            <Icon name="bowl" size={22} />
          </span>
          Anna<span style={{ color: "var(--brand)" }}>Setu</span>
        </Link>

        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <span className="chip chip-brand hidden-mobile" title={ROLE_META[user.role]?.label}>
                {ROLE_META[user.role]?.label}
              </span>
              <Link to="/profile" className="nav-user" title={user.email}>
                <Avatar name={user.name} size={32} />
                <span className="nav-user-name">{user.name.split(" ")[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
                <Icon name="logout" size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
