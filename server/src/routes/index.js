/**
 * 🌾 Annasetu — Surplus Food Rescue Network (MERN + MongoDB Atlas)
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

  // Vercel production
  "https://annasetu-vr6n.vercel.app",

  // Vercel preview
  "https://annasetu-vr6n-jnslem189-saurabh-bhardwaj-s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview URLs for this project
      if (
        origin.startsWith("https://annasetu-vr6n-") &&
        origin.endsWith(".vercel.app")
      ) {
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

/* Preflight */
app.options("*", cors());

/* ─────────────────────────────────────────
   Global middleware
   ───────────────────────────────────────── */

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (ENV.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`➜ ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ─────────────────────────────────────────
   Routes
   ───────────────────────────────────────── */

app.use(routes);

/* ─────────────────────────────────────────
   404 + Error Handler
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

      console.log(
        "🚀 Backend URL: https://annasetu-1-q14o.onrender.com"
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

start();