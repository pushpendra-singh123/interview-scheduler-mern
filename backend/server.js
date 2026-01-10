const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const slotRoutes = require("./src/routes/slotRoutes");
const authRoutes = require("./src/routes/authRoutes");
const PORT = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/slots", slotRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
