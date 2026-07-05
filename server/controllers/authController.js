const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AccessLog = require("../models/accessLog");

const accessSecret = process.env.JWT_ACCESS_SECRET || "secure-locker-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "secure-locker-refresh-secret";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  vaultLocked: user.vaultLocked,
  privateMode: user.privateMode
});

const signTokens = async (user) => {
  const accessToken = jwt.sign({ id: user._id }, accessSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, refreshSecret, { expiresIn: "7d" });

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    accessToken,
    refreshToken
  };
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12)
    });
    const tokens = await signTokens(user);

    res.status(201).json({
      message: "User registered",
      user: safeUser(user),
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ipAddress = req.ip || "";
    const userAgent = req.headers["user-agent"] || "";
    const knownLogin = user.knownLogins.find((loginItem) => {
      return loginItem.ipAddress === ipAddress && loginItem.userAgent === userAgent;
    });
    let suspicious = false;

    if (!knownLogin && user.knownLogins.length > 0) {
      suspicious = true;
      user.suspiciousLogins.push({
        ipAddress,
        userAgent,
        detectedAt: new Date()
      });
    }

    if (knownLogin) {
      knownLogin.lastSeen = new Date();
    } else {
      user.knownLogins.push({
        ipAddress,
        userAgent,
        lastSeen: new Date()
      });
    }

    const tokens = await signTokens(user);

    if (!user.privateMode) {
      await AccessLog.create({
        userId: user._id,
        action: suspicious ? "suspicious-login" : "login",
        ipAddress
      });
    }

    res.json({
      message: "Login successful",
      suspicious,
      user: safeUser(user),
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = await signTokens(user);

    res.json({
      user: safeUser(user),
      ...tokens
    });
  } catch (error) {
    res.status(401).json({ message: "Refresh token expired" });
  }
};

const me = async (req, res) => {
  res.json({ user: safeUser(req.user) });
};

const logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshTokenHash = "";
  await user.save();
  res.json({ message: "Logged out" });
};

const lockVault = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.vaultLocked = true;
  await user.save();
  res.json({ user: safeUser(user), message: "Vault locked" });
};

const unlockVault = async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Password re-entry failed" });
  }

  user.vaultLocked = false;
  await user.save();
  res.json({ user: safeUser(user), message: "Vault unlocked" });
};

const setPrivateMode = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.privateMode = Boolean(req.body.privateMode);
  await user.save();
  res.json({ user: safeUser(user), message: "Private mode updated" });
};

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
  lockVault,
  unlockVault,
  setPrivateMode
};
