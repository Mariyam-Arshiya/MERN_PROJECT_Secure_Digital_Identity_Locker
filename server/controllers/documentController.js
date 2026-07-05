const crypto = require("crypto");
const Document = require("../models/document");
const ShareLink = require("../models/shareLink");
const { encrypt, decrypt } = require("../utils/cryptoUtil");
const { writeAccessLog } = require("../middleware/logMiddleware");

const toDocumentResponse = (doc) => ({
  id: doc._id,
  title: doc.title,
  type: doc.type,
  fileUrl: doc.fileUrl,
  content: decrypt(doc.content),
  notes: decrypt(doc.notes),
  category: doc.category,
  tags: doc.tags,
  expiresAt: doc.expiresAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

const ensureVaultOpen = (req, res) => {
  if (req.user.vaultLocked) {
    res.status(423).json({ message: "Vault locked. Re-enter password to unlock." });
    return false;
  }

  return true;
};

const listDocuments = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 8), 1), 30);
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;
  const query = {
    userId: req.user._id
  };

  if (req.query.type) query.type = req.query.type;
  if (req.query.category) query.category = req.query.category;
  if (search) query.$text = { $search: search };

  const [documents, total] = await Promise.all([
    Document.find(query).sort({ [sortBy]: order }).skip(skip).limit(limit),
    Document.countDocuments(query)
  ]);

  await writeAccessLog(req, "view-list");

  res.json({
    documents: documents.map(toDocumentResponse),
    page,
    total,
    pages: Math.ceil(total / limit)
  });
};

const createDocument = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const { title, type, content, notes, category, expiresAt } = req.body;
  const tags = Array.isArray(req.body.tags)
    ? req.body.tags
    : String(req.body.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);

  const document = await Document.create({
    userId: req.user._id,
    title,
    type,
    fileUrl: req.body.fileUrl || "",
    content: encrypt(content || ""),
    notes: encrypt(notes || ""),
    category: category || "Personal",
    tags,
    expiresAt: expiresAt || null,
    searchText: `${content || ""} ${notes || ""}`
  });

  await writeAccessLog(req, "create", document._id);

  res.status(201).json({ document: toDocumentResponse(document) });
};

const getDocument = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  await writeAccessLog(req, "view", document._id);

  res.json({ document: toDocumentResponse(document) });
};

const updateDocument = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  ["title", "type", "fileUrl", "category", "expiresAt"].forEach((field) => {
    if (req.body[field] !== undefined) document[field] = req.body[field] || null;
  });

  if (req.body.content !== undefined) document.content = encrypt(req.body.content);
  if (req.body.notes !== undefined) document.notes = encrypt(req.body.notes);
  if (req.body.tags !== undefined) {
    document.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags).split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  document.searchText = `${req.body.content || decrypt(document.content)} ${req.body.notes || decrypt(document.notes)}`;

  await document.save();
  await writeAccessLog(req, "edit", document._id);

  res.json({ document: toDocumentResponse(document) });
};

const deleteDocument = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const document = await Document.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  await writeAccessLog(req, "delete", document._id);

  res.json({ message: "Document deleted" });
};

const uploadDocumentFile = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  if (!req.file) {
    return res.status(400).json({ message: "File required" });
  }

  res.status(201).json({
    fileUrl: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname
  });
};

const createShareLink = async (req, res) => {
  if (!ensureVaultOpen(req, res)) return;

  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const minutes = Math.min(Math.max(Number(req.body.minutes || 15), 1), 1440);

  await ShareLink.create({
    documentId: document._id,
    userId: req.user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + minutes * 60 * 1000),
    maxViews: Number(req.body.maxViews || 1)
  });

  await writeAccessLog(req, "share-link", document._id);

  res.status(201).json({
    shareUrl: `${req.protocol}://${req.get("host")}/api/share/${token}`,
    expiresInMinutes: minutes
  });
};

const consumeShareLink = async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const shareLink = await ShareLink.findOne({ tokenHash }).populate("documentId");

  if (!shareLink || shareLink.used || shareLink.expiresAt < new Date()) {
    return res.status(410).json({ message: "Share link expired or already used" });
  }

  shareLink.views += 1;
  if (shareLink.views >= shareLink.maxViews) shareLink.used = true;
  await shareLink.save();

  res.json({
    document: toDocumentResponse(shareLink.documentId)
  });
};

module.exports = {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  createShareLink,
  consumeShareLink
};
