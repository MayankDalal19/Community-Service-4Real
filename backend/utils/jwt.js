const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token containing user id and role
 * @param {Object} user - User document or object with _id and role
 * @returns {String} JWT token
 */
function generateToken(user) {
  const roleName = user.role?.name || user.role || "Volunteer";
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: roleName,
    },
    process.env.JWT_SECRET || "sahyog_jwt_super_secret_fallback_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

/**
 * Verify and decode a JWT token
 * @param {String} token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "sahyog_jwt_super_secret_fallback_key");
}

module.exports = {
  generateToken,
  verifyToken,
};
