// Shared constants — roles, statuses, API prefix — sab ek jagah.

export const USER_ROLES = {
  RESTAURANT: "restaurant", // donor — surplus food post karta hai
  NGO: "ngo",               // claim karta hai, distribute karta hai
  VOLUNTEER: "volunteer",   // claim karta hai, pickup + delivery karta hai
};

export const DONATION_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",   // kisi ne claim kar liya
  PICKED_UP: "picked_up",
  DELIVERED: "delivered", // impact count hota hai
  CANCELLED: "cancelled",
};

export const CLAIM_STATUS = {
  RESERVED: "reserved",
  PICKED_UP: "picked_up",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const COOKIE_NAME = "token";
export const API_PREFIX = "/api/v1";
