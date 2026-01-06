const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  maxCandidates: Number,
  bookedCount: { type: Number, default: 0 },
  bookings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      email: { type: String, required: false },
      name: { type: String, required: false },
      bookedAt: { type: Date, default: Date.now },
    },
  ],
});

// Enforce "a candidate can select only one slot" across the whole system.
// This prevents the same email from appearing in bookings of multiple slots.
slotSchema.index(
  { "bookings.email": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "bookings.email": { $exists: true, $type: "string" },
    },
  }
);

module.exports = mongoose.model("Slot", slotSchema);
