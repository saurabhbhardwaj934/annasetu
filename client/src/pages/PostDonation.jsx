import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import PlaceSelect from "../components/PlaceSelect.jsx";
import { Icon } from "../components/ui.jsx";
import { addHoursInput, kgOf, nowInput, num } from "../utils/format.js";
import { findPlace } from "../data/places.js";

export default function PostDonation() {
  const { push } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [mealsCount, setMealsCount] = useState(10);
  const [fromId, setFromId] = useState("");
  const [pickupStart, setPickupStart] = useState(addHoursInput(1));
  const [pickupEnd, setPickupEnd] = useState(addHoursInput(4));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loc = useMemo(
    () => (typeof fromId === "string" ? findPlace(fromId) : fromId),
    [fromId]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return push("Title daalo — kya de rahe ho?", "error");
    if (!loc) return push("Pickup location select karo", "error");
    if (new Date(pickupEnd) <= new Date(pickupStart)) return push("Pickup end time, start ke baad hona chahiye", "error");

    setSaving(true);
    try {
      await api("/donations", {
        method: "POST",
        body: {
          title,
          description,
          foodType,
          mealsCount,
          fromId: typeof fromId === "string" ? fromId : undefined,
          customFrom: typeof fromId === "object" ? fromId : undefined,
          pickupStartAt: pickupStart,
          pickupEndAt: pickupEnd,
          notes,
        },
      });
      push("Donation posted — khana waste nahi hoga! 🌾");
      navigate("/my-donations");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title">
          <Icon name="store" size={26} /> Post surplus food
        </h1>
        <p className="sub">Bacha hua khana kisi ka intezaar karta hai — pickup window ke saath post karo.</p>
      </div>

      <form className="post-grid" onSubmit={submit}>
        <div className="card card-pad">
          <h3 className="form-head">1 · Kya de rahe ho?</h3>

          <div className="field">
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="e.g. 20 plates dal-chawal + sabzi (lunch surplus)"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Description (optional)</label>
            <textarea
              className="input"
              rows="3"
              maxLength="500"
              placeholder="Kaunsa khana hai, packing kaise hai, kya le jaana hai…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Food type</label>
            <div className="seg">
              <button type="button" className={`seg-btn ${foodType === "veg" ? "active" : ""}`} onClick={() => setFoodType("veg")}>
                <Icon name="leaf" size={16} /> Veg
              </button>
              <button type="button" className={`seg-btn ${foodType === "non-veg" ? "active" : ""}`} onClick={() => setFoodType("non-veg")}>
                <Icon name="bowl" size={16} /> Non-veg
              </button>
              <button type="button" className={`seg-btn ${foodType === "mixed" ? "active" : ""}`} onClick={() => setFoodType("mixed")}>
                <Icon name="bowl" size={16} /> Mixed
              </button>
            </div>
          </div>

          <div className="field">
            <label className="label">Kitne meals? ({num(mealsCount)})</label>
            <div className="stepper">
              <button type="button" className="step-btn" onClick={() => setMealsCount((s) => Math.max(1, s - 5))} disabled={mealsCount <= 1}>
                <Icon name="minus" size={15} />
              </button>
              <span className="step-count">{mealsCount}</span>
              <button type="button" className="step-btn" onClick={() => setMealsCount((s) => Math.min(10000, s + 5))} disabled={mealsCount >= 10000}>
                <Icon name="plus" size={15} />
              </button>
            </div>
          </div>

          <h3 className="form-head mt">2 · Kahan aur kab?</h3>

          <PlaceSelect label="Pickup location" value={fromId} onChange={setFromId} placeholder="Kahan se pickup karna hai…" allowCustom />

          <div className="grid-2">
            <div className="field">
              <label className="label">Pickup window start</label>
              <input type="datetime-local" className="input" value={pickupStart} min={nowInput()} onChange={(e) => setPickupStart(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Pickup window end</label>
              <input type="datetime-local" className="input" value={pickupEnd} min={pickupStart} onChange={(e) => setPickupEnd(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Note for claimer (optional)</label>
            <textarea
              className="input"
              rows="2"
              maxLength="300"
              placeholder="e.g. Service entrance se aana, apna dabba le aana"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="card card-pad post-summary">
          <h3>Impact preview</h3>
          <div className="impact-preview">
            <div className="preview-item">
              <Icon name="bowl" size={20} />
              <div>
                <span className="preview-num">{num(mealsCount)}</span>
                <span className="preview-lab">meals saved</span>
              </div>
            </div>
            <div className="preview-item">
              <Icon name="leaf" size={20} />
              <div>
                <span className="preview-num">~{kgOf(mealsCount)} kg</span>
                <span className="preview-lab">food waste avoided</span>
              </div>
            </div>
            <div className="preview-item">
              <Icon name="trend" size={20} />
              <div>
                <span className="preview-num">~{(mealsCount * 2.5).toLocaleString("en-IN")} kg</span>
                <span className="preview-lab">CO₂ saved</span>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="summary-row">
            <span className="muted">Location</span>
            <span className="semibold">{loc ? loc.name : "—"}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Pickup window</span>
            <span className="semibold">
              {pickupStart ? new Date(pickupStart).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—"} →{" "}
              {pickupEnd ? new Date(pickupEnd).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—"}
            </span>
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={saving}>
            {saving ? "Posting…" : "Post donation"}
          </button>
          <p className="muted small" style={{ textAlign: "center" }}>
            Unclaimed + expired donations Atlas TTL se auto-delete ho jaati hain.
          </p>
        </div>
      </form>
    </div>
  );
}
