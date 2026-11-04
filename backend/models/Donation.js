const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: [true, "Donor is required"], index: true },
    amount: { type: Number, required: [true, "Amount is required"], min: [1, "Amount must be at least 1"] },
    donationDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"], default: "UPI" },
    purpose: { type: String, trim: true, maxlength: 150 },
    receiptNo: { type: String, unique: true, trim: true },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Auto-generate a receipt number such as SAH-20261007-4821 when none is given.
donationSchema.pre("validate", function () {
  if (this.isNew && !this.receiptNo) {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    this.receiptNo = `SAH-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

module.exports = mongoose.model("Donation", donationSchema);
