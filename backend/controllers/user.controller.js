const User = require("../models/User");
const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/users
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const filter = {};
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ fullName: rx }, { email: rx }];
  }

  if (req.query.role) {
    // If filtering by role name, find role ID first
    const roleDoc = await Role.findOne({ name: req.query.role });
    if (roleDoc) filter.role = roleDoc._id;
  }

  if (req.query.isActive !== undefined && req.query.isActive !== "") {
    filter.isActive = req.query.isActive === "true";
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .populate("role", "name description")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  sendSuccess(
    res,
    {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    },
    "User list"
  );
});

// GET /api/users/roles
exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort("name").lean();
  sendSuccess(res, roles, "Roles list");
});

// GET /api/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("role", "name description")
    .lean();

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  sendSuccess(res, user, "User details");
});

// POST /api/users (Admin user creation)
exports.createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, roleId } = req.body;

  if (!fullName || !email || !password || !roleId) {
    return sendError(res, "All fields (Full Name, Email, Password, Role) are required", 400);
  }

  if (password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return sendError(res, "A user with this email already exists", 409);
  }

  const role = await Role.findById(roleId);
  if (!role) {
    return sendError(res, "Specified role does not exist", 400);
  }

  const passwordHash = await User.hashPassword(password);
  const newUser = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role._id,
    isActive: true,
  });

  const saved = await User.findById(newUser._id).populate("role", "name description").lean();
  sendSuccess(res, saved, "User created successfully", 201);
});

// PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { fullName, roleId, isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  if (fullName) user.fullName = fullName.trim();
  if (typeof isActive === "boolean") {
    // Prevent an admin from deactivating themselves
    if (req.user._id.toString() === user._id.toString() && !isActive) {
      return sendError(res, "You cannot deactivate your own account", 400);
    }
    user.isActive = isActive;
  }

  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      return sendError(res, "Invalid role", 400);
    }
    // Prevent an admin from changing their own role
    if (req.user._id.toString() === user._id.toString() && role.name !== "Admin") {
      return sendError(res, "You cannot remove your own Admin role", 400);
    }
    user.role = role._id;
  }

  await user.save();
  const updated = await User.findById(user._id).populate("role", "name description").lean();
  sendSuccess(res, updated, "User updated successfully");
});

// DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return sendError(res, "You cannot delete your own account", 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  sendSuccess(res, null, "User removed successfully");
});
