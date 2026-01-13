const router = require("express").Router();

const { requireAuth, isAdmin } = require("../middleware/auth");
const {
  getAdminNotifications,
  markAdminNotificationsSeen,
  getUserNotifications,
  markUserNotificationsSeen,
} = require("../controllers/notificationController");

router.get("/admin", requireAuth, isAdmin, getAdminNotifications);
router.patch("/admin/seen", requireAuth, isAdmin, markAdminNotificationsSeen);

router.get("/user", requireAuth, getUserNotifications);
router.patch("/user/seen", requireAuth, markUserNotificationsSeen);

module.exports = router;
