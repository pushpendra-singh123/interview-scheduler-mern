const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    return res.status(410).json({
      message:
        "This endpoint is deprecated. Use /api/auth/signup to create an account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
