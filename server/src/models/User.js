import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { USER_ROLES } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: [true, "Role is required — restaurant, ngo ya volunteer"],
    },
    orgName: { type: String, trim: true, default: "" }, // restaurant/ngo ka naam
    phone: { type: String, trim: true, default: "" },   // pickup coordination ke liye
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // ── Impact counters (denormalised, $inc ke saath update hote hain) ──
    mealsDonated: { type: Number, default: 0 },
    mealsRescued: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password automatically before every save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const User = mongoose.model("User", userSchema);
