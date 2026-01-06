const router = require("express").Router();
const {
  getSlots,
  bookSlot,
  unbookSlot,
  createSlot,
  updateSlot,
} = require("../controllers/slotController");

router.get("/", getSlots);
router.post("/", createSlot);
router.post("/book/:id", bookSlot);
router.post("/unbook/:id", unbookSlot);
router.patch("/:id", updateSlot);

module.exports = router;
