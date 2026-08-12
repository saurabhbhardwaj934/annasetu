/**
 * 🌾 Annasetu — Surplus Food Rescue Network (MERN + MongoDB Atlas)
 *
 * Database: MongoDB Atlas (MONGODB_URI in server/.env).
 * Create your free cluster at https://www.mongodb.com/cloud/atlas
 */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";

const app = express();

// ── Global middleware ──
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Tiny request logger for development
if (ENV.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`  ➜ ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Routes ──
app.use(routes);

// ── 404 + central error handler (must be last) ──
app.use(notFound);
app.use(errorHandler);

// ── Boot ──
const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, "0.0.0.0", () => {
    console.log(`🌾 Annasetu API listening on http://localhost:${ENV.PORT}`);
  });
};

start();
