const crypto = require('node:crypto');

function createDocumentService({ documentRepository, fileRepository }) {
  function toPublicDocument(document) {
    const { storedName, ...publicDocument } = document;
    return publicDocument;
  }

  async function registerUpload(file, owner) {
    if (!file) {
      const error = new Error('Arquivo não informado.');
      error.code = 'FILE_REQUIRED';
      error.statusCode = 400;
      throw error;
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      owner,
    };

    try {
      return toPublicDocument(documentRepository.save(document));
    } catch (error) {
      await fileRepository.remove(file.filename);
      throw error;
    }
  }

  function listDocuments(owner) {
    return documentRepository.findByOwner(owner).map(toPublicDocument);
  }

  function resolveDownload(id, owner) {
    const document = documentRepository.findById(id);
    if (!document || document.owner !== owner) {
      const error = new Error('Documento não encontrado.');
      error.code = 'DOCUMENT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return {
      ...toPublicDocument(document),
      filePath: fileRepository.getFilePath(document.storedName),
    };
  }

  return {
    registerUpload,
    listDocuments,
    resolveDownload,
  };
}

module.exports = { createDocumentService };
