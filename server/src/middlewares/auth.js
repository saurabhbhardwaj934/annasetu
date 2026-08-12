import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ENV } from "../config/env.js";
import { COOKIE_NAME } from "../constants.js";

/**
 * protect — require a valid JWT (from httpOnly cookie OR Bearer header).
 * Attaches the logged-in user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not logged in. Please login first.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, ENV.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    throw new ApiError(401, "User belonging to this token no longer exists");
  }

  req.user = user;
  next();
});

/**
 * authorize — role-based access control.
 * Usage: router.delete("/", protect, authorize(USER_ROLES.ADMIN), deleteThing)
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  next();
};
