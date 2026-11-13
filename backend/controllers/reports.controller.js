const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Beneficiary = require("../models/Beneficiary");
const Assistance = require("../models/Assistance");
const Event = require("../models/Event");

// GET /api/reports/summary
exports.getReportSummary = asyncHandler(async (req, res) => {
  const [
    monthlyDonations,
    donationsByMethod,
    assistanceByType,
    assistanceByStatus,
    beneficiariesByCategory,
    volunteersByAvailability,
    eventsByStatus,
    totals,
  ] = await Promise.all([
    // Monthly donations trend (last 12 months)
    Donation.aggregate([
      {
        $match: {
          donationDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$donationDate" },
            month: { $month: "$donationDate" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),

    // Donations grouped by payment method
    Donation.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),

    // Assistance by type / category
    Assistance.aggregate([
      {
        $group: {
          _id: "$type",
          totalValue: { $sum: { $ifNull: ["$value", 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
    ]),

    // Assistance by status (Delivered vs Planned)
    Assistance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // Beneficiaries by category
    Beneficiary.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Volunteers by availability
    Volunteer.aggregate([
      {
        $group: {
          _id: "$availability",
          count: { $sum: 1 },
        },
      },
    ]),

    // Events by status
    Event.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // Overall totals
    Promise.all([
      Volunteer.countDocuments({ status: "Active" }),
      Beneficiary.countDocuments({ status: "Active" }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Assistance.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ["$value", 0] } } } }]),
    ]),
  ]);

  const [activeVolunteers, activeBeneficiaries, totalDonationAgg, totalAssistanceAgg] = totals;

  sendSuccess(
    res,
    {
      kpis: {
        activeVolunteers,
        activeBeneficiaries,
        totalDonations: totalDonationAgg[0]?.total || 0,
        totalAssistanceValue: totalAssistanceAgg[0]?.total || 0,
      },
      monthlyDonations: monthlyDonations.map((m) => ({
        label: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        amount: m.totalAmount,
        count: m.count,
      })),
      donationsByMethod: donationsByMethod.map((d) => ({
        method: d._id || "Other",
        amount: d.totalAmount,
        count: d.count,
      })),
      assistanceByType: assistanceByType.map((a) => ({
        type: a._id || "Other",
        value: a.totalValue,
        count: a.count,
      })),
      assistanceByStatus: assistanceByStatus.map((s) => ({
        status: s._id || "Unknown",
        count: s.count,
      })),
      beneficiariesByCategory: beneficiariesByCategory.map((b) => ({
        category: b._id || "Other",
        count: b.count,
      })),
      volunteersByAvailability: volunteersByAvailability.map((v) => ({
        availability: v._id || "Flexible",
        count: v.count,
      })),
      eventsByStatus: eventsByStatus.map((e) => ({
        status: e._id || "Upcoming",
        count: e.count,
      })),
    },
    "Report summary loaded"
  );
});

// CSV string escaping helper
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str instanceof Date || (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(str))) {
    str = new Date(val).toISOString().split("T")[0];
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// GET /api/reports/export/:module
exports.exportCsv = asyncHandler(async (req, res) => {
  const { module } = req.params;
  let headers = [];
  let rows = [];
  const filename = `sahyog_${module}_${new Date().toISOString().split("T")[0]}.csv`;

  switch (module) {
    case "donations": {
      const records = await Donation.find().populate("donor", "name email").sort("-donationDate").lean();
      headers = ["Receipt No", "Donor Name", "Donor Email", "Amount (INR)", "Payment Method", "Date", "Purpose", "Notes"];
      rows = records.map((r) => [
        r.receiptNo || "",
        r.donor?.name || "",
        r.donor?.email || "",
        r.amount || 0,
        r.paymentMethod || "",
        r.donationDate ? new Date(r.donationDate).toISOString().split("T")[0] : "",
        r.purpose || "",
        r.notes || "",
      ]);
      break;
    }

    case "volunteers": {
      const records = await Volunteer.find().sort("-createdAt").lean();
      headers = ["Full Name", "Email", "Phone", "City", "Availability", "Skills", "Status", "Joined On"];
      rows = records.map((r) => [
        r.fullName || "",
        r.email || "",
        r.phone || "",
        r.city || "",
        r.availability || "",
        (r.skills || []).join(", "),
        r.status || "",
        r.joinedOn ? new Date(r.joinedOn).toISOString().split("T")[0] : "",
      ]);
      break;
    }

    case "beneficiaries": {
      const records = await Beneficiary.find().sort("-createdAt").lean();
      headers = ["Full Name", "Age", "Gender", "Phone", "City", "Category", "Status", "Registered On", "Address"];
      rows = records.map((r) => [
        r.fullName || "",
        r.age || "",
        r.gender || "",
        r.phone || "",
        r.city || "",
        r.category || "",
        r.status || "",
        r.registeredOn ? new Date(r.registeredOn).toISOString().split("T")[0] : "",
        r.address || "",
      ]);
      break;
    }

    case "assistance": {
      const records = await Assistance.find().populate("beneficiary", "fullName").sort("-assistanceDate").lean();
      headers = ["Beneficiary Name", "Type", "Value (INR)", "Status", "Date", "Description"];
      rows = records.map((r) => [
        r.beneficiary?.fullName || "",
        r.type || "",
        r.value || 0,
        r.status || "",
        r.assistanceDate ? new Date(r.assistanceDate).toISOString().split("T")[0] : "",
        r.description || "",
      ]);
      break;
    }

    case "events": {
      const records = await Event.find().populate("volunteers", "fullName").sort("-eventDate").lean();
      headers = ["Title", "Date", "Location", "Status", "Volunteers Assigned", "Description"];
      rows = records.map((r) => [
        r.title || "",
        r.eventDate ? new Date(r.eventDate).toISOString().split("T")[0] : "",
        r.location || "",
        r.status || "",
        (r.volunteers || []).map((v) => v.fullName).join("; "),
        r.description || "",
      ]);
      break;
    }

    default:
      return sendError(res, `Unknown export module: ${module}. Available: donations, volunteers, beneficiaries, assistance, events`, 400);
  }

  const csvLines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csvLines.join("\r\n"));
});
