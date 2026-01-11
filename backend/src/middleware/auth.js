const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT not configured",
      });
    }
    // decode jwt token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload && payload.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

function isAdmin(req, res, next) {
  try {
    if (!req.user)
      return res.status(401).json({
        message: "Unauthorized",
      });
    if (req.user.role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "This is a protect route for Admins,you can not access it",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role is not Matching",
    });
  }
}

module.exports = { requireAuth, isAdmin };
