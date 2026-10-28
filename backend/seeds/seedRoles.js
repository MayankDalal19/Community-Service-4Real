// Manual seeding:  npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { ensureRoles } = require("./roles");
const { ensureDefaultUsers } = require("./users");

(async () => {
  try {
    await connectDB();
    const totalRoles = await ensureRoles();
    const userSeed = await ensureDefaultUsers();
    console.log(`Roles ready (${totalRoles} in database "${process.env.DB_NAME || "sahyog_db"}")`);
    console.log(`Users ready (${userSeed.total} total, ${userSeed.newlyCreated} created)`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
