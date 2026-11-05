import { ApiClient } from '../src/api/client';
import { ProviderType } from '../src/api/interfaces';

describe('OAuth registration API', () => {
  const fetchMock = jest.fn();
  const client = new ApiClient('https://example.test');

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ success: true, status: 'verification_required' }) });
  });

  it('requires a nonce and sends it with the provider exchange', async () => {
    await expect(client.exchangeCode('code', ProviderType.GOOGLE)).rejects.toThrow('OAuth nonce is required');
    expect(fetchMock).not.toHaveBeenCalled();
    await client.exchangeCode('code', ProviderType.GOOGLE, 'uid', 'invite', 'nonce');
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/auth/google/exchange', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ code: 'code', nonce: 'nonce', activationUid: 'uid', activationToken: 'invite' }),
    }));
  });

  it('submits the mailbox and browser proof without logging credentials', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    client.setDebug(true);
    client.setAuthToken('private-access-token');
    await client.verifyOAuthChallenge({ challengeId: 'id', token: 'mail-secret', browserSecret: 'browser-secret' });
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/auth/oauth/verify', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ challengeId: 'id', token: 'mail-secret', browserSecret: 'browser-secret' }),
    }));
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/mail-secret|browser-secret|private-access-token/);
    client.setDebug(false);
    log.mockRestore();
  });

  it('registers a completed first-party OAuth session with its provider', async () => {
    await client.registerOAuthDevice('first-party-token', {
      provider: ProviderType.MICROSOFT,
      deviceInfo: { userAgent: 'test-agent', deviceType: 'DESKTOP', os: 'Test OS', browser: 'Test Browser' },
    });
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/auth/oauth/device', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer first-party-token' }),
      body: JSON.stringify({ provider: 'MICROSOFT', deviceInfo: { userAgent: 'test-agent', deviceType: 'DESKTOP', os: 'Test OS', browser: 'Test Browser' } }),
    }));
  });
});
