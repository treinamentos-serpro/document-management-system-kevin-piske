function createDocumentController({ documentService, defaultOwner, allowUserHeader }) {
  function getOwner(request) {
    return allowUserHeader ? request.get('X-User-Id') || defaultOwner : defaultOwner;
  }

  function sendError(response, error) {
    const isMissingFile = error.code === 'ENOENT';
    const statusCode = error.statusCode || (isMissingFile ? 404 : 500);
    response.status(statusCode).json({
      error: {
        code: isMissingFile ? 'DOCUMENT_NOT_FOUND' : error.code || 'INTERNAL_ERROR',
        message: statusCode === 500 ? 'Erro interno do servidor.' : 'Documento não encontrado.',
      },
    });
  }

  async function upload(request, response) {
    try {
      const document = await documentService.registerUpload(request.file, getOwner(request));
      response.status(201).json(document);
    } catch (error) {
      sendError(response, error);
    }
  }

  function list(request, response) {
    try {
      response.json({ documents: documentService.listDocuments(getOwner(request)) });
    } catch (error) {
      sendError(response, error);
    }
  }

  async function download(request, response) {
    try {
      const document = await documentService.resolveDownload(request.params.id, getOwner(request));
      response.download(document.filePath, document.originalName, {
        headers: { 'Content-Type': document.mimeType },
      }, (error) => {
        if (error && !response.headersSent) {
          sendError(response, error);
        }
      });
    } catch (error) {
      sendError(response, error);
    }
  }

  return { upload, list, download };
}

module.exports = { createDocumentController };