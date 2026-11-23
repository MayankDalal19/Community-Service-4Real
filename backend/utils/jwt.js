const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

// Uses the SAME secret as middleware/auth.js so tokens signed here always verify there.
function generateToken(user) {
  const roleName = user.role?.name || user.role || "Volunteer";
  return jwt.sign(
    { id: user._id, email: user.email, role: roleName },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
