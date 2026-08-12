import dotenv from "dotenv";

// Load .env from the server root (process.cwd() = /server when running npm scripts)
dotenv.config();

// Variables that MUST exist — fail fast with a friendly message instead of
// crashing later with a cryptic error.
const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("❌ Missing environment variable(s): " + missing.join(", "));
  console.error("   👉 Open server/.env and fill in the values.");
  console.error("      MONGODB_URI → your MongoDB Atlas connection string");
  process.exit(1);
}

// Placeholder guard — if you copied .env.example without editing, fail loudly.
const PLACEHOLDER_MARKERS = ["<dbUser>", "<dbPassword>", "REPLACE_WITH", "<cluster>", "<dbName>"];
const hasPlaceholder = PLACEHOLDER_MARKERS.some((m) => process.env.MONGODB_URI.includes(m));
if (hasPlaceholder) {
  console.error("❌ MONGODB_URI in server/.env still has placeholder text.");
  console.error("   👉 Replace it with your real MongoDB Atlas connection string.");
  console.error("      Steps: mongodb.com/cloud/atlas → Connect → Drivers → copy string");
  process.exit(1);
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_COOKIE_EXPIRES_IN: Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  // Comma-separated origins are supported: "http://localhost:5173,http://localhost:3000"
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((o) => o.trim()),
};
