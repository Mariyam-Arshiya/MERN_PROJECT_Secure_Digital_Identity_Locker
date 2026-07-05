const jwt = require("jsonwebtoken");
const User = require("../models/user");

const accessSecret = process.env.JWT_ACCESS_SECRET || "secure-locker-access-secret";

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const decoded = jwt.verify(token, accessSecret);
    const user = await User.findById(decoded.id).select("-password -refreshTokenHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
};

module.exports = protect;
