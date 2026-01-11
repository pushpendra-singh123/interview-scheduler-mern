const router = require("express").Router();
const {
  getSlots,
  bookSlot,
  unbookSlot,
  createSlot,
  updateSlot,
} = require("../controllers/slotController");

const { requireAuth, isAdmin } = require("../middleware/auth");

router.get("/", getSlots);
router.post("/createSlot", requireAuth, isAdmin, createSlot);
router.post("/book/:id", requireAuth, bookSlot);
router.post("/unbook/:id", requireAuth, unbookSlot);
router.patch("/update/:id", requireAuth, isAdmin, updateSlot);

module.exports = router;
