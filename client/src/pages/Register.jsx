import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Icon } from "../components/ui.jsx";

const ROLES = [
  { id: "restaurant", label: "Restaurant / Donor", desc: "Surplus food post karo, impact dekho", icon: "store" },
  { id: "ngo", label: "NGO", desc: "Donations claim karo, distribute karo", icon: "heart" },
  { id: "volunteer", label: "Volunteer", desc: "Pickup + delivery karo, rescue count karo", icon: "users" },
];

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState("restaurant");
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await register({ name, email, password, role, orgName, phone });
      push(`Welcome to Annasetu, ${user.name.split(" ")[0]}! 🌾`);
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
          <h2>Bhojan ka setu bano.</h2>
          <p className="auth-panel-p">
            Restaurant ho ya volunteer — register karo aur rescue network ka hissa bano.
          </p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <form className="card auth-card" onSubmit={submit}>
          <h1>Create account</h1>
          <p className="muted">Free forever. No OTP, no drama.</p>

          {error && <div className="notice warn">{error}</div>}

          <div className="field">
            <label className="label">Main kaun hoon?</label>
            <div className="role-picker">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className={`role-btn ${role === r.id ? "active" : ""}`}
                  onClick={() => setRole(r.id)}
                >
                  <Icon name={r.icon} size={18} />
                  <span>
                    <b>{r.label}</b>
                    <small>{r.desc}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(role === "restaurant" || role === "ngo") && (
            <div className="field">
              <label className="label">{role === "restaurant" ? "Restaurant / business name" : "NGO name"}</label>
              <input className="input" placeholder={role === "restaurant" ? "Annapurna Bhojanalay" : "Khushi Foundation"} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
          )}

          <div className="grid-2">
            <div className="field">
              <label className="label">Name</label>
              <input className="input" placeholder="Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="field">
              <label className="label">Phone (optional)</label>
              <input className="input" type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? "Creating…" : "Join Annasetu"}
          </button>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
