// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const config = require('./config');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createFileRepository } = require('./repositories/fileRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRoutes } = require('./routes/documentRoutes');

const app = express();
app.use(express.json());

const documentRepository = createDocumentRepository();
const fileRepository = createFileRepository(config.storageDirectory);
const documentService = createDocumentService({
  documentRepository,
  fileRepository,
  allowedMimeTypes: config.allowedMimeTypes,
});
const documentController = createDocumentController({
  documentService,
  defaultOwner: config.defaultOwner,
  allowUserHeader: config.allowUserHeader,
});

app.use(async (_request, _response, next) => {
  try {
    await fileRepository.ensureStorageDirectory();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(createDocumentRoutes({
  documentController,
  storageDirectory: config.storageDirectory,
  maxFileSize: config.maxFileSize,
  allowedMimeTypes: config.allowedMimeTypes,
}));

app.use((error, _request, response, next) => {
  if (!error) {
    next();
    return;
  }

  const isFileTooLarge = error.code === 'LIMIT_FILE_SIZE';
  const isFileTypeNotAllowed = error.code === 'FILE_TYPE_NOT_ALLOWED';
  response.status(isFileTooLarge ? 413 : isFileTypeNotAllowed ? 415 : 500).json({
    error: {
      code: isFileTooLarge
        ? 'FILE_TOO_LARGE'
        : isFileTypeNotAllowed ? 'FILE_TYPE_NOT_ALLOWED' : 'UPLOAD_ERROR',
      message: isFileTooLarge
        ? 'O arquivo excede o limite permitido.'
        : isFileTypeNotAllowed ? error.message : 'Não foi possível processar o upload.',
    },
  });
});

// Endpoint de verificação de saúde para monitoramento local da aplicação.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  fileRepository.ensureStorageDirectory().then(() => {
    app.listen(config.port, () => {
      console.log(`DMS backend ouvindo na porta ${config.port}`);
    });
  }).catch((error) => {
    console.error('Não foi possível preparar o armazenamento local.', error);
    process.exitCode = 1;
  });
}

module.exports = app;
