const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");
const { generateToken } = require("../utils/jwt");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Format user output object (omits sensitive internals)
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role?.name || "Volunteer",
    roleDescription: user.role?.description || "",
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
        data: null,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Must explicitly select passwordHash because schema defines select: false
    const user = await User.findOne({ email: normalizedEmail })
      .select("+passwordHash")
      .populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        data: null,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact an administrator.",
        data: null,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
async function register(req, res, next) {
  try {
    const { fullName, email, password, role: requestedRole } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
        data: null,
      });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
        data: null,
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
        data: null,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
        data: null,
      });
    }

    // Determine role (defaults to "Volunteer", or Admin/Staff if specifically chosen)
    let roleDoc;
    if (requestedRole) {
      roleDoc = await Role.findOne({ name: requestedRole });
    }
    if (!roleDoc) {
      roleDoc = await Role.findOne({ name: "Volunteer" });
    }
    if (!roleDoc) {
      // Fallback in case roles haven't seeded yet
      roleDoc = await Role.create({
        name: "Volunteer",
        description: "Access to own profile, assigned events and attendance",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: roleDoc._id,
      isActive: true,
    });

    await newUser.populate("role");

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      data: {
        token,
        user: sanitizeUser(newUser),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Current user profile retrieved.",
      data: {
        user: sanitizeUser(req.user),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/auth/roles
 * @desc    Get all available roles for registration/selection
 * @access  Public
 */
async function getRoles(req, res, next) {
  try {
    const roles = await Role.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      message: "Roles retrieved.",
      data: roles,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  getMe,
  getRoles,
};
