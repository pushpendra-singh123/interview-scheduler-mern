const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function signToken(user) {
  const payload = { sub: String(user._id), role: user.role, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes("@"))
      return res.status(400).json({ message: "Invalid email" });

    const desiredRole = role === "admin" ? "admin" : "user";
    if (desiredRole === "admin") {
      if (!process.env.ADMIN_SIGNUP_SECRET)
        return res.status(500).json({ message: "Admin signup not configured" });
      if (String(adminSecret || "") !== String(process.env.ADMIN_SIGNUP_SECRET))
        return res.status(403).json({ message: "Invalid admin signup secret" });
    }

    const existing = await User.findOne({ email: normalizedEmail })
      .select({ _id: 1 })
      .lean();
    if (existing)
      return res
        .status(400)
        .json({ message: "User with email already exists" });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: desiredRole,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(
      String(password),
      String(user.passwordHash)
    );
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
