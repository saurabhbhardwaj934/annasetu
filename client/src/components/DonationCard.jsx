import { Link } from "react-router-dom";
import { Avatar, Icon } from "./ui.jsx";
import { FOOD_TYPE, STATUS_META, fmtDateTime, kgOf, num, timeLeft } from "../utils/format.js";

/**
 * Card for a donation in the feed / dashboards.
 */
export default function DonationCard({ donation, showWindow = true }) {
  const donor = donation.donor || {};
  const type = FOOD_TYPE[donation.foodType] || FOOD_TYPE.veg;
  const left = timeLeft(donation.pickupEndAt);
  const status = STATUS_META[donation.status] || STATUS_META.available;

  return (
    <Link to={`/donations/${donation._id}`} className="card donation-card">
      <div className="donation-card-top">
        <span className={`chip ${type.cls}`}>
          <Icon name={donation.foodType === "veg" ? "leaf" : donation.foodType === "non-veg" ? "bowl" : "bowl"} size={13} />
          {type.label}
        </span>
        <span className={`chip ${status.cls}`}>{status.label}</span>
      </div>

      <h3 className="donation-title">{donation.title}</h3>
      {donation.description && (
        <p className="donation-desc">{donation.description.slice(0, 90)}{donation.description.length > 90 ? "…" : ""}</p>
      )}

      <div className="donation-meta">
        <span className="chip">
          <Icon name="bowl" size={13} />
          {num(donation.mealsCount)} meals
        </span>
        <span className="chip">
          <Icon name="leaf" size={13} />
          ~{kgOf(donation.mealsCount)} kg
        </span>
        <span className="chip">
          <Icon name="pin" size={13} />
          {donation.locationLabel}
        </span>
      </div>

      {showWindow && (
        <div className="donation-window">
          <span className="chip">
            <Icon name="clock" size={13} />
            Pickup: {fmtDateTime(donation.pickupStartAt)} → {fmtDateTime(donation.pickupEndAt)}
          </span>
          {left && !left.gone && (
            <span className={`chip ${left.urgent ? "chip-red" : "chip-green"}`}>
              <Icon name="alert" size={13} />
              {left.text}
            </span>
          )}
        </div>
      )}

      <div className="donation-card-foot">
        <div className="donor-mini">
          <Avatar name={donor.name || "?"} size={26} />
          <span className="small semibold">{donor.orgName || donor.name}</span>
        </div>
        <span className="donation-go">
          Details <Icon name="chevron" size={14} />
        </span>
      </div>
    </Link>
  );
}
