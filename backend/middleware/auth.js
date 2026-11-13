const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

const JWT_SECRET = process.env.JWT_SECRET || "sahyog_secret_jwt_key_2026_default";

/**
 * Middleware to verify JWT token and attach authenticated user to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authentication required. Please sign in.", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(res, "Authentication token missing.", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Session expired. Please sign in again.", 401);
      }
      return sendError(res, "Invalid authentication token.", 401);
    }

    const user = await User.findById(decoded.id).populate("role");
    if (!user) {
      return sendError(res, "User associated with this token no longer exists.", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Your account has been deactivated. Please contact an administrator.", 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware.
 * Usage: authorize("Admin") or authorize("Admin", "Staff")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, "Unauthorized request.", 401);
    }

    const userRole = req.user.role.name;
    if (!allowedRoles.includes(userRole)) {
      return sendError(
        res,
        `Forbidden: Access denied. This action requires one of the following roles: ${allowedRoles.join(", ")}.`,
        403
      );
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET,
};
