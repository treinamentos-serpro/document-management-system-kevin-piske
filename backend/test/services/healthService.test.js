const { test } = require('node:test');
const assert = require('node:assert');

const { getHealthStatus } = require('../../src/services/healthService');

test('getHealthStatus retorna o payload esperado', () => {
  assert.deepStrictEqual(getHealthStatus(), { status: 'ok' });
});
