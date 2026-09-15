const fs = require('node:fs/promises');
const path = require('node:path');

function createFileRepository(storageDirectory) {
  async function ensureStorageDirectory() {
    await fs.mkdir(storageDirectory, { recursive: true });
  }

  function getFilePath(storedName) {
    if (!storedName || storedName !== path.basename(storedName)) {
      const error = new Error('Nome de arquivo inválido.');
      error.code = 'INVALID_STORED_NAME';
      throw error;
    }

    const storageRoot = path.resolve(storageDirectory);
    const filePath = path.resolve(storageRoot, storedName);
    if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
      const error = new Error('Caminho de arquivo inválido.');
      error.code = 'INVALID_STORED_NAME';
      throw error;
    }

    return filePath;
  }

  async function remove(storedName) {
    await fs.rm(getFilePath(storedName), { force: true });
  }

  async function exists(storedName) {
    try {
      await fs.access(getFilePath(storedName));
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  return {
    ensureStorageDirectory,
    getFilePath,
    remove,
    exists,
  };
}

module.exports = { createFileRepository };