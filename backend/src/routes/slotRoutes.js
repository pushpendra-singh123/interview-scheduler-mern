
const router = require('express').Router();
const { getSlots, bookSlot } = require('../controllers/slotController');

router.get('/', getSlots);
router.post('/book/:id', bookSlot);

module.exports = router;
