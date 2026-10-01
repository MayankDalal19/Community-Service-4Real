const { isConnected, pingDB } = require("../config/db");
const Role = require("../models/Role");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/health  -> is the API alive?
exports.checkApi = (req, res) =>
  sendSuccess(
    res,
    {
      service: "SAHYOG API",
      status: "running",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    "SAHYOG API is running"
  );

// GET /api/health/db  -> can the API talk to MongoDB Atlas, and are roles seeded?
exports.checkDatabase = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return sendError(res, "Database is not reachable", 503);
  }

  await pingDB();
  const roles = await Role.find().sort({ _id: 1 }).select("name").lean();
  const totalUsers = await User.countDocuments();

  sendSuccess(
    res,
    {
      database: process.env.DB_NAME || "sahyog_db",
      connected: true,
      roles: roles.map((r) => ({ id: String(r._id), name: r.name })),
      totalUsers,
    },
    "Database connection successful"
  );
});
