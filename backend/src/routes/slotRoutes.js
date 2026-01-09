const router = require("express").Router();
const {
  getSlots,
  bookSlot,
  unbookSlot,
  createSlot,
  updateSlot,
} = require("../controllers/slotController");

const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", getSlots);
router.post("/", requireAuth, requireAdmin, createSlot);
router.post("/book/:id", requireAuth, bookSlot);
router.post("/unbook/:id", requireAuth, unbookSlot);
router.patch("/:id", requireAuth, requireAdmin, updateSlot);

module.exports = router;
