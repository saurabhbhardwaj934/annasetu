import { Donation } from "../models/Donation.js";
import { Claim } from "../models/Claim.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toGeoPlace } from "../data/places.js";
import { kmToRadians } from "../utils/geo.js";
import { CLAIM_STATUS, DONATION_STATUS } from "../constants.js";

const DONOR_FIELDS = "name orgName phone avatar role mealsDonated mealsRescued";

/**
 * GET /api/v1/donations?lat&lng&radius&foodType
 * Available donations, pickup window active, paas ki pehle (geo) ya sab recent.
 * TTL index unclaimed expired donations ko Atlas mein khud delete kar deta hai,
 * yahan extra guard bhi hai (pickupEndAt >= now).
 */
export const listDonations = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, foodType } = req.query;

  const query = {
    status: DONATION_STATUS.AVAILABLE,
    pickupEndAt: { $gte: new Date() },
  };
  if (foodType && foodType !== "all") query.foodType = foodType;
  if (lat && lng) {
    query.location = {
      $geoWithin: { $centerSphere: [[+lng, +lat], kmToRadians(+radius)] },
    };
  }

  const donations = await Donation.find(query)
    .populate("donor", DONOR_FIELDS)
    .sort({ pickupEndAt: 1 })
    .limit(100);

  res.json(new ApiResponse(200, { count: donations.length, donations }, "Donations found"));
});

/**
 * GET /api/v1/donations/mine — mere posted donations + unke claims
 */
export const myDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id })
    .populate("donor", DONOR_FIELDS)
    .sort({ createdAt: -1 });

  const claims = await Claim.find({
    donation: { $in: donations.map((d) => d._id) },
    status: { $ne: CLAIM_STATUS.CANCELLED },
  })
    .populate("claimant", "name orgName phone avatar role")
    .sort({ createdAt: 1 });

  const claimMap = {};
  claims.forEach((c) => (claimMap[c.donation] = c));

  const enriched = donations.map((d) => ({
    ...d.toObject(),
    claim: claimMap[d._id] ? claimMap[d._id].toObject() : null,
  }));

  res.json(new ApiResponse(200, { donations: enriched }, "Your donations"));
});

/**
 * GET /api/v1/donations/:id — detail + claim info (agar koi hai)
 */
export const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate("donor", DONOR_FIELDS);
  if (!donation) throw new ApiError(404, "Donation not found");

  const claim = await Claim.findOne({ donation: donation._id })
    .populate("claimant", "name orgName phone avatar role")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, { donation, claim: claim || null }, "Donation details"));
});

/**
 * POST /api/v1/donations — surplus food post karo
 * Body: { title, description, foodType, mealsCount, quantityKg, fromId | customFrom,
 *         pickupStartAt, pickupEndAt, notes }
 */
export const createDonation = asyncHandler(async (req, res) => {
  const b = req.body;

  const place = toGeoPlace(b.fromId) || toGeoPlace(b.customFrom);
  if (!place) throw new ApiError(400, "Please pick a valid pickup location");

  const title = (b.title || "").trim();
  if (!title) throw new ApiError(400, "Title is required");

  const foodType = ["veg", "non-veg", "mixed"].includes(b.foodType)
    ? b.foodType
    : "veg";

  const mealsCount = parseInt(b.mealsCount, 10);
  if (!mealsCount || mealsCount < 1 || mealsCount > 10000) {
    throw new ApiError(400, "Meals count must be between 1 and 10000");
  }

  const pickupStartAt = new Date(b.pickupStartAt);
  const pickupEndAt = new Date(b.pickupEndAt);
  if (isNaN(pickupStartAt) || isNaN(pickupEndAt)) {
    throw new ApiError(400, "Pickup start/end time required (datetime format)");
  }
  if (pickupStartAt >= pickupEndAt) {
    throw new ApiError(400, "Pickup end time must be after start time");
  }
  if (pickupStartAt < new Date(Date.now() - 5 * 60 * 1000)) {
    throw new ApiError(400, "Pickup window abhi se shuru hona chahiye (future mein)");
  }

  const quantityKg = parseFloat(b.quantityKg) > 0 ? parseFloat(b.quantityKg) : 0;

  const donation = await Donation.create({
    donor: req.user._id,
    title,
    description: (b.description || "").trim(),
    foodType,
    mealsCount,
    quantityKg,
    location: place.location,
    locationLabel: place.label,
    pickupStartAt,
    pickupEndAt,
    notes: (b.notes || "").trim(),
    expiresAt: pickupEndAt, // TTL — unclaimed + expired → Atlas delete
  });

  res.status(201).json(new ApiResponse(201, { donation }, "Donation posted — khana waste nahi hoga! 🌾"));
});

/**
 * PATCH /api/v1/donations/:id/cancel — donor cancel kare (delivered ke baad nahi)
 */
export const cancelDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) throw new ApiError(404, "Donation not found");
  if (donation.donor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the donor can cancel this donation");
  }
  if (donation.status === DONATION_STATUS.DELIVERED) {
    throw new ApiError(400, "Delivered donation cancel nahi ho sakti");
  }
  if (donation.status === DONATION_STATUS.CANCELLED) {
    throw new ApiError(400, "Donation already cancelled");
  }

  donation.status = DONATION_STATUS.CANCELLED;
  await donation.save();

  // Active claim bhi cancel
  await Claim.updateMany(
    { donation: donation._id, status: { $in: [CLAIM_STATUS.RESERVED, CLAIM_STATUS.PICKED_UP] } },
    { $set: { status: CLAIM_STATUS.CANCELLED } }
  );

  res.json(new ApiResponse(200, { donation }, "Donation cancelled"));
});
