import { Donation } from "../models/Donation.js";
import { Claim } from "../models/Claim.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CLAIM_STATUS, DONATION_STATUS } from "../constants.js";

/**
 * POST /api/v1/claims/donations/:donationId/claim
 *
 * Concurrency-safe: donation ko atomically available → reserved karte hain
 * (findOneAndUpdate + status guard). Do log ek saath claim karein to
 * sirf ek jeetega — classic race-condition problem solved.
 * Plus unique index on Claim.donation as second line of defence.
 */
export const createClaim = asyncHandler(async (req, res) => {
  const { donationId } = req.params;

  const donation = await Donation.findById(donationId);
  if (!donation) throw new ApiError(404, "Donation not found");
  if (donation.donor.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Apni hi donation claim nahi kar sakte");
  }

  const updated = await Donation.findOneAndUpdate(
    {
      _id: donation._id,
      status: DONATION_STATUS.AVAILABLE,
      pickupEndAt: { $gte: new Date() },
    },
    {
      $set: { status: DONATION_STATUS.RESERVED, claimedBy: req.user._id, claimedAt: new Date() },
      $unset: { expiresAt: 1 }, // TTL se bachao — history preserve rahegi
    },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(409, "Yeh donation ab available nahi hai — kisi aur ne claim kar liya ya window khatam ho gayi");
  }

  try {
    const claim = await Claim.create({
      donation: donation._id,
      donor: donation.donor,
      claimant: req.user._id,
      mealsCount: donation.mealsCount,
      quantityKg: donation.quantityKg,
      status: CLAIM_STATUS.RESERVED,
      claimedAt: new Date(),
    });
    res.status(201).json(new ApiResponse(201, { claim, donation: updated }, "Claim ho gaya! Pickup time pe pahuncho 🛺"));
  } catch (err) {
    // Rollback: seat/donation wapas available
    await Donation.updateOne(
      { _id: donation._id },
      {
        $set: { status: DONATION_STATUS.AVAILABLE, claimedBy: null, claimedAt: null, expiresAt: donation.pickupEndAt },
      }
    );
    if (err.code === 11000) throw new ApiError(409, "Yeh donation already claimed hai");
    throw err;
  }
});

/**
 * GET /api/v1/claims/mine — mere claims (pickup/delivery track)
 */
export const myClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ claimant: req.user._id })
    .populate({
      path: "donation",
      select: "title foodType mealsCount quantityKg locationLabel pickupStartAt pickupEndAt notes status donor",
    })
    .populate("donor", "name orgName phone avatar role")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, { claims }, "Your claims"));
});

/**
 * PATCH /api/v1/claims/:id/pickup — claimant ne pickup kar liya
 */
export const pickupClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) throw new ApiError(404, "Claim not found");
  if (claim.claimant.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the claimant can do this");
  }
  if (claim.status !== CLAIM_STATUS.RESERVED) {
    throw new ApiError(400, "Sirf reserved claim pickup ho sakta hai");
  }

  claim.status = CLAIM_STATUS.PICKED_UP;
  claim.pickedUpAt = new Date();
  await claim.save();

  await Donation.updateOne(
    { _id: claim.donation },
    { $set: { status: DONATION_STATUS.PICKED_UP, pickedUpAt: new Date() } }
  );

  res.json(new ApiResponse(200, { claim }, "Pickup confirmed ✅"));
});

/**
 * PATCH /api/v1/claims/:id/deliver — distribute ho gaya → impact count
 */
export const deliverClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) throw new ApiError(404, "Claim not found");
  if (claim.claimant.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the claimant can do this");
  }
  if (claim.status !== CLAIM_STATUS.PICKED_UP) {
    throw new ApiError(400, "Pehle pickup mark karo, phir deliver");
  }

  claim.status = CLAIM_STATUS.DELIVERED;
  claim.deliveredAt = new Date();
  await claim.save();

  await Donation.updateOne(
    { _id: claim.donation },
    { $set: { status: DONATION_STATUS.DELIVERED, deliveredAt: new Date() } }
  );

  // Impact counters (atomic $inc)
  await User.updateOne({ _id: claim.donor }, { $inc: { mealsDonated: claim.mealsCount } });
  await User.updateOne({ _id: claim.claimant }, { $inc: { mealsRescued: claim.mealsCount } });

  res.json(new ApiResponse(200, { claim }, `Delivered! ${claim.mealsCount} meals rescued 🎉`));
});

/**
 * PATCH /api/v1/claims/:id/cancel — claimant cancel kare → donation wapas available
 */
export const cancelClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) throw new ApiError(404, "Claim not found");

  const isClaimant = claim.claimant.toString() === req.user._id.toString();
  const donation = await Donation.findById(claim.donation);
  const isDonor = donation && donation.donor.toString() === req.user._id.toString();
  if (!isClaimant && !isDonor) {
    throw new ApiError(403, "Aap yeh claim cancel nahi kar sakte");
  }
  if (claim.status !== CLAIM_STATUS.RESERVED) {
    throw new ApiError(400, "Sirf reserved claim cancel hota hai (pickup ke baad nahi)");
  }

  claim.status = CLAIM_STATUS.CANCELLED;
  await claim.save();

  await Donation.updateOne(
    { _id: claim.donation },
    {
      $set: {
        status: DONATION_STATUS.AVAILABLE,
        claimedBy: null,
        claimedAt: null,
        expiresAt: donation.pickupEndAt, // TTL dobara chalu
      },
    }
  );

  res.json(new ApiResponse(200, { claim }, "Claim cancelled — donation wapas available"));
});
