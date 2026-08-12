import mongoose from "mongoose";
import { CLAIM_STATUS } from "../constants.js";

const { Schema } = mongoose;

/**
 * Claim = NGO/volunteer ne donation ko claim kar liya (pickup ke liye).
 * Ek donation = ek claimer (poora batch ek hi le jaata hai).
 * unique index on donation → double-claim impossible (race-condition safe).
 * mealsCount snapshot claim ke time ka — baad me donation edit ho to bhi
 * impact calculation sahi rahe.
 */
const claimSchema = new Schema(
  {
    donation: { type: Schema.Types.ObjectId, ref: "Donation", required: true, unique: true },
    donor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    claimant: { type: Schema.Types.ObjectId, ref: "User", required: true },

    mealsCount: { type: Number, required: true },
    quantityKg: { type: Number, default: 0 },

    status: {
      type: String,
      enum: Object.values(CLAIM_STATUS),
      default: CLAIM_STATUS.RESERVED,
    },
    claimedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

claimSchema.index({ claimant: 1, status: 1, createdAt: -1 });
claimSchema.index({ donor: 1, status: 1 });

export const Claim = mongoose.model("Claim", claimSchema);
