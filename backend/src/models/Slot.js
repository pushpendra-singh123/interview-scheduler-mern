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
        required: true,
      },
      bookedAt: { type: Date, default: Date.now },
    },
  ],
});

slotSchema.index({ "bookings.user": 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);
