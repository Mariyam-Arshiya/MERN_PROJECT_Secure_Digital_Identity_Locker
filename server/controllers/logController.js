const AccessLog = require("../models/accessLog");

const getLogs = async (req, res) => {
  const logs = await AccessLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("documentId", "title type");

  res.json({ logs });
};

module.exports = {
  getLogs
};
