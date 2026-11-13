// Comprehensive database seeding script:
// Usage:
//   npm run seed            (seeds roles, admin, and mock data if empty)
//   npm run seed -- --reset (wipes operational collections and re-seeds fresh mock data)

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { ensureRoles, ensureAdminUser } = require("./roles");
const { seedMockData } = require("./mockData");

(async () => {
  const shouldReset = process.argv.includes("--reset");
  console.log(`\n========================================`);
  console.log(`   SAHYOG NGO System - Database Seeder   `);
  console.log(`========================================\n`);

  try {
    await connectDB();
    console.log(`Connected to MongoDB database: "${process.env.DB_NAME || "sahyog_db"}"\n`);

    const roleCount = await ensureRoles();
    console.log(`[OK] Roles verified (${roleCount} system roles ready).`);

    const admin = await ensureAdminUser();
    if (admin) {
      console.log(`[OK] Administrator ready: ${admin.email}`);
    }

    console.log("\nPopulating realistic mock NGO dataset...");
    const counts = await seedMockData({ reset: shouldReset });

    console.log(`\n========================================`);
    console.log(`   MOCK DATASET READY                   `);
    console.log(`========================================`);
    console.log(`- Volunteers:      ${counts.volunteers}`);
    console.log(`- Donors:          ${counts.donors}`);
    console.log(`- Donations:       ${counts.donations}`);
    console.log(`- Beneficiaries:   ${counts.beneficiaries}`);
    console.log(`- Aid Records:     ${counts.assistance}`);
    console.log(`- NGO Events:      ${counts.events}`);
    console.log(`----------------------------------------`);
    console.log(`Ready-to-use Login Credentials:`);
    console.log(`1. Administrator:  admin@sahyog.org     / Admin@123`);
    console.log(`2. Staff Member:   staff@sahyog.org     / Staff@123`);
    console.log(`3. Volunteer:      volunteer@sahyog.org / Volunteer@123`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error("\n[ERROR] Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.\n");
  }
})();
