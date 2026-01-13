const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("./models/User");

function initSocket({ server, app }) {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  if (app) app.set("io", io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized"));
      if (!process.env.JWT_SECRET) return next(new Error("JWT not configured"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload && payload.sub;
      if (!userId) return next(new Error("Unauthorized"));

      const user = await User.findById(userId).lean();
      if (!user) return next(new Error("Unauthorized"));

      socket.data.user = {
        _id: String(user._id),
        role: user.role,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    if (!user) return;

    socket.join(`user:${user._id}`);
    if (user.role === "admin") socket.join("admin");
  });

  return io;
}

module.exports = { initSocket };
