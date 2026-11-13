// Manual seeding:  npm run seed
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { ensureRoles, ensureAdminUser } = require("./roles");

(async () => {
  try {
    await connectDB();
    const total = await ensureRoles();
    console.log(`Roles ready (${total} in database "${process.env.DB_NAME || "sahyog_db"}")`);
    const admin = await ensureAdminUser();
    if (admin) {
      console.log(`Admin user ready: ${admin.email}`);
    }
    console.log("Seeding finished successfully!");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
