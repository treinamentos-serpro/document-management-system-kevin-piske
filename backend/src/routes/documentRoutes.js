const express = require('express');
const multer = require('multer');
const crypto = require('node:crypto');

function createDocumentRoutes({ documentController, storageDirectory, maxFileSize, allowedMimeTypes }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDirectory,
      filename: (_request, file, callback) => {
        callback(null, crypto.randomUUID());
      },
    }),
    limits: { fileSize: maxFileSize },
    fileFilter: (_request, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error('Tipo de arquivo não permitido.');
        error.code = 'FILE_TYPE_NOT_ALLOWED';
        callback(error);
        return;
      }
      callback(null, true);
    },
  });

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = { createDocumentRoutes };