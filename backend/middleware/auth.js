const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

/**
 * Middleware to protect routes that require authentication
 */
async function protect(req, res, next) {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in to access this resource.",
        data: null,
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
        data: null,
      });
    }

    const user = await User.findById(decoded.id).populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account belonging to this token no longer exists.",
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact an administrator.",
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param  {...string} roles - Allowed role names (e.g. "Admin", "Staff", "Volunteer")
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Role information is missing.",
        data: null,
      });
    }

    const userRole = req.user.role.name;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You need one of the following roles: ${roles.join(", ")}. Your role is: ${userRole}.`,
        data: null,
      });
    }

    next();
  };
}

module.exports = {
  protect,
  authorize,
};
