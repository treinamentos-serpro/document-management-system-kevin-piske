const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const app = require('../src/app');
const config = require('../src/config');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('executa o fluxo de upload, listagem e download', async () => {
  const filesBefore = new Set(await fs.readdir(config.storageDirectory));
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), 'teste.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);
    const document = await uploadResponse.json();
    assert.strictEqual(document.originalName, 'teste.txt');
    assert.strictEqual(document.owner, config.defaultOwner);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    assert.ok((await listResponse.json()).documents.some((item) => item.id === document.id));

    const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    const filesAfter = await fs.readdir(config.storageDirectory);
    await Promise.all(filesAfter
      .filter((file) => !filesBefore.has(file))
      .map((file) => fs.rm(`${config.storageDirectory}/${file}`, { force: true })));
  }
});

test('rejeita tipo MIME não permitido', async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo executavel'], { type: 'application/octet-stream' }), 'arquivo.bin');

    const response = await fetch(`http://127.0.0.1:${port}/upload`, {
      method: 'POST',
      body: formData,
    });
    assert.strictEqual(response.status, 415);
    assert.strictEqual((await response.json()).error.code, 'FILE_TYPE_NOT_ALLOWED');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
