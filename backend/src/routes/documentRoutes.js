const express = require('express');
const multer = require('multer');

function createDocumentRoutes({ documentController, storageDirectory, maxFileSize }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDirectory,
      filename: (_request, file, callback) => {
        const extension = file.originalname.includes('.')
          ? `.${file.originalname.split('.').pop().replace(/[^a-zA-Z0-9]/g, '')}`
          : '';
        callback(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`);
      },
    }),
    limits: { fileSize: maxFileSize },
  });

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = { createDocumentRoutes };