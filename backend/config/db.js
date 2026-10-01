const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

// Connects once at startup. Mongoose keeps its own connection pool.
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<db_password>")) {
    const err = new Error("MONGODB_URI is not set in backend/.env");
    err.code = "ENV_MISSING";
    throw err;
  }

  await mongoose.connect(uri, {
    dbName: process.env.DB_NAME || "sahyog_db",
    serverSelectionTimeoutMS: 8000, // fail fast instead of hanging if Atlas is unreachable
  });
  return mongoose.connection;
}

// readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
const isConnected = () => mongoose.connection.readyState === 1;

// Real round-trip to Atlas (used by /api/health/db).
async function pingDB() {
  await mongoose.connection.db.admin().ping();
  return true;
}

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));

module.exports = { connectDB, isConnected, pingDB };
