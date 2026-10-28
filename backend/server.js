require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { connectDB } = require("./config/db");
const { ensureRoles } = require("./seeds/roles");
const { ensureDefaultUsers } = require("./seeds/users");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Global middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ---- Routes ----
app.get("/", (req, res) =>
  res.json({ success: true, message: "Welcome to the SAHYOG API. Try /api/health" })
);
app.use("/api", routes);

// ---- Errors (always last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Start ----
// The API starts first so the frontend can still show a clear
// "database not connected" message if Atlas is unreachable.
app.listen(PORT, async () => {
  console.log(`\nSAHYOG API running on http://localhost:${PORT}`);
  try {
    await connectDB();
    console.log(`MongoDB Atlas connected  (database: ${process.env.DB_NAME || "sahyog_db"})`);
    const totalRoles = await ensureRoles();
    const userSeed = await ensureDefaultUsers();
    console.log(`Roles ready (${totalRoles})`);
    console.log(`Default users ready (${userSeed.total} total, ${userSeed.newlyCreated} created)\n`);
  } catch (err) {
    console.error(`MongoDB NOT connected: ${err.message}`);
    console.error("Check MONGODB_URI in backend/.env, your Atlas database user, and Network Access (IP allow list).\n");
  }
});
