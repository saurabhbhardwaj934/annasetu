import mongoose from "mongoose";
import { ENV } from "./env.js";

/**
 * Connect to MongoDB Atlas (MONGODB_URI from server/.env).
 * Gives clear, actionable errors if the connection fails —
 * the #1 issue is a wrong URI or IP not whitelisted in Atlas.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // fail fast instead of hanging
    });
    console.log(`✅ MongoDB Atlas connected → ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("   ── Fix checklist ──────────────────────────");
    console.error("   1. Did you paste the REAL MONGODB_URI in server/.env?");
    console.error("   2. Is the database user's password correct?");
    console.error("   3. Network Access → whitelist 0.0.0.0/0 (dev)");
    console.error("   4. Is your internet connection working?");
    process.exit(1);
  }
};
