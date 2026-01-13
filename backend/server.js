const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const slotRoutes = require("./src/routes/slotRoutes");
const authRoutes = require("./src/routes/authRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const { initSocket } = require("./src/socket");
const PORT = process.env.PORT || 5001;

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/slots", slotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

const server = http.createServer(app);

initSocket({ server, app });

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
