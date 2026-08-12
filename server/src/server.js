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

/* ─────────────────────────────────────────
   CORS
   ───────────────────────────────────────── */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://annasetu-vr6n.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  })
);

/* ─────────────────────────────────────────
   Preflight Requests
   ───────────────────────────────────────── */

app.options("*", cors());

/* ─────────────────────────────────────────
   Global middleware
   ───────────────────────────────────────── */

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* Tiny request logger for development */
if (ENV.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`  ➜ ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ─────────────────────────────────────────
   Routes
   ───────────────────────────────────────── */

app.use(routes);

/* ─────────────────────────────────────────
   404 + central error handler
   ───────────────────────────────────────── */

app.use(notFound);
app.use(errorHandler);

/* ─────────────────────────────────────────
   Boot
   ───────────────────────────────────────── */

const start = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(
        `🌾 Annasetu API listening on http://localhost:${ENV.PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

start();