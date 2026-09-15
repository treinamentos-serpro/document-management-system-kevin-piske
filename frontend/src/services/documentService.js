async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error?.message || 'Não foi possível concluir a operação.');
}

export async function listDocuments(options = {}) {
  const response = await parseResponse(await fetch('/api/documents', options));
  return (await response.json()).documents;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await parseResponse(await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  }));

  return response.json();
}

export function getDownloadUrl(documentId) {
  return `/api/documents/${encodeURIComponent(documentId)}/download`;
}