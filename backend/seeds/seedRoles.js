// Manual seeding:  npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { ensureRoles } = require("./roles");

(async () => {
  try {
    await connectDB();
    const total = await ensureRoles();
    console.log(`Roles ready (${total} in database "${process.env.DB_NAME || "sahyog_db"}")`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
