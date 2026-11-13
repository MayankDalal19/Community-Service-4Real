const express = require("express");
const reportsController = require("../controllers/reports.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Reports access is restricted to Admin and Staff
router.use(authenticate);
router.use(authorize("Admin", "Staff"));

router.get("/summary", reportsController.getReportSummary);
router.get("/export/:module", reportsController.exportCsv);

module.exports = router;
