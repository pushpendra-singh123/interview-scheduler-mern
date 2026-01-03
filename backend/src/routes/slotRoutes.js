const router = require("express").Router();
const {
  getSlots,
  bookSlot,
  createSlot,
  updateSlot,
} = require("../controllers/slotController");

router.get("/", getSlots);
router.post("/", createSlot);
router.post("/book/:id", bookSlot);
router.patch("/:id", updateSlot);

module.exports = router;
