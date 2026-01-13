const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ["admin"],
      default: undefined,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
      index: true,
    },
    sourceUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    type: {
      type: String,
      enum: ["BOOK", "UNBOOK", "SEEN_ACK"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientUser: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
