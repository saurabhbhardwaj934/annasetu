import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import {
  createClaim,
  myClaims,
  pickupClaim,
  deliverClaim,
  cancelClaim,
} from "../controllers/claim.controller.js";

const router = Router();

router.post("/donations/:donationId/claim", protect, createClaim);
router.get("/mine", protect, myClaims);
router.patch("/:id/pickup", protect, pickupClaim);
router.patch("/:id/deliver", protect, deliverClaim);
router.patch("/:id/cancel", protect, cancelClaim);

export default router;
