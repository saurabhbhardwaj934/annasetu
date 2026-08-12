import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import { Avatar, Empty, Icon, Spinner } from "../components/ui.jsx";
import { STATUS_META, fmtDateTime, num } from "../utils/format.js";

const TABS = ["reserved", "picked_up", "delivered", "cancelled"];

export default function MyClaims() {
  const { push } = useToast();
  const [claims, setClaims] = useState(null);
  const [tab, setTab] = useState("reserved");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api("/claims/mine");
      setClaims(d.claims);
    } catch (e) {
      push(e.message, "error");
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (!claims) return null;
    const active = claims.filter((c) => c.status === "reserved" || c.status === "picked_up");
    const rescued = claims.filter((c) => c.status === "delivered").reduce((s, c) => s + c.mealsCount, 0);
    return { total: claims.length, active: active.length, rescued };
  }, [claims]);

  const act = async (id, action, msg) => {
    setBusy(true);
    try {
      await api(`/claims/${id}/${action}`, { method: "PATCH" });
      push(msg);
      load();
    } catch (e) {
      push(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!claims) return <div className="container page"><Spinner text="Loading…" /></div>;

  const filtered = claims.filter((c) => c.status === tab);

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title"><Icon name="truck" size={26} /> My claims (pickup duty)</h1>
        <p className="sub">Claim ki hui donations — pickup karo, deliver karo, rescue count karo.</p>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="zap" size={19} /></span>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">In progress</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="heart" size={19} /></span>
          <div>
            <div className="stat-value">{num(stats.rescued)}</div>
            <div className="stat-label">Meals rescued by you</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="bowl" size={19} /></span>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total claims</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {STATUS_META[t].label}
            <span className="tab-count">{claims.filter((c) => c.status === t).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon="truck"
          title={`No ${STATUS_META[tab].label.toLowerCase()} claims`}
          sub={tab === "reserved" ? "Feed se koi donation claim karo — pickup duty shuru!" : "Yahan abhi kuch nahi hai."}
        />
      ) : (
        <div className="results-list">
          {filtered.map((c) => {
            const d = c.donation || {};
            return (
              <div key={c._id} className="card donation-row">
                <div className="donation-row-head">
                  <div>
                    <h3 className="donation-title">{d.title || "Donation"}</h3>
                    <div className="donation-meta">
                      <span className="chip"><Icon name="bowl" size={13} /> {num(c.mealsCount)} meals</span>
                      <span className="chip"><Icon name="pin" size={13} /> {d.locationLabel}</span>
                      <span className="chip"><Icon name="clock" size={13} /> Pickup by {fmtDateTime(d.pickupEndAt)}</span>
                    </div>
                  </div>
                  <div className="donation-row-actions">
                    <span className={`chip ${STATUS_META[c.status]?.cls}`}>{STATUS_META[c.status]?.label}</span>
                    <Link to={`/donations/${d._id}`} className="btn btn-ghost btn-sm">View</Link>
                  </div>
                </div>

                <div className="booking-row claim-row">
                  <Avatar name={c.donor?.name || "?"} size={30} />
                  <div>
                    <span className="semibold small">{c.donor?.orgName || c.donor?.name}</span>
                    {c.donor?.phone && (
                      <a className="muted small" href={`tel:${c.donor.phone}`}> · 📞 {c.donor.phone}</a>
                    )}
                  </div>
                  <span className="chip chip-amber"><Icon name="store" size={13} /> Donor</span>
                </div>

                <div className="claim-row-actions">
                  {c.status === "reserved" && (
                    <>
                      <button className="btn btn-green btn-sm" onClick={() => act(c._id, "pickup", "Pickup confirmed ✅")} disabled={busy}>
                        <Icon name="truck" size={14} /> Mark picked up
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => act(c._id, "cancel", "Claim cancelled — donation wapas available")} disabled={busy}>
                        <Icon name="x" size={14} /> Cancel claim
                      </button>
                    </>
                  )}
                  {c.status === "picked_up" && (
                    <button className="btn btn-primary btn-sm" onClick={() => act(c._id, "deliver", `Delivered! ${c.mealsCount} meals rescued 🎉`)} disabled={busy}>
                      <Icon name="heart" size={14} /> Mark delivered
                    </button>
                  )}
                  {c.status === "delivered" && (
                    <span className="chip chip-brand"><Icon name="check" size={13} /> {num(c.mealsCount)} meals rescued 🙌</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
