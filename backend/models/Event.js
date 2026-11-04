const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"], trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    eventDate: { type: Date, required: [true, "Event date is required"], index: true },
    location: { type: String, trim: true, maxlength: 200 },
    status: { type: String, enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], default: "Upcoming" },
    // Many-to-many: volunteers assigned to this event
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
