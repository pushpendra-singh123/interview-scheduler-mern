const Notification = require("../models/Notification");

function getIo(req) {
  return req.app && req.app.get("io");
}

function emitToRoom(io, room, payload) {
  if (!io) return;
  io.to(room).emit("notification:new", payload);
}


exports.getAdminNotifications = async (req, res) => {
  try {
    const items = await Notification.find({ recipientRole: "admin" })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.markAdminNotificationsSeen = async (req, res) => {
  try {
    const { ids } = req.body || {};

    const filter = { recipientRole: "admin", seenAt: null };
    if (Array.isArray(ids) && ids.length) filter._id = { $in: ids };

    const now = new Date();

    const unseen = await Notification.find(filter).select({
      sourceUser: 1,
      type: 1,
    });

    const result = await Notification.updateMany(filter, {
      $set: { seenAt: now },
    });

    const byUser = new Map();
    for (const n of unseen || []) {
      const userId = n && n.sourceUser ? String(n.sourceUser) : "";
      if (!userId) continue;
      const set = byUser.get(userId) || new Set();
      if (n.type) set.add(String(n.type));
      byUser.set(userId, set);
    }

    const io = getIo(req);

    for (const [userId, types] of byUser.entries()) {
      let message = "interviewer has seen your booking";
      const hasBook = types.has("BOOK");
      const hasUnbook = types.has("UNBOOK");
      if (hasBook && hasUnbook)
        message = "interviewer has seen your booking update";
      else if (hasUnbook) message = "interviewer has seen your unbooking";

      const doc = await Notification.create({
        recipientUser: userId,
        type: "SEEN_ACK",
        message,
      });
      emitToRoom(io, `user:${userId}`, doc.toObject());
    }

    res.json({
      updated: result.modifiedCount || 0,
      sentToUsers: byUser.size,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getUserNotifications = async (req, res) => {
  try {
    const items = await Notification.find({ recipientUser: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.markUserNotificationsSeen = async (req, res) => {
  try {
    const { ids } = req.body || {};

    const filter = { recipientUser: req.user._id, seenAt: null };
    if (Array.isArray(ids) && ids.length) filter._id = { $in: ids };

    const now = new Date();
    const result = await Notification.updateMany(filter, {
      $set: { seenAt: now },
    });

    res.json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.createAdminNotification = async ({
  req,
  sourceUserId,
  type,
  message,
}) => {
  const doc = await Notification.create({
    recipientRole: "admin",
    sourceUser: sourceUserId,
    type,
    message,
  });

  const io = getIo(req);
  emitToRoom(io, "admin", doc.toObject());
  return doc;
};
