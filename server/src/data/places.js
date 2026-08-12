/**
 * Curated list of popular pickup/drop spots in Delhi-NCR (Ghaziabad → Gurgaon).
 * Coordinates are approximate. Swap this out for a real geo-coding API later.
 * Format: { id, name, lat, lng }
 */
export const PLACES = [
  { id: "raj-nagar", name: "Raj Nagar, Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { id: "vaishali", name: "Vaishali, Ghaziabad", lat: 28.6464, lng: 77.338 },
  { id: "kaushambi", name: "Kaushambi, Ghaziabad", lat: 28.6435, lng: 77.3344 },
  { id: "indirapuram", name: "Indirapuram, Ghaziabad", lat: 28.6353, lng: 77.3711 },
  { id: "anand-vihar", name: "Anand Vihar, Delhi", lat: 28.6468, lng: 77.316 },
  { id: "laxmi-nagar", name: "Laxmi Nagar, Delhi", lat: 28.6304, lng: 77.2779 },
  { id: "mayur-vihar", name: "Mayur Vihar, Delhi", lat: 28.6139, lng: 77.289 },
  { id: "connaught-place", name: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167 },
  { id: "ito", name: "ITO, Delhi", lat: 28.6285, lng: 77.241 },
  { id: "karol-bagh", name: "Karol Bagh, Delhi", lat: 28.6519, lng: 77.1909 },
  { id: "rohini", name: "Rohini, Delhi", lat: 28.733, lng: 77.083 },
  { id: "pitampura", name: "Pitampura, Delhi", lat: 28.7, lng: 77.136 },
  { id: "nehru-place", name: "Nehru Place, Delhi", lat: 28.5485, lng: 77.253 },
  { id: "saket", name: "Saket, Delhi", lat: 28.5245, lng: 77.2066 },
  { id: "dwarka", name: "Dwarka Sec-21, Delhi", lat: 28.5561, lng: 77.0582 },
  { id: "noida-18", name: "Noida Sector 18", lat: 28.57, lng: 77.32 },
  { id: "greater-noida", name: "Greater Noida", lat: 28.4744, lng: 77.504 },
  { id: "cyber-city", name: "Gurgaon Cyber City", lat: 28.4955, lng: 77.0887 },
];

export const findPlace = (id) => PLACES.find((p) => p.id === id) || null;

/** Convert a place id (or {lat,lng} object) into { label, location: {type, coordinates} } */
export const toGeoPlace = (input) => {
  if (typeof input === "string") {
    const p = findPlace(input);
    if (!p) return null;
    return {
      label: p.name,
      location: { type: "Point", coordinates: [p.lng, p.lat] },
    };
  }
  if (input && typeof input.lat === "number" && typeof input.lng === "number") {
    return {
      label: input.label || "Custom location",
      location: { type: "Point", coordinates: [input.lng, input.lat] },
    };
  }
  return null;
};
