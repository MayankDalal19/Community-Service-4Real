const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 255 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
