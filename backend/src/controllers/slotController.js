
const Slot = require('../models/Slot');

exports.getSlots = async (req, res) => {
    const slots = await Slot.find();
    res.json(slots);
};

exports.bookSlot = async (req, res) => {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.bookedCount >= slot.maxCandidates)
        return res.status(400).json({ message: 'Slot full' });

    slot.bookedCount++;
    await slot.save();
    res.json({ message: 'Slot booked successfully' });
};
