const mongoose = require("mongoose");

// passwordHash is filled by bcrypt in Step 3 and never returned by default queries.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    passwordHash: { type: String, required: true, select: false },
    // Reference to the Role document (the Mongo equivalent of a foreign key)
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
