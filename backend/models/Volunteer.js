const mongoose = require("mongoose");

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

const volunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, "Full name is required"], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    phone: { type: String, trim: true, match: [PHONE_RE, "Enter a valid phone number"] },
    city: { type: String, trim: true, maxlength: 80 },
    skills: [{ type: String, trim: true, maxlength: 40 }],
    availability: { type: String, enum: ["Weekdays", "Weekends", "Flexible"], default: "Flexible" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    joinedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
