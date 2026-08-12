import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { Avatar, Empty, Icon, Spinner } from "../components/ui.jsx";
import { num } from "../utils/format.js";

export default function Impact() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api("/impact", { auth: false }).then(setImpact).catch(() => setImpact({}));
  }, []);

  if (!impact) return <div className="container page"><Spinner text="Impact calculate ho raha hai…" /></div>;

  const monthly = impact.monthly || [];
  const maxMeals = Math.max(1, ...monthly.map((m) => m.meals));
  const topDonors = impact.topDonors || [];
  const topRescuers = impact.topRescuers || [];

  const cards = [
    { icon: "bowl", label: "Meals rescued", value: num(impact.meals) },
    { icon: "leaf", label: "Food saved (kg)", value: num(impact.kgSaved) + " kg" },
    { icon: "trend", label: "CO₂ avoided (kg)", value: num(impact.co2SavedKg) + " kg" },
    { icon: "zap", label: "Live donations", value: num(impact.activeDonations) },
    { icon: "truck", label: "Pickups pending", value: num(impact.pendingPickups) },
    { icon: "users", label: "Claims completed", value: num(impact.claims) },
  ];

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title">
          <Icon name="trend" size={26} /> Impact dashboard
        </h1>
        <p className="sub">
          Har delivered meal ka hisaab — aggregation pipelines se live calculate.
          (Estimates: 1 meal ≈ 0.45 kg food ≈ 2.5 kg CO₂e)
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid six">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <span className="stat-icon"><Icon name={c.icon} size={19} /></span>
            <div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card card-pad chart-card">
        <h3 className="form-head">Meals rescued — monthly trend</h3>
        {monthly.length === 0 ? (
          <p className="muted small">Abhi koi delivery nahi hui — pehla rescue karo!</p>
        ) : (
          <div className="bar-chart">
            {monthly.map((m) => (
              <div key={m._id} className="bar-col">
                <span className="bar-value">{num(m.meals)}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${Math.max(4, (m.meals / maxMeals) * 100)}%` }}
                  />
                </div>
                <span className="bar-label">{m._id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="impact-lists">
        {/* Top donors */}
        <div className="card card-pad">
          <h3 className="form-head"><Icon name="store" size={16} /> Top donors</h3>
          {topDonors.length === 0 ? (
            <p className="muted small">Abhi koi data nahi.</p>
          ) : (
            topDonors.map((d, i) => (
              <div key={d._id} className="rank-row">
                <span className="rank-num">{i + 1}</span>
                <Avatar name={d.name || "?"} size={30} />
                <span className="semibold small">{d.orgName || d.name}</span>
                <span className="chip chip-brand">{num(d.meals)} meals</span>
              </div>
            ))
          )}
        </div>

        {/* Top rescuers */}
        <div className="card card-pad">
          <h3 className="form-head"><Icon name="heart" size={16} /> Top rescuers</h3>
          {topRescuers.length === 0 ? (
            <p className="muted small">Abhi koi data nahi.</p>
          ) : (
            topRescuers.map((d, i) => (
              <div key={d._id} className="rank-row">
                <span className="rank-num">{i + 1}</span>
                <Avatar name={d.name || "?"} size={30} />
                <span className="semibold small">{d.orgName || d.name}</span>
                <span className="chip chip-green">{num(d.meals)} meals</span>
              </div>
            ))
          )}
        </div>
      </div>

      {impact.meals === 0 && (
        <div className="cta-band" style={{ marginTop: 24 }}>
          <div>
            <h2>Zero rescue abhi tak? 🍲</h2>
            <p>Pehla donation post karo ya claim karo — numbers upar chalte dekho.</p>
          </div>
          <div className="cta-actions">
            <Link to="/post" className="btn btn-primary btn-lg">Post donation</Link>
            <Link to="/feed" className="btn btn-light btn-lg">Find food</Link>
          </div>
        </div>
      )}
    </div>
  );
}
