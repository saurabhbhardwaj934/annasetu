import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { findPlace } from "../data/places.js";
import PlaceSelect from "../components/PlaceSelect.jsx";
import DonationCard from "../components/DonationCard.jsx";
import { Empty, Icon, Spinner } from "../components/ui.jsx";

const FOOD_FILTERS = [
  { id: "all", label: "Sab kuch" },
  { id: "veg", label: "Veg" },
  { id: "non-veg", label: "Non-veg" },
  { id: "mixed", label: "Mixed" },
];

export default function Feed() {
  const [params, setParams] = useSearchParams();
  const [fromId, setFromId] = useState(params.get("fromId") || "");
  const [foodType, setFoodType] = useState(params.get("foodType") || "all");
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setDonations(null);
    try {
      const qs = new URLSearchParams({ foodType: params.get("foodType") || "all" });
      const f = findPlace(params.get("fromId"));
      if (f) {
        qs.set("lat", f.lat);
        qs.set("lng", f.lng);
        qs.set("radius", "10");
      }
      const d = await api(`/donations?${qs.toString()}`, { auth: false });
      setDonations(d.donations);
      setError("");
    } catch (e) {
      setError(e.message);
      setDonations([]);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = () => {
    const qs = new URLSearchParams({ foodType });
    if (fromId) qs.set("fromId", fromId);
    setParams(qs);
  };

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title">
          <Icon name="bowl" size={26} /> Available donations
        </h1>
        <p className="sub">Jo log aaj khana de rahe hain — claim karo, pickup karo, bhookh mitao.</p>
      </div>

      {/* Filters */}
      <div className="card filter-card">
        <PlaceSelect label="Near (optional)" value={fromId} onChange={setFromId} placeholder="Kisi bhi jagah se" />
        <div className="field">
          <label className="label">Food type</label>
          <div className="seg seg-inline">
            {FOOD_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`seg-btn ${foodType === f.id ? "active" : ""}`}
                onClick={() => setFoodType(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-lg filter-btn" onClick={apply}>
          <Icon name="search" size={17} />
          Search
        </button>
      </div>

      {error && <div className="notice warn">{error}</div>}

      {donations === null ? (
        <Spinner text="Dhundo dhundo… paas ki donations dhoond rahe hain" />
      ) : donations.length === 0 ? (
        <Empty
          icon="bowl"
          title="Abhi koi donation available nahi"
          sub="Thodi der baad check karo, ya khud surplus post karo — setu banao!"
        />
      ) : (
        <>
          <div className="results-head">
            <span className="chip chip-green">
              <Icon name="check" size={13} />
              {donations.length} donation{donations.length > 1 ? "s" : ""} live
            </span>
            <span className="muted small">Pickup window ke hisaab se sorted</span>
          </div>
          <div className="donation-grid">
            {donations.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
