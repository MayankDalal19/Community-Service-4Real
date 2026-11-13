const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    phone: { type: String, trim: true, maxlength: 25 },
    city: { type: String, trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true, select: false },
    // Reference to the Role document
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Method to verify password on a user instance
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords consistently
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model("User", userSchema);
