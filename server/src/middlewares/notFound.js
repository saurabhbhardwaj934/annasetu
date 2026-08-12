import { ApiError } from "../utils/ApiError.js";

/** 404 for any unmatched route. */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export { notFound };
