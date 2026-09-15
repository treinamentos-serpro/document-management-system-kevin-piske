const path = require('node:path');

const storageDirectory = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../storage');

const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);

module.exports = {
  port: Number(process.env.PORT || 3000),
  storageDirectory,
  maxFileSize: Number.isFinite(maxFileSize) && maxFileSize > 0
    ? maxFileSize
    : 10 * 1024 * 1024,
  defaultOwner: process.env.DEFAULT_OWNER || 'default-user',
};