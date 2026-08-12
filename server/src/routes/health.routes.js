import { Router } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

// GET /api/v1/health — quick check that server + database are alive.
router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  res.json(
    new ApiResponse(
      200,
      {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbState === 1 ? "connected" : "disconnected",
      },
      "Server is healthy"
    )
  );
});

export default router;
