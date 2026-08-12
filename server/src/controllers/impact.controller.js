import { Claim } from "../models/Claim.js";
import { Donation } from "../models/Donation.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CLAIM_STATUS, DONATION_STATUS } from "../constants.js";

// Approx estimates (industry-standard rough numbers, README mein note karo):
// 1 meal ≈ 0.45 kg food waste avoided ≈ 2.5 kg CO2e saved
const KG_PER_MEAL = 0.45;
const CO2_PER_MEAL = 2.5;

/**
 * GET /api/v1/impact
 * Aggregation pipeline se: total impact + monthly trend + top donors/rescuers.
 */
export const getImpact = asyncHandler(async (req, res) => {
  const now = new Date();

  // 1) Total delivered impact
  const [totals] = await Claim.aggregate([
    { $match: { status: CLAIM_STATUS.DELIVERED } },
    {
      $group: {
        _id: null,
        meals: { $sum: "$mealsCount" },
        claims: { $sum: 1 },
        kg: { $sum: { $multiply: ["$mealsCount", KG_PER_MEAL] } },
      },
    },
  ]);

  // 2) Monthly trend (deliveredAt ke hisaab se)
  const monthly = await Claim.aggregate([
    { $match: { status: CLAIM_STATUS.DELIVERED, deliveredAt: { $ne: null } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$deliveredAt" } },
        meals: { $sum: "$mealsCount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3) Top donors (aggregation + $lookup join with users)
  const topDonors = await Claim.aggregate([
    { $match: { status: CLAIM_STATUS.DELIVERED } },
    { $group: { _id: "$donor", meals: { $sum: "$mealsCount" } } },
    { $sort: { meals: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        _id: 1,
        meals: 1,
        name: { $arrayElemAt: ["$user.name", 0] },
        orgName: { $arrayElemAt: ["$user.orgName", 0] },
      },
    },
  ]);

  // 4) Top rescuers
  const topRescuers = await Claim.aggregate([
    { $match: { status: CLAIM_STATUS.DELIVERED } },
    { $group: { _id: "$claimant", meals: { $sum: "$mealsCount" } } },
    { $sort: { meals: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        _id: 1,
        meals: 1,
        name: { $arrayElemAt: ["$user.name", 0] },
        orgName: { $arrayElemAt: ["$user.orgName", 0] },
      },
    },
  ]);

  // 5) Live counts
  const activeDonations = await Donation.countDocuments({
    status: DONATION_STATUS.AVAILABLE,
    pickupEndAt: { $gte: now },
  });
  const pendingPickups = await Claim.countDocuments({ status: CLAIM_STATUS.PICKED_UP });

  const meals = totals?.meals || 0;
  const kg = totals?.kg || 0;

  res.json(
    new ApiResponse(200, {
      meals,
      mealsRescued: meals,
      claims: totals?.claims || 0,
      kgSaved: Math.round(kg),
      co2SavedKg: Math.round(meals * CO2_PER_MEAL),
      activeDonations,
      pendingPickups,
      monthly,
      topDonors,
      topRescuers,
    })
  );
});
