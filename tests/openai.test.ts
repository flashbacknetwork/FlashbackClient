import { describe, jest, test, expect } from '@jest/globals';
import OpenAI from 'openai';

const apiKey = process.env.FLASHBACK_OPENAI_TEST_API_KEY;
const baseURL = process.env.FLASHBACK_OPENAI_TEST_BASE_URL;
const describeLive = apiKey && baseURL ? describe : describe.skip;

describeLive('OpenAI Chat Completions integration', () => {
  jest.setTimeout(300000);

  test('lists models and calls chat completions with configured credentials', async () => {
    const client = new OpenAI({ apiKey, baseURL });
    const modelNames = (process.env.FLASHBACK_OPENAI_TEST_MODELS || 'gpt-4o-mini,claude-sonnet-4-20250514,gemini-2.5-flash')
      .split(',').map(name => name.trim()).filter(Boolean);
    expect(modelNames.length).toBeGreaterThan(0);

    try {
      const models = await client.models.list();
      expect(Array.isArray(models.data)).toBe(true);

      for (const model of modelNames) {
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'Write a short greeting.' }],
          temperature: 0.5,
          store: true,
          max_tokens: 4000,
          metadata: {
            workspace_id: 'wks_1234567890',
            user_id: 'usr_1234567890',
            conversation_id: 'conv_1234567890',
          },
        });
        expect(response.choices.length).toBeGreaterThan(0);
      }
    } catch (error) {
      const status = error instanceof OpenAI.APIError ? error.status : undefined;
      // SDK error objects may contain request details; keep credentials out of test output.
      throw new Error(`OpenAI integration request failed${status ? ` (HTTP ${status})` : ''}`);
    }
  });
});
