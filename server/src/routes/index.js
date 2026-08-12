import { Router } from "express";
import { API_PREFIX } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import donationRoutes from "./donation.routes.js";
import claimRoutes from "./claim.routes.js";
import impactRoutes from "./impact.routes.js";

const router = Router();

// ── Mount feature routes ──
router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/donations`, donationRoutes);
router.use(`${API_PREFIX}/claims`, claimRoutes);
router.use(`${API_PREFIX}/impact`, impactRoutes);

// ── API root info ──
router.get(API_PREFIX, (req, res) => {
  res.json(
    new ApiResponse(200, {
      name: "Annasetu API — Surplus Food Rescue Network",
      version: "1.0.0",
      endpoints: {
        health: `${API_PREFIX}/health`,
        donations: `${API_PREFIX}/donations`,
        claims: `${API_PREFIX}/claims`,
        impact: `${API_PREFIX}/impact`,
      },
    })
  );
});

export default router;
