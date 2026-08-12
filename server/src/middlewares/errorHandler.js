import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

/**
 * Central error handler — the ONLY place that turns errors into responses.
 * Converts common Mongoose / JWT errors into clean HTTP responses.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Invalid ObjectId (e.g. GET /api/v1/things/abc123)
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid value for ${err.path}`);
  }

  // Duplicate key (e.g. registering with an existing email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field} already exists`);
  }

  // Mongoose validation errors → collect all field messages
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") error = new ApiError(401, "Invalid token");
  if (err.name === "TokenExpiredError") error = new ApiError(401, "Token expired");

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) console.error("❌ Unhandled error:", error);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || undefined,
    stack: ENV.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export { errorHandler };
