const express = require("express");
const router = express.Router();
const { consumeShareLink } = require("../controllers/documentController");

router.get("/:token", consumeShareLink);

module.exports = router;
