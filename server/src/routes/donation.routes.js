import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import {
  listDonations,
  myDonations,
  getDonationById,
  createDonation,
  cancelDonation,
} from "../controllers/donation.controller.js";

const router = Router();

router.get("/", listDonations); // public — feed
router.get("/mine", protect, myDonations); // donor dashboard
router.post("/", protect, createDonation); // post surplus food
router.get("/:id", getDonationById); // public — detail
router.patch("/:id/cancel", protect, cancelDonation); // donor cancels

export default router;
