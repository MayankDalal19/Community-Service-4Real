const mongoose = require("mongoose");

const assistanceSchema = new mongoose.Schema(
  {
    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiary",
      required: [true, "Beneficiary is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["Education", "Healthcare", "Food", "Shelter", "Livelihood", "Other"],
      required: [true, "Assistance type is required"],
    },
    description: { type: String, trim: true, maxlength: 500 },
    value: { type: Number, min: [0, "Value cannot be negative"], default: 0 },
    assistanceDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Planned", "Delivered"], default: "Delivered" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assistance", assistanceSchema);
