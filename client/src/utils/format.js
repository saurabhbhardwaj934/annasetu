// ── Formatting helpers (Annasetu) ──

/** "2026-08-13T09:00" (datetime-local) → friendly: "13 Aug, 9:00 am" */
export const fmtDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/** Pickup window end tak kitna time: "3h 20m" / "45m" / "Khatam" */
export const timeLeft = (endIso) => {
  if (!endIso) return null;
  const diff = new Date(endIso) - Date.now();
  if (diff <= 0) return { text: "Window over", urgent: true, gone: true };
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { text: `${mins}m left`, urgent: mins <= 30, gone: false };
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const urgent = h <= 2;
  return { text: `${h}h ${m}m left`, urgent, gone: false };
};

/** "2026-08-13T09:00" → local datetime-input value */
export const nowInput = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const addHoursInput = (h) => {
  const d = new Date(Date.now() + h * 3600000);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Number → "1,200" (Indian format) */
export const num = (n) => Number(n || 0).toLocaleString("en-IN");

/** Meals → kg estimate (0.45 kg/meal) */
export const kgOf = (meals) => (Number(meals || 0) * 0.45).toFixed(1);

export const FOOD_TYPE = {
  veg: { label: "Veg", cls: "chip-green" },
  "non-veg": { label: "Non-veg", cls: "chip-red" },
  mixed: { label: "Mixed", cls: "chip-amber" },
};

export const ROLE_META = {
  restaurant: { label: "Restaurant / Donor", icon: "store" },
  ngo: { label: "NGO", icon: "heart" },
  volunteer: { label: "Volunteer", icon: "users" },
};

export const STATUS_META = {
  available: { label: "Available", cls: "chip-green" },
  reserved: { label: "Claimed", cls: "chip-amber" },
  picked_up: { label: "Picked up", cls: "chip-blue" },
  delivered: { label: "Delivered", cls: "chip-brand" },
  cancelled: { label: "Cancelled", cls: "chip-red" },
};
