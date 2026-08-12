/**
 * Geospatial helpers (haversine) — used for distance calcs and enrichment.
 * Real geo queries ($geoWithin on 2dsphere indexes) live in the ride controller.
 */

/** Great-circle distance in km between two [lat, lng] points */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

/** km → radians (for $geoWithin $centerSphere) */
export const kmToRadians = (km) => km / 6378.1;

/** "2026-08-11" → weekday number (0=Sun … 6=Sat), timezone-safe via noon trick */
export const weekdayOf = (dateStr) => new Date(`${dateStr}T12:00:00`).getDay();

/** Today's date as "YYYY-MM-DD" (local time) */
export const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

/** date string + n days → "YYYY-MM-DD" */
export const addDaysStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
