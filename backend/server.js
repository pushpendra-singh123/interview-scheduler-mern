const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const slotRoutes = require("./src/routes/slotRoutes");
const userRoutes = require("./src/routes/userRoutes");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/slots", slotRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
