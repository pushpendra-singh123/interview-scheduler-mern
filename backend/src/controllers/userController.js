const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@"))
      return res.status(400).json({ message: "Invalid email" });

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res
        .status(400)
        .json({ message: "User with email already exists" });

    const user = new User({ name, email: normalizedEmail });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
