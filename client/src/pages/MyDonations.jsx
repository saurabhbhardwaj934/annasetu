import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import { Avatar, Empty, Icon, Spinner } from "../components/ui.jsx";
import { ROLE_META, STATUS_META, fmtDateTime, num } from "../utils/format.js";

const TABS = ["available", "reserved", "delivered", "cancelled"];

export default function MyDonations() {
  const { push } = useToast();
  const [donations, setDonations] = useState(null);
  const [tab, setTab] = useState("available");

  const load = useCallback(async () => {
    try {
      const d = await api("/donations/mine");
      setDonations(d.donations);
    } catch (e) {
      push(e.message, "error");
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (!donations) return null;
    const active = donations.filter((d) => d.status === "available" || d.status === "reserved");
    const delivered = donations.filter((d) => d.status === "delivered");
    const meals = delivered.reduce((s, d) => s + d.mealsCount, 0);
    return { total: donations.length, active: active.length, delivered: delivered.length, meals };
  }, [donations]);

  const cancel = async (id) => {
    if (!confirm("Donation cancel karein? Claim ho to woh bhi cancel hoga.")) return;
    try {
      await api(`/donations/${id}/cancel`, { method: "PATCH" });
      push("Donation cancelled");
      load();
    } catch (e) {
      push(e.message, "error");
    }
  };

  if (!donations) return <div className="container page"><Spinner text="Loading…" /></div>;

  const filtered = donations.filter((d) => d.status === tab);

  return (
    <div className="container page">
      <div className="page-head between">
        <div>
          <h1 className="page-title"><Icon name="store" size={26} /> My donations</h1>
          <p className="sub">Aapke posted donations — claims, pickup aur impact yahan.</p>
        </div>
        <Link to="/post" className="btn btn-primary">
          <Icon name="plus" size={16} /> Post surplus
        </Link>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="bowl" size={19} /></span>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total posted</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="zap" size={19} /></span>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Live / claimed</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="heart" size={19} /></span>
          <div>
            <div className="stat-value">{num(stats.meals)}</div>
            <div className="stat-label">Meals rescued</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="check" size={19} /></span>
          <div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {STATUS_META[t].label}
            <span className="tab-count">{donations.filter((d) => d.status === t).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon="bowl"
          title={`No ${STATUS_META[tab].label.toLowerCase()} donations`}
          sub={tab === "available" ? "Pehla surplus post karo — koi na koi claim zaroor karega!" : "Yahan abhi kuch nahi hai."}
        />
      ) : (
        <div className="results-list">
          {filtered.map((d) => {
            const status = STATUS_META[d.status];
            return (
              <div key={d._id} className="card donation-row">
                <div className="donation-row-head">
                  <div>
                    <h3 className="donation-title">{d.title}</h3>
                    <div className="donation-meta">
                      <span className="chip"><Icon name="bowl" size={13} /> {num(d.mealsCount)} meals</span>
                      <span className="chip"><Icon name="pin" size={13} /> {d.locationLabel}</span>
                      <span className="chip"><Icon name="clock" size={13} /> {fmtDateTime(d.pickupEndAt)}</span>
                    </div>
                  </div>
                  <div className="donation-row-actions">
                    <span className={`chip ${status.cls}`}>{status.label}</span>
                    <Link to={`/donations/${d._id}`} className="btn btn-ghost btn-sm">View</Link>
                    {(d.status === "available" || d.status === "reserved") && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(d._id)}>
                        <Icon name="x" size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {d.claim && (
                  <div className="booking-row claim-row">
                    <Avatar name={d.claim.claimant?.name || "?"} size={30} />
                    <div>
                      <span className="semibold small">{d.claim.claimant?.orgName || d.claim.claimant?.name}</span>
                      <span className="muted small">
                        {" "}· {ROLE_META[d.claim.claimant?.role]?.label}
                        {d.claim.claimant?.phone && <> · 📞 {d.claim.claimant.phone}</>}
                      </span>
                    </div>
                    <span className={`chip ${STATUS_META[d.claim.status]?.cls || "chip-amber"}`}>
                      {STATUS_META[d.claim.status]?.label}
                    </span>
                  </div>
                )}
                {!d.claim && (d.status === "available") && (
                  <p className="muted small pad">No claim yet — feed mein live hai.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
