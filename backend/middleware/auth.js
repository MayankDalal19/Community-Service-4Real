const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
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

    let user = await User.findById(decoded.id).populate("role");
    if (!user) {
      return sendError(res, "User associated with this token no longer exists.", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Your account has been deactivated. Please contact an administrator.", 403);
    }

    req.decodedToken = decoded;

    // Self-healing: if role population failed or is null, resolve role
    if (!user.role || !user.role.name) {
      const fallbackRole = decoded.role || (user.email === (process.env.ADMIN_EMAIL || "admin@sahyog.org").toLowerCase() ? "Admin" : "Volunteer");
      let roleDoc = await Role.findOne({ name: new RegExp(`^${fallbackRole}$`, "i") });
      if (!roleDoc) {
        roleDoc = await Role.create({ name: fallbackRole });
      }
      user.role = roleDoc;
      User.updateOne({ _id: user._id }, { role: roleDoc._id }).catch(() => {});
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
    if (!req.user) {
      return sendError(res, "Unauthorized request.", 401);
    }

    // Safely extract role name from object, string, or decoded token
    let userRole = "";
    if (req.user.role) {
      if (typeof req.user.role === "string") {
        userRole = req.user.role;
      } else if (typeof req.user.role === "object" && req.user.role.name) {
        userRole = req.user.role.name;
      }
    }
    if (!userRole && req.decodedToken?.role) {
      userRole = req.decodedToken.role;
    }

    if (!userRole) {
      return sendError(res, "User role could not be determined.", 403);
    }

    // Case-insensitive match against allowed roles
    const allowedLower = allowedRoles.map((r) => String(r).toLowerCase());
    if (!allowedLower.includes(userRole.trim().toLowerCase())) {
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
