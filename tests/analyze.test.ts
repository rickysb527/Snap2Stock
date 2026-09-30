import { afterEach, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/analyze.ts';

const previousKey = process.env.GEMINI_API_KEY;
afterEach(() => {
  mock.restoreAll();
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
});
const valid = { purpose: 'vehicle', mimeType: 'image/png', data: 'aGVsbG8=' };
const request = (body: unknown) => new Request('https://example.com/api/analyze', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('rejects non-POST requests', async () => {
  const result = await handler.fetch(new Request('https://example.com/api/analyze'));
  assert.equal(result.status, 405);
  assert.equal(result.headers.get('Allow'), 'POST');
});
test('rejects invalid JSON and unapproved image requests', async () => {
  const invalidJson = new Request('https://example.com/api/analyze', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal((await handler.fetch(invalidJson)).status, 400);
  for (const body of [null, { ...valid, purpose: 'custom-prompt' }, { ...valid, mimeType: 'text/html' }, { ...valid, data: 'bad!' }]) {
    assert.equal((await handler.fetch(request(body))).status, 400);
  }
});
test('rejects oversized images before calling Gemini', async () => {
  assert.equal((await handler.fetch(request({ ...valid, data: 'A'.repeat(4 * 1024 * 1024 + 1024) }))).status, 413);
});
test('returns a useful error when the server key is unset', async () => {
  delete process.env.GEMINI_API_KEY;
  const result = await handler.fetch(request(valid));
  assert.equal(result.status, 503);
  assert.match((await result.json()).error, /GEMINI_API_KEY/);
});
test('filters AI vehicle fields and never returns the server key', async () => {
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  mock.method(globalThis, 'fetch', async () => Response.json({
    candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify({ Automaker: 'Toyota', Year: '2020', id: 'overwrite', Note: 'injected' }) }] } }],
  }));
  const result = await handler.fetch(request(valid));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { vehicle: { Automaker: 'Toyota', Year: '2020' } });
});
test('returns identification text for scanning', async () => {
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  mock.method(globalThis, 'fetch', async () => Response.json({
    candidates: [{ content: { role: 'model', parts: [{ text: 'ZVW50-1234567' }] } }],
  }));
  const result = await handler.fetch(request({ ...valid, purpose: 'identify' }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { text: 'ZVW50-1234567' });
});
test('does not expose upstream errors or credentials', async () => {
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  mock.method(globalThis, 'fetch', async () => { throw new Error('server-only-test-secret'); });
  const result = await handler.fetch(request(valid));
  assert.equal(result.status, 502);
  assert.doesNotMatch(await result.text(), /server-only-test-secret/);
});
