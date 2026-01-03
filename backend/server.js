const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const slotRoutes = require("./src/routes/slotRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/slots", slotRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
