const express = require("express");
const crudRouter = require("../utils/crudRouter");
const modules = require("../controllers/modules.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Health check (public - used by monitoring & connection tester)
router.use("/health", require("./health.routes"));

// Authentication routes (public login/register, protected profile/change-password)
router.use("/auth", require("./auth.routes"));

// Dashboard statistics (requires authenticated user)
router.use("/stats", authenticate, require("./stats.routes"));

// User management (Admin only) & Role definitions
router.use("/users", require("./user.routes"));

// Analytics and export reports (Admin & Staff)
router.use("/reports", require("./reports.routes"));

// Core NGO modules (Authenticated users can read, Staff/Admin can modify, Admin only can delete critical financial docs)
const staffOrAdmin = authorize("Admin", "Staff");
const adminOnly = authorize("Admin");

router.use("/volunteers", authenticate, crudRouter(modules.volunteers, { writeMiddleware: staffOrAdmin }));
router.use("/donors", authenticate, crudRouter(modules.donors, { writeMiddleware: staffOrAdmin, deleteMiddleware: adminOnly }));
router.use("/donations", authenticate, crudRouter(modules.donations, { writeMiddleware: staffOrAdmin, deleteMiddleware: adminOnly }));
router.use("/beneficiaries", authenticate, crudRouter(modules.beneficiaries, { writeMiddleware: staffOrAdmin }));
router.use("/assistance", authenticate, crudRouter(modules.assistance, { writeMiddleware: staffOrAdmin }));
router.use("/events", authenticate, crudRouter(modules.events, { writeMiddleware: staffOrAdmin }));

module.exports = router;
