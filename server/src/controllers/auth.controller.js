import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME, USER_ROLES } from "../constants.js";
import { ENV } from "../config/env.js";

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateJWT();

  const cookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ENV.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  };

  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(statusCode).cookie(COOKIE_NAME, token, cookieOptions).json(
    new ApiResponse(statusCode, { user: userSafe, token }, message)
  );
};

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, orgName, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  if (!Object.values(USER_ROLES).includes(role)) {
    throw new ApiError(400, "Role must be restaurant, ngo ya volunteer");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    orgName: (orgName || "").trim(),
    phone: (phone || "").trim(),
  });

  sendTokenResponse(user, 201, res, "Account created successfully");
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  sendTokenResponse(user, 200, res, "Logged in successfully");
});

// GET /api/v1/auth/me (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Profile fetched"));
});

// POST /api/v1/auth/logout (protected)
export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie(COOKIE_NAME)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});
