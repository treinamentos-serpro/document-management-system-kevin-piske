const crypto = require('node:crypto');
const path = require('node:path');

function createDocumentService({ documentRepository, fileRepository, allowedMimeTypes }) {
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

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de arquivo não permitido.');
      error.code = 'FILE_TYPE_NOT_ALLOWED';
      error.statusCode = 415;
      throw error;
    }

    const originalName = path.basename(file.originalname || '').replace(/[\u0000-\u001f\u007f]/g, '').trim() || 'documento';

    const document = {
      id: crypto.randomUUID(),
      originalName,
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

  async function resolveDownload(id, owner) {
    const document = documentRepository.findById(id);
    if (!document || document.owner !== owner) {
      const error = new Error('Documento não encontrado.');
      error.code = 'DOCUMENT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (!(await fileRepository.exists(document.storedName))) {
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
