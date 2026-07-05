const AccessLog = require("../models/accessLog");

const writeAccessLog = async (req, action, documentId = null) => {
  if (!req.user || req.user.privateMode) return;

  await AccessLog.create({
    userId: req.user._id,
    documentId,
    action,
    ipAddress: req.ip || req.connection.remoteAddress || ""
  });
};

module.exports = {
  writeAccessLog
};
