const { sendError } = require("../utils/apiResponse");

// Unknown route -> 404
const notFound = (req, res) =>
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);

// Global error handler (4 args so Express treats it as an error handler)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  // Atlas unreachable (network, paused cluster, IP not allowed)
  const dbDown = ["MongooseServerSelectionError", "MongoServerSelectionError", "MongoNetworkError"];
  if (dbDown.includes(err.name)) {
    return sendError(res, "Database is not reachable", 503);
  }
  // Wrong username/password
  if (err.name === "MongoServerError" && (err.code === 18 || err.code === 13)) {
    return sendError(res, "Database configuration error", 500);
  }

  // Mongoose / MongoDB errors caused by bad client input (used heavily from Step 2)
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return sendError(res, first?.message || "Validation failed", 400);
  }
  if (err.name === "CastError") {
    return sendError(res, `Invalid ${err.path}`, 400);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return sendError(res, `A record with this ${field} already exists`, 409);
  }

  const status = err.status || 500;
  // Never expose internals for server errors
  const message = status >= 500 ? "Internal server error" : err.message;
  return sendError(res, message, status);
};

module.exports = { notFound, errorHandler };
