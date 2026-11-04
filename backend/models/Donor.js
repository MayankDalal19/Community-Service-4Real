const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Donor name is required"], trim: true, maxlength: 120 },
    type: { type: String, enum: ["Individual", "Corporate", "Trust"], default: "Individual" },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 150,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    phone: { type: String, trim: true, match: [/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"] },
    city: { type: String, trim: true, maxlength: 80 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);
