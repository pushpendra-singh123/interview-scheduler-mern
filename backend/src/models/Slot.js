
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    startTime: Date,
    endTime: Date,
    maxCandidates: Number,
    bookedCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Slot', slotSchema);
