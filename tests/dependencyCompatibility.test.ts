import { createHash, generateKeyPairSync, verify } from 'node:crypto';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { Account, Asset, BASE_FEE, Keypair, Networks, Operation, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';

const originalFetch = global.fetch;
const originalBigIntJson = Object.getOwnPropertyDescriptor(BigInt.prototype, 'toJSON');
const gaxios = require('gaxios') as typeof import('gaxios');
const originalGaxiosRequest = gaxios.instance.request;
const { FlashbackAuthClient, FlashbackGCSStorage } = require('../src/gcs') as typeof import('../src/gcs');
const { createPrivateKeySigner } = require('../src/stellarv2') as typeof import('../src/stellarv2');

describe('dependency compatibility without provider access', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const credentials = {
    client_email: 'offline@example.test',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  };
  let server: Server | undefined;

  afterEach(async () => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
    gaxios.instance.request = originalGaxiosRequest;
    const openServer = server;
    server = undefined;
    if (openServer?.listening) {
      await new Promise<void>((resolve, reject) => openServer.close(error => error ? reject(error) : resolve()));
    }
  });

  afterAll(() => {
    if (originalBigIntJson) Object.defineProperty(BigInt.prototype, 'toJSON', originalBigIntJson);
    else Reflect.deleteProperty(BigInt.prototype, 'toJSON');
  });

  it('exchanges a signed GCS assertion, caches its token and refreshes it after expiry', async () => {
    const requests: Array<{ method?: string; path?: string; contentType?: string; body: string }> = [];
    server = createServer((request, response) => {
      let body = '';
      request.on('data', chunk => body += chunk);
      request.on('end', () => {
        requests.push({ method: request.method, path: request.url, contentType: request.headers['content-type'], body });
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ access_token: `offline-token-${requests.length}`, expires_in: 60, token_type: 'Bearer' }));
      });
    });
    await new Promise<void>((resolve, reject) => {
      server!.once('error', reject);
      server!.listen(0, '127.0.0.1', resolve);
    });
    const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/token`;
    const auth = new FlashbackAuthClient(endpoint, credentials, ['READ', 'WRITE']);

    expect(await auth.getAccessToken()).toMatchObject({ token: 'offline-token-1' });
    expect(await auth.getRequestHeaders()).toEqual({ Authorization: 'Bearer offline-token-1' });
    expect(await auth.authorizeRequest({ headers: { 'X-Request': 'kept' } })).toMatchObject({
      headers: { 'X-Request': 'kept', Authorization: 'Bearer offline-token-1' },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ method: 'POST', path: '/token', contentType: 'application/x-www-form-urlencoded' });
    const form = new URLSearchParams(requests[0].body);
    expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const [header, payload, signature] = form.get('assertion')!.split('.');
    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    expect(claims).toMatchObject({ iss: credentials.client_email, sub: credentials.client_email, aud: 'https://oauth2.googleapis.com/token', scope: 'READ WRITE' });
    expect(claims.exp - claims.iat).toBe(3600);
    expect(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, 'base64url'))).toBe(true);

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 61_000);
    expect(await auth.getAccessToken()).toMatchObject({ token: 'offline-token-2' });
    expect(requests).toHaveLength(2);
  });

  it('loads the GCS export and produces a verifiable signed URL using an ephemeral key', async () => {
    const storage = new FlashbackGCSStorage({ credentials, projectId: 'offline', apiEndpoint: 'https://storage.example.test/' });
    try {
      const options = {
        version: 'v4' as const, action: 'write' as const, expires: Date.now() + 60_000,
        contentType: 'text/plain', file: storage.bucket('compatibility').file('asset.txt'),
      };
      const [signedUrl] = await storage.getSignedUrl(options);
      const url = new URL(signedUrl);
      expect(url.origin).toBe('https://storage.example.test');
      expect(url.pathname).toBe('/compatibility/asset.txt');
      expect(url.searchParams.get('X-Goog-SignedHeaders')).toBe('content-type;host');
      expect(Number(url.searchParams.get('X-Goog-Expires'))).toBeGreaterThan(0);
      expect(Number(url.searchParams.get('X-Goog-Expires'))).toBeLessThanOrEqual(60);
      const credential = url.searchParams.get('X-Goog-Credential')!;
      expect(credential.startsWith(`${credentials.client_email}/`)).toBe(true);
      const canonicalQuery = url.search.slice(1).split('&').filter(part => !part.startsWith('X-Goog-Signature=')).join('&');
      const canonicalRequest = ['PUT', url.pathname, canonicalQuery, 'content-type:text/plain\nhost:storage.example.test\n', 'content-type;host', 'UNSIGNED-PAYLOAD'].join('\n');
      const stringToSign = ['GOOG4-RSA-SHA256', url.searchParams.get('X-Goog-Date'), credential.slice(credentials.client_email.length + 1), createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
      expect(verify('RSA-SHA256', Buffer.from(stringToSign), publicKey, Buffer.from(url.searchParams.get('X-Goog-Signature')!, 'hex'))).toBe(true);
      await expect(storage.getSignedUrl({ ...options, expires: Date.now() + 8 * 24 * 60 * 60 * 1000 })).rejects.toThrow('Max allowed expiration is seven days');
    } finally {
      storage.cleanup();
    }
  });

  it('signs and decodes a Stellar transaction through the exported signer without submitting it', async () => {
    const source = Keypair.random();
    const destination = Keypair.random().publicKey();
    const unsigned = new TransactionBuilder(new Account(source.publicKey(), '1'), { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.payment({ destination, asset: Asset.native(), amount: '1' }))
      .setTimeout(30)
      .build();
    const signedXdr = await createPrivateKeySigner(source.secret(), Networks.TESTNET)(unsigned.toXDR());
    const decoded = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    expect(decoded).toBeInstanceOf(Transaction);
    const transaction = decoded as Transaction;
    expect(transaction.source).toBe(source.publicKey());
    expect(transaction.operations).toEqual(unsigned.operations);
    expect(transaction.hash().equals(unsigned.hash())).toBe(true);
    expect(transaction.signatures).toHaveLength(1);
    expect(source.verify(transaction.hash(), transaction.signatures[0].signature())).toBe(true);
  });
});
