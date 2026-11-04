const mongoose = require("mongoose");

const CATEGORIES = ["Education", "Healthcare", "Food", "Shelter", "Livelihood", "Other"];

const beneficiarySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, "Full name is required"], trim: true, maxlength: 100 },
    age: { type: Number, min: [0, "Age cannot be negative"], max: [120, "Enter a realistic age"] },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String, trim: true, match: [/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"] },
    address: { type: String, trim: true, maxlength: 250 },
    city: { type: String, trim: true, maxlength: 80 },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    registeredOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Beneficiary", beneficiarySchema);
module.exports.CATEGORIES = CATEGORIES;
