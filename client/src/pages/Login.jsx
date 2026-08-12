import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Icon } from "../components/ui.jsx";

const PERKS = [
  "Geo-matched donations within 10 km",
  "Atomic claims — kabhi double-claim nahi",
  "TTL auto-expiry for stale donations",
  "Live impact dashboard (meals, CO₂)",
];

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(email, password);
      push(`Welcome back, ${user.name.split(" ")[0]}! 🌾`);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="auth-panel-in">
          <div className="logo" style={{ color: "#fff" }}>
            <span className="logo-badge"><Icon name="bowl" size={22} /></span>
            Anna<span style={{ color: "#4ade80" }}>Setu</span>
          </div>
          <h2>Ek plate bhi waste nahi.</h2>
          <ul className="perk-list">
            {PERKS.map((p) => (
              <li key={p}><Icon name="check" size={16} /> {p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-form-wrap">
        <form className="card auth-card" onSubmit={submit}>
          <h1>Login</h1>
          <p className="muted">Apne Annasetu account mein wapas aao.</p>

          {error && <div className="notice warn">{error}</div>}

          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? "Logging in…" : "Login"}
          </button>

          <p className="auth-alt">
            Naya ho? <Link to="/register">Register free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
