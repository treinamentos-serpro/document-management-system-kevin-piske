const path = require('node:path');

const storageDirectory = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../storage');

const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);
const defaultMimeTypes = [
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES
  ? process.env.ALLOWED_MIME_TYPES.split(',')
  : defaultMimeTypes)
  .map((mimeType) => mimeType.trim())
  .filter(Boolean);

module.exports = {
  port: Number(process.env.PORT || 3000),
  storageDirectory,
  maxFileSize: Number.isFinite(maxFileSize) && maxFileSize > 0
    ? maxFileSize
    : 10 * 1024 * 1024,
  allowedMimeTypes,
  defaultOwner: process.env.DEFAULT_OWNER || 'default-user',
  allowUserHeader: process.env.TRUST_USER_HEADER === 'true',
};