/**
 * Wraps async route handlers so thrown errors/rejections are
 * automatically passed to the errorHandler middleware.
 * (No more try/catch inside every controller!)
 */
const asyncHandler = (requestHandler) => (req, res, next) =>
  Promise.resolve(requestHandler(req, res, next)).catch(next);

export { asyncHandler };
