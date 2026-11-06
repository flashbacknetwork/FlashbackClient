const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { createServer } = require('node:http');
const { test } = require('node:test');
const { CRC32C } = require('@google-cloud/storage');
const { FlashbackGCSStorage } = require('../dist/gcs');

// Build first; teeny-request's dynamic ESM transport needs the real Node runtime.
test('GCS refreshes rejected credentials and finishes a resumable upload with isolated instance auth', async t => {
  const originalFetch = global.fetch;
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const credentials = { client_email: 'offline@example.test', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };
  const requests = [];
  const content = Buffer.from('offline upload body');
  const crc32c = new CRC32C();
  crc32c.update(content);
  const metadata = { bucket: 'compatibility', name: 'asset.txt', size: String(content.length), crc32c: crc32c.toString() };
  let tokenRequests = 0;
  const otherTokenIssuers = [];
  let uploaded;
  let uploadWrites = 0;
  const automaticUploads = [];
  const server = createServer((request, response) => {
    const path = request.url.split('?')[0];
    requests.push({ path, authorization: request.headers.authorization });
    if (path === '/other-provider/token') {
      let body = '';
      request.on('data', chunk => body += chunk);
      request.on('end', () => {
        const assertion = new URLSearchParams(body).get('assertion');
        otherTokenIssuers.push(JSON.parse(Buffer.from(assertion.split('.')[1], 'base64url').toString()).iss);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ access_token: 'other-instance-token', expires_in: 3600, token_type: 'Bearer' }));
      });
      return;
    }
    if (path === '/token') {
      tokenRequests += 1;
      request.resume();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ access_token: `instance-token-${tokenRequests}`, expires_in: 3600, token_type: 'Bearer' }));
      return;
    }
    if (path === '/upload/storage/v1/b/compatibility/o') {
      request.resume();
      if (request.headers.authorization === 'Bearer instance-token-1') {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: { code: 401, message: 'Expired access token' } }));
      } else if (/^Bearer instance-token-[2-9]$/.test(request.headers.authorization || '')) {
        const name = new URL(request.url, 'http://localhost').searchParams.get('name');
        if (name === 'rejected.txt') {
          response.writeHead(403, { 'Content-Type': 'application/json', 'X-Provider-Error': 'retained' });
          response.end(JSON.stringify({ error: { code: 403, message: 'Object unavailable' } }));
        } else {
          const session = name === 'automatic.txt' ? '/automatic-session' : '/resumable-session';
          response.writeHead(200, { Location: `http://127.0.0.1:${server.address().port}${session}` });
          response.end();
        }
      } else {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: { code: 401, message: 'Missing bearer token' } }));
      }
      return;
    }
    if (path === '/resumable-session' || path === '/automatic-session') {
      if (request.headers.authorization !== 'Bearer instance-token-2') {
        request.resume();
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: { code: 401, message: 'Missing bearer token' } }));
        return;
      }
      if (request.headers['content-range'] === 'bytes */*') {
        request.resume();
        response.writeHead(308);
        response.end();
        return;
      }
      const chunks = [];
      request.on('data', chunk => chunks.push(chunk));
      request.on('end', () => {
        const bytes = Buffer.concat(chunks);
        if (path === '/automatic-session') automaticUploads.push(bytes);
        else { uploaded = bytes; uploadWrites += 1; }
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ ...metadata, name: path === '/automatic-session' ? 'automatic.txt' : metadata.name }));
      });
      return;
    }
    request.resume();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ...metadata, name: path.endsWith('/automatic.txt') ? 'automatic.txt' : metadata.name }));
  });
  t.after(async () => {
    if (server.listening) {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  const storage = new FlashbackGCSStorage({
    credentials,
    projectId: 'offline', apiEndpoint: endpoint, timeout: 1000,
  });
  t.after(() => storage.cleanup());
  assert.equal(global.fetch, originalFetch);
  const file = storage.bucket('compatibility').file('asset.txt');
  const [beforeUpload] = await file.getMetadata();
  assert.equal(beforeUpload.name, 'asset.txt');
  assert.equal(beforeUpload.size, String(content.length));
  await file.getMetadata();
  assert.equal(requests.filter(request => request.path === '/token').length, 1);
  assert.deepEqual(requests.filter(request => request.path === '/storage/v1/b/compatibility/o/asset.txt'), [
    { path: '/storage/v1/b/compatibility/o/asset.txt', authorization: 'Bearer instance-token-1' },
    { path: '/storage/v1/b/compatibility/o/asset.txt', authorization: 'Bearer instance-token-1' },
  ]);
  const [uri] = await file.createResumableUpload({ metadata: { contentType: 'text/plain' } });
  await file.save(content, { resumable: true, uri, contentType: 'text/plain' });
  assert.deepEqual(uploaded, content);
  assert.equal(uploadWrites, 1);
  assert.equal(tokenRequests, 2);
  assert.deepEqual(requests.filter(request => request.path === '/upload/storage/v1/b/compatibility/o'), [
    { path: '/upload/storage/v1/b/compatibility/o', authorization: 'Bearer instance-token-1' },
    { path: '/upload/storage/v1/b/compatibility/o', authorization: 'Bearer instance-token-2' },
  ]);
  assert.deepEqual(requests.find(request => request.path === '/resumable-session'), { path: '/resumable-session', authorization: 'Bearer instance-token-2' });
  assert.equal(requests.filter(request => request.path === '/resumable-session').length, 2);
  const [afterUpload] = await file.getMetadata();
  assert.deepEqual(afterUpload, metadata);
  const automatic = storage.bucket('compatibility').file('automatic.txt');
  await automatic.save(content, { resumable: true, contentType: 'text/plain' });
  assert.equal(automaticUploads.length, 1);
  assert.deepEqual(automaticUploads[0], content);
  assert.deepEqual((await automatic.getMetadata())[0], { ...metadata, name: 'automatic.txt' });
  assert.deepEqual(requests.filter(request => request.path === '/automatic-session'), [
    { path: '/automatic-session', authorization: 'Bearer instance-token-2' },
  ]);
  assert.equal(requests.filter(request => request.path === '/upload/storage/v1/b/compatibility/o').length, 3);
  assert.equal(tokenRequests, 2);
  const otherStorage = new FlashbackGCSStorage({
    credentials: { ...credentials, client_email: 'other@example.test' },
    projectId: 'other', apiEndpoint: `${endpoint}/other-provider`, timeout: 1000,
  });
  t.after(() => otherStorage.cleanup());
  await otherStorage.bucket('compatibility').file('asset.txt').getMetadata();
  await file.getMetadata();
  assert.deepEqual(otherTokenIssuers, ['other@example.test']);
  assert.deepEqual(requests.find(request => request.path === '/other-provider/storage/v1/b/compatibility/o/asset.txt'), {
    path: '/other-provider/storage/v1/b/compatibility/o/asset.txt', authorization: 'Bearer other-instance-token',
  });
  assert.deepEqual(requests.filter(request => request.path === '/storage/v1/b/compatibility/o/asset.txt').at(-1), {
    path: '/storage/v1/b/compatibility/o/asset.txt', authorization: 'Bearer instance-token-2',
  });
  assert.equal(tokenRequests, 2);
  await assert.rejects(storage.bucket('compatibility').file('rejected.txt').save(content, { resumable: true, contentType: 'text/plain' }), error => {
    assert.equal(error.response?.status, 403);
    assert.equal(error.response?.data.error.message, 'Object unavailable');
    assert.equal(new Headers(error.response?.headers).get('X-Provider-Error'), 'retained');
    return true;
  });
  assert.equal(tokenRequests, 3);
  const unrelated = await fetch(`${endpoint}/unrelated`, { signal: AbortSignal.timeout(1000) });
  assert.equal(unrelated.status, 200);
  await unrelated.json();
  assert.equal(requests.find(request => request.path === '/unrelated').authorization, undefined);
  storage.cleanup();
  assert.equal(global.fetch, originalFetch);
});
