const createCrudController = require("../utils/crudController");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Beneficiary = require("../models/Beneficiary");
const Assistance = require("../models/Assistance");
const Event = require("../models/Event");

exports.volunteers = createCrudController(Volunteer, {
  label: "Volunteer",
  searchFields: ["fullName", "email", "city", "skills"],
  filterFields: ["status", "availability"],
});

exports.donors = createCrudController(Donor, {
  label: "Donor",
  searchFields: ["name", "email", "city"],
  filterFields: ["type"],
  // Keep donation history intact: a donor with donations cannot be deleted.
  deleteGuard: async (id) =>
    (await Donation.exists({ donor: id })) ? "This donor has donations and cannot be deleted" : null,
});

exports.donations = createCrudController(Donation, {
  label: "Donation",
  searchFields: ["receiptNo", "purpose"],
  filterFields: ["paymentMethod", "donor"],
  populate: "donor",
  sort: "-donationDate",
});

exports.beneficiaries = createCrudController(Beneficiary, {
  label: "Beneficiary",
  searchFields: ["fullName", "city", "phone"],
  filterFields: ["category", "status"],
  deleteGuard: async (id) =>
    (await Assistance.exists({ beneficiary: id }))
      ? "This beneficiary has assistance records and cannot be deleted"
      : null,
});

exports.assistance = createCrudController(Assistance, {
  label: "Assistance record",
  searchFields: ["description"],
  filterFields: ["type", "status", "beneficiary"],
  populate: "beneficiary",
  sort: "-assistanceDate",
});

exports.events = createCrudController(Event, {
  label: "Event",
  searchFields: ["title", "location"],
  filterFields: ["status"],
  populate: "volunteers",
  sort: "-eventDate",
});
