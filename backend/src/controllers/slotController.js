const Slot = require("../models/Slot");

exports.getSlots = async (req, res) => {
  const slots = await Slot.find();
  res.json(slots);
};

exports.bookSlot = async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });

  if (slot.bookedCount >= slot.maxCandidates)
    return res.status(400).json({ message: "Slot full" });

  slot.bookedCount++;
  await slot.save();
  res.json({ message: "Slot booked successfully" });
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
