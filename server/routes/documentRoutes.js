const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  createShareLink
} = require("../controllers/documentController");

router.use(protect);

router.get("/", listDocuments);
router.post("/", createDocument);
router.post("/upload", upload.single("file"), uploadDocumentFile);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
router.post("/:id/share", createShareLink);

module.exports = router;
