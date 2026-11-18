// Clean / Wipe seed & mock data script
// Usage:
//   node seeds/cleanData.js
//   npm run seed:clean

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { ensureRoles, ensureAdminUser } = require("./roles");

const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Beneficiary = require("../models/Beneficiary");
const Assistance = require("../models/Assistance");
const Event = require("../models/Event");

async function cleanData() {
  console.log(`\n========================================`);
  console.log(`   SAHYOG NGO System - Clean Database   `);
  console.log(`========================================\n`);

  try {
    await connectDB();
    console.log(`Connected to database: "${process.env.DB_NAME || "sahyog_db"}"\n`);

    console.log("Removing all operational seed & mock records...");
    const [vRes, dRes, donRes, bRes, aRes, eRes] = await Promise.all([
      Volunteer.deleteMany({}),
      Donor.deleteMany({}),
      Donation.deleteMany({}),
      Beneficiary.deleteMany({}),
      Assistance.deleteMany({}),
      Event.deleteMany({}),
    ]);

    // Keep primary administrator account
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@sahyog.org").toLowerCase();
    const uRes = await User.deleteMany({ email: { $ne: adminEmail } });

    console.log(`Deleted operational records:`);
    console.log(`- Volunteers:    ${vRes.deletedCount}`);
    console.log(`- Donors:        ${dRes.deletedCount}`);
    console.log(`- Donations:     ${donRes.deletedCount}`);
    console.log(`- Beneficiaries: ${bRes.deletedCount}`);
    console.log(`- Aid Records:   ${aRes.deletedCount}`);
    console.log(`- Events:        ${eRes.deletedCount}`);
    console.log(`- Mock Users:    ${uRes.deletedCount}`);

    console.log("\nEnsuring essential system roles and admin account...");
    const roleCount = await ensureRoles();
    console.log(`[OK] Roles verified (${roleCount} system roles ready).`);

    const admin = await ensureAdminUser();
    if (admin) {
      console.log(`[OK] Primary Admin ready: ${admin.email}`);
    }

    console.log(`\n========================================`);
    console.log(`   DATABASE CLEAN COMPLETE              `);
    console.log(`========================================`);
    console.log(`All seed/mock data has been removed.`);
    console.log(`System is clean with essential roles and Administrator ready.\n`);

    return {
      volunteers: vRes.deletedCount,
      donors: dRes.deletedCount,
      donations: donRes.deletedCount,
      beneficiaries: bRes.deletedCount,
      assistance: aRes.deletedCount,
      events: eRes.deletedCount,
      users: uRes.deletedCount,
    };
  } catch (err) {
    console.error("\n[ERROR] Failed to clean database:", err.message);
    process.exitCode = 1;
    throw err;
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
      console.log("Database connection closed.\n");
    }
  }
}

if (require.main === module) {
  cleanData();
}

module.exports = { cleanData };
