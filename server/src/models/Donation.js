import mongoose from "mongoose";
import { DONATION_STATUS } from "../constants.js";

const { Schema } = mongoose;

const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

/**
 * Donation = surplus food posted by a restaurant/individual.
 *
 * 🔥 MongoDB Atlas features:
 *  - 2dsphere index on location → "paas ki donations" geo search
 *  - TTL index on expiresAt → unclaimed donations pickup window ke baad
 *    ATLAS KHUD DELETE kar deta hai (expireAfterSeconds: 0).
 *    Claim hone par expiresAt $unset ho jaata hai → history safe.
 */
const donationSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "mixed"],
      required: true,
    },
    mealsCount: { type: Number, required: true, min: 1 },
    quantityKg: { type: Number, default: 0 }, // approximate weight

    location: { type: pointSchema, required: true },
    locationLabel: { type: String, required: true },

    // Pickup window (kab tak pickup karna hai)
    pickupStartAt: { type: Date, required: true },
    pickupEndAt: { type: Date, required: true },

    notes: { type: String, trim: true, maxlength: 300, default: "" },

    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.AVAILABLE,
    },

    claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    // TTL field — sirf unclaimed donations pe set (claim → $unset)
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Geo index: "donations within X km" ──
donationSchema.index({ location: "2dsphere" });

// ── Feed index ──
donationSchema.index({ status: 1, pickupEndAt: 1 });

// ── TTL index: expired unclaimed donations Atlas khud delete karta hai ──
donationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Donation = mongoose.model("Donation", donationSchema);
