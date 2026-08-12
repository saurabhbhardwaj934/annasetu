import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Avatar, Empty, Icon, Spinner } from "../components/ui.jsx";
import {
  FOOD_TYPE, ROLE_META, STATUS_META, fmtDateTime, kgOf, num, timeLeft,
} from "../utils/format.js";

const STEP_META = [
  { key: "available", label: "Posted", icon: "store" },
  { key: "reserved", label: "Claimed", icon: "users" },
  { key: "picked_up", label: "Picked up", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "heart" },
];

const ORDER = ["available", "reserved", "picked_up", "delivered"];

export default function DonationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { donation, claim }
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api(`/donations/${id}`, { auth: false });
      setData(d);
    } catch (e) {
      if (e.status === 404) setNotFound(true);
      else push(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, push]);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async () => {
    setBusy(true);
    try {
      await api(`/claims/donations/${id}/claim`, { method: "POST" });
      push("Claim ho gaya! Pickup time pe pahuncho 🛺");
      load();
    } catch (e) {
      push(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const act = async (path, msg) => {
    setBusy(true);
    try {
      await api(path, { method: "PATCH" });
      push(msg);
      load();
    } catch (e) {
      push(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelDonation = async () => {
    if (!confirm("Donation cancel karein? Agar koi claim hai to woh bhi cancel hoga.")) return;
    await act(`/donations/${id}/cancel`, "Donation cancelled");
  };

  if (loading) return <div className="container page"><Spinner text="Loading…" /></div>;
  if (notFound) {
    return (
      <div className="container page">
        <Empty icon="bowl" title="Donation nahi mili" sub="Shayad pickup window khatam hone par Atlas ne delete kar diya (TTL)." />
      </div>
    );
  }

  const { donation, claim: claimObj } = data;
  const donor = donation.donor || {};
  const type = FOOD_TYPE[donation.foodType] || FOOD_TYPE.veg;
  const status = STATUS_META[donation.status] || STATUS_META.available;
  const left = timeLeft(donation.pickupEndAt);

  const isDonor = user && donor._id === user._id;
  const isClaimant = user && claimObj && claimObj.claimant?._id === user._id;
  const canClaim = user && !isDonor && !claimObj && donation.status === "available";
  const stepIndex = ORDER.indexOf(donation.status);

  return (
    <div className="container page">
      <Link to="/feed" className="back-link">← Back to donations</Link>

      <div className="detail-grid">
        {/* ── LEFT: donation info ── */}
        <div>
          <div className="card card-pad">
            <div className="donation-card-top">
              <span className={`chip ${type.cls}`}>{type.label}</span>
              <span className={`chip ${status.cls}`}>{status.label}</span>
              {left && !left.gone && donation.status === "available" && (
                <span className={`chip ${left.urgent ? "chip-red" : "chip-green"}`}>
                  <Icon name="alert" size={13} />
                  {left.text}
                </span>
              )}
            </div>

            <h1 className="detail-title">{donation.title}</h1>
            {donation.description && <p className="detail-desc">{donation.description}</p>}

            <div className="detail-stats">
              <div className="detail-stat">
                <Icon name="bowl" size={18} />
                <div>
                  <span className="stat-num">{num(donation.mealsCount)}</span>
                  <span className="stat-lab">meals</span>
                </div>
              </div>
              <div className="detail-stat">
                <Icon name="leaf" size={18} />
                <div>
                  <span className="stat-num">~{kgOf(donation.mealsCount)} kg</span>
                  <span className="stat-lab">food</span>
                </div>
              </div>
              <div className="detail-stat">
                <Icon name="pin" size={18} />
                <div>
                  <span className="stat-num">{donation.locationLabel}</span>
                  <span className="stat-lab">pickup location</span>
                </div>
              </div>
            </div>

            <div className="window-box">
              <div className="between">
                <span className="label">Pickup window</span>
                <Icon name="clock" size={16} />
              </div>
              <div className="window-times">
                <span className="chip chip-green"><Icon name="check" size={12} /> {fmtDateTime(donation.pickupStartAt)}</span>
                <span className="muted">→</span>
                <span className={`chip ${left?.gone ? "chip-red" : "chip-amber"}`}>
                  <Icon name="clock" size={12} /> {fmtDateTime(donation.pickupEndAt)}
                </span>
              </div>
            </div>

            {donation.notes && (
              <div className="notice">
                <Icon name="spark" size={15} />
                <span><b>Donor's note:</b> {donation.notes}</span>
              </div>
            )}

            {/* Status timeline */}
            <div className="timeline">
              {STEP_META.map((s, i) => {
                const done = donation.status === "delivered" ? i <= 3 : i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={s.key} className={`timeline-step ${done ? "done" : ""} ${current ? "current" : ""}`}>
                    <span className="timeline-dot"><Icon name={s.icon} size={13} /></span>
                    <span className="timeline-label">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donor card */}
          <div className="card card-pad donor-card">
            <div className="between">
              <div className="donor-main">
                <Avatar name={donor.name || "?"} size={48} />
                <div>
                  <h3>{donor.orgName || donor.name}</h3>
                  <p className="muted small">
                    {ROLE_META[donor.role]?.label} · {num(donor.mealsDonated)} meals donated
                  </p>
                </div>
              </div>
              {donor.phone && (
                <a className="btn btn-outline btn-sm" href={`tel:${donor.phone}`}>
                  <Icon name="phone" size={14} /> {donor.phone}
                </a>
              )}
            </div>
          </div>

          {/* Claimer info (donor ko dikhta hai) */}
          {claimObj && isDonor && (
            <div className="card card-pad">
              <h3 className="form-head">
                <Icon name="users" size={16} /> Claimer
              </h3>
              <div className="donor-main">
                <Avatar name={claimObj.claimant?.name || "?"} size={42} />
                <div>
                  <h4>{claimObj.claimant?.orgName || claimObj.claimant?.name}</h4>
                  <p className="muted small">
                    {ROLE_META[claimObj.claimant?.role]?.label} · {num(claimObj.claimant?.mealsRescued)} meals rescued
                  </p>
                  {claimObj.claimant?.phone && (
                    <p className="small semibold" style={{ marginTop: 4 }}>
                      <Icon name="phone" size={13} /> {claimObj.claimant.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: action panel ── */}
        <div className="side-col">
          {/* Donor actions */}
          {isDonor ? (
            <div className="card card-pad booking-card">
              <h3>Manage donation</h3>
              <p className="muted small">
                {donation.status === "available" && "Abhi koi claim nahi aaya."}
                {donation.status === "reserved" && "Claim aa gaya — claimer se phone pe coordinate karo."}
                {donation.status === "picked_up" && "Khana pickup ho gaya — delivery ka intezaar."}
                {donation.status === "delivered" && "Shukriya! Meals rescue count mein add ho gaye. 🎉"}
                {donation.status === "cancelled" && "Yeh donation cancel ho chuki hai."}
              </p>
              {donation.status !== "delivered" && donation.status !== "cancelled" && (
                <button className="btn btn-danger btn-block" onClick={cancelDonation} disabled={busy}>
                  <Icon name="x" size={16} /> Cancel donation
                </button>
              )}
            </div>
          ) : claimObj ? (
            <div className="card card-pad booking-card">
              <h3>Claim status</h3>
              <div className="claim-summary">
                <span className="chip chip-amber"><Icon name="bowl" size={13} /> {num(claimObj.mealsCount)} meals</span>
                <span className="chip"><Icon name="clock" size={13} /> Claimed {fmtDateTime(claimObj.claimedAt)}</span>
              </div>

              {isClaimant && (
                <div className="claim-actions">
                  {claimObj.status === "reserved" && (
                    <>
                      <button className="btn btn-green btn-block" onClick={() => act(`/claims/${claimObj._id}/pickup`, "Pickup confirmed ✅")} disabled={busy}>
                        <Icon name="truck" size={16} /> Mark picked up
                      </button>
                      <button className="btn btn-danger btn-block" onClick={() => act(`/claims/${claimObj._id}/cancel`, "Claim cancelled — donation wapas available")} disabled={busy}>
                        <Icon name="x" size={16} /> Cancel claim
                      </button>
                    </>
                  )}
                  {claimObj.status === "picked_up" && (
                    <button className="btn btn-primary btn-block" onClick={() => act(`/claims/${claimObj._id}/deliver`, `Delivered! ${claimObj.mealsCount} meals rescued 🎉`)} disabled={busy}>
                      <Icon name="heart" size={16} /> Mark delivered
                    </button>
                  )}
                  {claimObj.status === "delivered" && (
                    <div className="notice">
                      <Icon name="check" size={15} />
                      <span>Delivered! {num(claimObj.mealsCount)} meals rescued. 🙌</span>
                    </div>
                  )}
                </div>
              )}

              {!isClaimant && (
                <p className="muted small">Yeh donation kisi aur ne claim kar li hai — dusri donation dhoondo.</p>
              )}
            </div>
          ) : (
            <div className="card card-pad booking-card">
              <h3>Claim this donation</h3>
              <div className="fare-box">
                <div className="between">
                  <span className="muted">Meals milenge</span>
                  <span className="fare-total">{num(donation.mealsCount)} 🍲</span>
                </div>
                <div className="between">
                  <span className="muted">Approx weight</span>
                  <span className="semibold">~{kgOf(donation.mealsCount)} kg</span>
                </div>
              </div>

              {donation.status !== "available" ? (
                <div className="notice warn">Yeh donation ab available nahi hai.</div>
              ) : !user ? (
                <>
                  <p className="muted small">Claim karne ke liye login chahiye.</p>
                  <Link to="/login" className="btn btn-primary btn-block btn-lg">Login to claim</Link>
                </>
              ) : (
                <>
                  <p className="muted small">
                    Claim karte hi donation reserve ho jayegi — pickup window ke andar lena hoga.
                  </p>
                  <button className="btn btn-primary btn-block btn-lg" onClick={claim} disabled={busy}>
                    {busy ? "Claiming…" : `Claim ${num(donation.mealsCount)} meals`}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
