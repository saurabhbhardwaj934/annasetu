import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Avatar, Icon, Spinner } from "../components/ui.jsx";
import { ROLE_META, num } from "../utils/format.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api("/donations/mine"),
      api("/claims/mine"),
    ]).then(([d, c]) => {
      const donations = d.status === "fulfilled" ? d.value.donations : [];
      const claims = c.status === "fulfilled" ? c.value.claims : [];
      const deliveredDonations = donations.filter((x) => x.status === "delivered");
      setStats({
        posted: donations.length,
        claims: claims.length,
        mealsDonated: deliveredDonations.reduce((s, x) => s + x.mealsCount, 0),
        mealsRescued: user.mealsRescued || 0,
      });
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    push("Logged out. Phir milenge! 👋");
    navigate("/");
  };

  if (!stats) return <div className="container page"><Spinner text="Loading profile…" /></div>;

  return (
    <div className="container page">
      <div className="profile-grid">
        <div className="card card-pad profile-card">
          <Avatar name={user.name} size={76} />
          <h2>{user.name}</h2>
          {user.orgName && <p className="semibold small" style={{ color: "var(--brand-dark)" }}>{user.orgName}</p>}
          <p className="muted">{user.email}</p>
          {user.phone && <p className="muted small">📞 {user.phone}</p>}
          <span className="chip chip-brand">{ROLE_META[user.role]?.label}</span>

          <div className="divider" />
          <div className="profile-impact">
            <div>
              <span className="stat-value">{num(user.mealsDonated)}</span>
              <span className="stat-label">meals donated</span>
            </div>
            <div>
              <span className="stat-value">{num(user.mealsRescued)}</span>
              <span className="stat-label">meals rescued</span>
            </div>
          </div>

          <button className="btn btn-danger btn-block" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Logout
          </button>
        </div>

        <div className="profile-main">
          <div className="stat-grid">
            <div className="card stat-card">
              <span className="stat-icon"><Icon name="store" size={19} /></span>
              <div>
                <div className="stat-value">{stats.posted}</div>
                <div className="stat-label">Donations posted</div>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon"><Icon name="truck" size={19} /></span>
              <div>
                <div className="stat-value">{stats.claims}</div>
                <div className="stat-label">Claims made</div>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon"><Icon name="heart" size={19} /></span>
              <div>
                <div className="stat-value">{num(stats.mealsDonated)}</div>
                <div className="stat-label">Meals donated</div>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon"><Icon name="zap" size={19} /></span>
              <div>
                <div className="stat-value">{num(stats.mealsRescued)}</div>
                <div className="stat-label">Meals rescued</div>
              </div>
            </div>
          </div>

          <div className="profile-links">
            <Link to="/post" className="card pad-card">
              <Icon name="store" size={22} />
              <div>
                <h3>Post donation</h3>
                <p className="muted small">Surplus khana post karo — pickup window ke saath.</p>
              </div>
            </Link>
            <Link to="/feed" className="card pad-card">
              <Icon name="search" size={22} />
              <div>
                <h3>Find food</h3>
                <p className="muted small">Paas ki available donations dekho aur claim karo.</p>
              </div>
            </Link>
            <Link to="/my-donations" className="card pad-card">
              <Icon name="bowl" size={22} />
              <div>
                <h3>My donations</h3>
                <p className="muted small">Posted donations — claims aur status yahan.</p>
              </div>
            </Link>
            <Link to="/my-claims" className="card pad-card">
              <Icon name="truck" size={22} />
              <div>
                <h3>My claims</h3>
                <p className="muted small">Pickup duty — claim se deliver tak.</p>
              </div>
            </Link>
            <Link to="/impact" className="card pad-card">
              <Icon name="trend" size={22} />
              <div>
                <h3>Impact</h3>
                <p className="muted small">Puri community ka rescue report.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
