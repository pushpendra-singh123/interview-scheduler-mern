const router = require("express").Router();

const { requireAuth, isAdmin } = require("../middleware/auth");
const {
  getAdminNotifications,
  markAdminNotificationsSeen,
  getUserNotifications,
  markUserNotificationsSeen,
} = require("../controllers/notificationController");

router.get("/admin", requireAuth, isAdmin, getAdminNotifications);
router.get("/adminNotifications", requireAuth, isAdmin, getAdminNotifications);
router.patch(
  "/adminNotifications/seen",
  requireAuth,
  isAdmin,
  markAdminNotificationsSeen
);

router.get("/userNotifications", requireAuth, getUserNotifications);
router.patch("/userNotifications/seen", requireAuth, markUserNotificationsSeen);

module.exports = router;
