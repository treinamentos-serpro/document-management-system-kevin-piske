const fs = require('node:fs/promises');
const path = require('node:path');

function createFileRepository(storageDirectory) {
  async function ensureStorageDirectory() {
    await fs.mkdir(storageDirectory, { recursive: true });
  }

  function getFilePath(storedName) {
    return path.join(storageDirectory, storedName);
  }

  async function remove(storedName) {
    await fs.rm(getFilePath(storedName), { force: true });
  }

  return {
    ensureStorageDirectory,
    getFilePath,
    remove,
  };
}

module.exports = { createFileRepository };