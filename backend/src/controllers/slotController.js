const Slot = require("../models/Slot");
const User = require("../models/User");

exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("bookings.user", "_id");
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    const { email } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required to book the slot" });

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@"))
      return res.status(400).json({ message: "Invalid email" });

    // Booking requires existing user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not exist" });

    if ((slot.bookings || []).length >= slot.maxCandidates)
      return res.status(400).json({ message: "Slot full" });

    // Prevent duplicate booking by email
    const alreadyBooked = (slot.bookings || []).some((b) => {
      if (!b.email) return false;
      return String(b.email).trim().toLowerCase() === normalizedEmail;
    });

    if (alreadyBooked)
      return res.status(400).json({ message: "User already booked this slot" });

    // Candidate can select only one slot across the system.
    // (Also enforced via a unique index on bookings.email)
    const existingBooking = await Slot.findOne({
      _id: { $ne: slot._id },
      "bookings.email": normalizedEmail,
    })
      .select({ _id: 1 })
      .lean();
    if (existingBooking)
      return res
        .status(400)
        .json({ message: "User already booked another slot" });

    slot.bookings = slot.bookings || [];
    slot.bookings.push({
      email: normalizedEmail,
      name: user.name,
      user: user._id,
    });
    slot.bookedCount = slot.bookings.length;
    await slot.save();
    res.json({ message: "Slot booked successfully", slot });
  } catch (err) {
    // If two concurrent requests try to book different slots with the same email,
    // the unique index on bookings.email will throw a duplicate key error.
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

    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required to unbook the slot" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not exist" });

    const before = slot.bookings || [];
    const after = before.filter((b) => {
      if (!b.email) return true;
      return String(b.email).trim().toLowerCase() !== normalizedEmail;
    });

    if (after.length === before.length)
      return res.status(400).json({ message: "No matching booking found" });

    slot.bookings = after;
    slot.bookedCount = slot.bookings.length;
    await slot.save();
    res.json({ message: "Booking removed", slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { startTime, endTime, maxCandidates } = req.body;

    if (!startTime || !endTime || maxCandidates === undefined)
      return res.status(400).json({ message: "Missing required fields" });

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      return res.status(400).json({ message: "Invalid start or end time" });

    const max = parseInt(maxCandidates, 10);
    if (isNaN(max) || max <= 0)
      return res.status(400).json({ message: "Invalid maxCandidates" });

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
      if (isNaN(newStart.getTime()))
        return res.status(400).json({ message: "Invalid startTime" });
    }
    if (endTime) {
      newEnd = new Date(endTime);
      if (isNaN(newEnd.getTime()))
        return res.status(400).json({ message: "Invalid endTime" });
    }
    if (newStart >= newEnd)
      return res
        .status(400)
        .json({ message: "startTime must be before endTime" });

    if (maxCandidates !== undefined) {
      const max = parseInt(maxCandidates, 10);
      if (isNaN(max) || max <= 0)
        return res.status(400).json({ message: "Invalid maxCandidates" });
      if (max < (slot.bookedCount || 0))
        return res.status(400).json({
          message: "maxCandidates cannot be less than already booked",
        });
      slot.maxCandidates = max;
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;

    await slot.save();
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
