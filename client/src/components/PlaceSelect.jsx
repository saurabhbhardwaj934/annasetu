import { useState } from "react";
import { PLACES } from "../data/places.js";
import { Icon } from "./ui.jsx";

/**
 * Location picker.
 *  - value: place id (string) or { label, lat, lng } when custom
 *  - onChange fires with the same shapes
 *  - allowCustom adds a "Custom location…" option with lat/lng inputs
 */
export default function PlaceSelect({ value, onChange, label, placeholder = "Choose a spot", allowCustom = false }) {
  const [custom, setCustom] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");

  const isCustom = custom || (value && typeof value === "object");

  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === "__custom__") {
      setCustom(true);
      return;
    }
    setCustom(false);
    onChange(v);
  };

  const applyCustom = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    onChange({ label: "Custom location", lat, lng });
  };

  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      <div className="place-pick">
        <span className="place-pick-icon">
          <Icon name="pin" size={15} />
        </span>
        <select className="input" value={isCustom ? "__custom__" : value || ""} onChange={handleSelect}>
          <option value="" disabled>
            {placeholder}
          </option>
          {PLACES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          {allowCustom && <option value="__custom__">📍 Custom location…</option>}
        </select>
      </div>

      {isCustom && allowCustom && (
        <div className="custom-loc">
          <input
            className="input"
            type="number"
            step="any"
            placeholder="Latitude (e.g. 28.6692)"
            value={customLat}
            onChange={(e) => setCustomLat(e.target.value)}
          />
          <input
            className="input"
            type="number"
            step="any"
            placeholder="Longitude (e.g. 77.4538)"
            value={customLng}
            onChange={(e) => setCustomLng(e.target.value)}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={applyCustom}>
            Use this spot
          </button>
        </div>
      )}
    </div>
  );
}
