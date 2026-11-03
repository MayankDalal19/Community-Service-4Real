const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Beneficiary = require("../models/Beneficiary");
const Assistance = require("../models/Assistance");
const Event = require("../models/Event");

// GET /api/stats -> numbers for the dashboard cards
exports.getStats = asyncHandler(async (req, res) => {
  const [volunteers, donors, beneficiaries, assistance, events, upcomingEvents, donationAgg] =
    await Promise.all([
      Volunteer.countDocuments(),
      Donor.countDocuments(),
      Beneficiary.countDocuments(),
      Assistance.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: "Upcoming" }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

  sendSuccess(res, {
    volunteers,
    donors,
    beneficiaries,
    assistance,
    events,
    upcomingEvents,
    totalDonations: donationAgg[0]?.total || 0,
  }, "Dashboard statistics");
});
