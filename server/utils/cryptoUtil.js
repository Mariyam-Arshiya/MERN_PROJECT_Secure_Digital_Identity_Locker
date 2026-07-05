const crypto = require("crypto");

const algorithm = "aes-256-gcm";

const getKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || "secure-digital-identity-locker-dev-secret";
  return crypto.createHash("sha256").update(secret).digest();
};

const encrypt = (value = "") => {
  if (!value) return "";

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (payload = "") => {
  if (!payload || !payload.includes(":")) return payload || "";

  const [ivHex, tagHex, encryptedHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  encrypt,
  decrypt
};
