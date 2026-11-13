const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { JWT_SECRET } = require("../middleware/auth");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role?.name || "Volunteer",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Please provide both email and password", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail })
    .select("+passwordHash")
    .populate("role");

  if (!user) {
    return sendError(res, "Invalid email or password", 401);
  }

  if (!user.isActive) {
    return sendError(res, "Your account has been deactivated. Please contact an administrator.", 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, "Invalid email or password", 401);
  }

  const token = generateToken(user);

  sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role ? user.role.name : "Volunteer",
      },
    },
    "Logged in successfully"
  );
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password, roleName } = req.body;

  if (!fullName || !fullName.trim()) {
    return sendError(res, "Full name is required", 400);
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return sendError(res, "A valid email address is required", 400);
  }

  if (!password || password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return sendError(res, "A user with this email address already exists", 409);
  }

  // Check if this is the first user in the system -> grant Admin
  const userCount = await User.countDocuments();
  let targetRoleName = userCount === 0 ? "Admin" : (roleName || "Volunteer");

  // Lookup role
  let roleDoc = await Role.findOne({ name: targetRoleName });
  if (!roleDoc) {
    // Fallback to Volunteer or create if missing
    roleDoc = await Role.findOne({ name: "Volunteer" });
    if (!roleDoc) {
      roleDoc = await Role.create({ name: "Volunteer", description: "Default volunteer role" });
    }
  }

  const passwordHash = await User.hashPassword(password);

  const newUser = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: roleDoc._id,
    isActive: true,
  });

  const populatedUser = await User.findById(newUser._id).populate("role");
  const token = generateToken(populatedUser);

  sendSuccess(
    res,
    {
      token,
      user: {
        id: populatedUser._id,
        fullName: populatedUser.fullName,
        email: populatedUser.email,
        role: populatedUser.role.name,
      },
    },
    "User registered successfully",
    201
  );
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  sendSuccess(
    res,
    {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone || "",
      city: req.user.city || "",
      role: req.user.role?.name || "Volunteer",
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
    },
    "Current user profile"
  );
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, city } = req.body;
  if (!fullName || !fullName.trim()) {
    return sendError(res, "Full name cannot be empty", 400);
  }

  req.user.fullName = fullName.trim();
  if (phone !== undefined) req.user.phone = phone.trim();
  if (city !== undefined) req.user.city = city.trim();
  await req.user.save();

  sendSuccess(
    res,
    {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone || "",
      city: req.user.city || "",
      role: req.user.role?.name || "Volunteer",
    },
    "Profile updated successfully"
  );
});

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, "Both current password and new password are required", 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, "New password must be at least 6 characters long", 400);
  }

  // Need passwordHash to compare
  const user = await User.findById(req.user._id).select("+passwordHash");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return sendError(res, "Current password is incorrect", 400);
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  sendSuccess(res, null, "Password changed successfully");
});
