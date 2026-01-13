const Slot = require("../models/Slot");
const { createAdminNotification } = require("./notificationController");

// handlers for user

exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate(
      "bookings.user",
      "_id name email role"
    );
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({
        status: false,
        message: "Slot not found",
      });
    }

    const user = req.user;

    if ((slot.bookings || []).length >= slot.maxCandidates) {
      return res.status(400).json({
        message: "Slot full",
      });
    }

    const alreadyBooked = (slot.bookings || []).some((b) => {
      if (!b.user) return false;
      return String(b.user) === String(user._id);
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "User already booked this slot",
      });
    }

    const existingBooking = await Slot.findOne({
      _id: { $ne: slot._id }, //Exclude the current slot
      "bookings.user": user._id,
    })
      .select({ _id: 1 }) // return only id field
      .lean();

    if (existingBooking) {
      return res.status(400).json({
        message: "User already booked another slot",
      });
    }

    slot.bookings = slot.bookings || [];
    slot.bookings.push({
      user: user._id,
    });
    slot.bookedCount = slot.bookings.length;
    await slot.save();

    await createAdminNotification({
      req,
      sourceUserId: user._id,
      type: "BOOK",
      message: `${user.name || "A user"} booked a slot`,
    });

    res.json({ message: "Slot booked successfully", slot });
  } catch (err) {
    if (err && err.code === 11000)
      return res
        .status(400)
        .json({ message: "User already booked another slot" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unbookSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    const user = req.user;

    const before = slot.bookings || [];
    const after = before.filter((b) => {
      if (!b.user) return true;
      return String(b.user) !== String(user._id);
    });

    if (after.length === before.length) {
      return res.status(400).json({
        message: "No matching booking found",
      });
    }

    slot.bookings = after;
    slot.bookedCount = slot.bookings.length;
    await slot.save();

    await createAdminNotification({
      req,
      sourceUserId: user._id,
      type: "UNBOOK",
      message: `${user.name || "A user"} unbook a slot`,
    });

    res.status(201).json({
      success: true,
      message: "Booking removed",
      slot,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// Handlers for admin/interviewer

exports.createSlot = async (req, res) => {
  try {
    const { startTime, endTime, maxCandidates } = req.body;

    if (!startTime || !endTime || maxCandidates === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end time",
      });
    }

    const max = parseInt(maxCandidates, 10);
    if (isNaN(max) || max <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid maxCandidates",
      });
    }

    const slot = new Slot({
      startTime: start,
      endTime: end,
      maxCandidates: max,
    });
    await slot.save();

    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { startTime, endTime, maxCandidates } = req.body;
    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    let newStart = slot.startTime;
    let newEnd = slot.endTime;

    if (startTime) {
      newStart = new Date(startTime);
      if (isNaN(newStart.getTime())) {
        return res.status(400).json({
          message: "Invalid startTime",
        });
      }
    }

    if (endTime) {
      newEnd = new Date(endTime);
      if (isNaN(newEnd.getTime())) {
        return res.status(400).json({ message: "Invalid endTime" });
      }
    }

    if (newStart >= newEnd) {
      return res
        .status(400)
        .json({ message: "startTime must be before endTime" });
    }

    if (maxCandidates !== undefined) {
      const max = parseInt(maxCandidates, 10);
      if (isNaN(max) || max <= 0) {
        return res.status(400).json({ message: "Invalid maxCandidates" });
      }
      if (max < (slot.bookedCount || 0)) {
        return res.status(400).json({
          message: "maxCandidates cannot be less than already booked",
        });
      }
      slot.maxCandidates = max;
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;

    await slot.save();
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
