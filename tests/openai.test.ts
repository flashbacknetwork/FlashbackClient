
/* eslint-disable no-undef */
import { describe, jest, test, expect } from '@jest/globals';
import OpenAI from 'openai';

describe('OpenAI Chat Completions Test', () => {
  jest.setTimeout(300000);

  test('should call chat completions API with generated credentials', async () => {
    // Generate API key/secret pair
    //const apiKey = 'sk-vi_igsCNRun6WIGbLudGt_h3Te6YzeH3nIEyndSwI1YAAAAA';  // local
    const apiKey = 'sk-wPHuxJekvOS7vFuQGDWl7o5QkkbgyHgcic47XOpQzHIAAAAA';   // test
    //const apiKey = 'sk-k5q_fQqUz-0tRm8Z1VgoEszM3Oh2Wp3J3TLZzmhA_fUAAAAA';  // prod
    
    // Create OpenAI client with localhost base URL
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://ai-us-east-1-gcp.flashback.tech/v1/',
      //baseURL: 'http://localhost:3010/v1/',
    });

    try {
      // Make chat completions request
      const models = await openai.models.list();
      console.log('Models:', models);
      const modelList = ['gpt-4o-mini', 'claude-sonnet-4-20250514', 'gemini-2.5-flash'
        //, 'mistral.mistral-large-2402-v1'];
      ];
      for (const model of modelList) {
        const response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Our worker John Carter is asking for a raise. Please help me draft a short letter to the CEO of the company as mandated by the organization\'s policies.'
            }
          ],
          temperature: 0.5,
          store: true,
          max_tokens: 4000,
          metadata: {
            workspace_id: 'wks_1234567890',
            user_id: 'usr_1234567890',
            conversation_id: 'conv_1234567890',
          },
        });
        console.log('\n✅ Chat Completions Request successful!', response._request_id);
        expect(response).toBeDefined(); 
        //expect(response.choices[0].message.content).toContain('Hello, world!');
      }

    } catch (error: any) {
      console.log('\n❌ Chat Completions Request failed:');
      console.log('==================================');
      
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Status Text: ${error.response.statusText}`);
        console.log(`Headers:`, error.response.headers);
        console.log(`Data:`, error.response.data);
      } else if (error.request) {
        console.log('Request made but no response received:');
        console.log(error.request);
      } else {
        console.log('Error setting up request:');
        console.log(error.message);
      }
      
      // Log the headers that were sent
      console.log('\n📋 Headers that were sent:');
      console.log('==========================');
      console.log(`Authorization: Bearer ${apiKey}`);
      console.log(`Content-Type: application/json`);
      console.log(`User-Agent: openai-node/${require('openai/package.json').version}`);
      
      // Re-throw the error so the test fails
      throw error;
    }
  });
/*
  test('should call models API with generated credentials', async () => {
    const apiKey = 'sk-5751ead0784dbe18621b7401ebab87b4c5de1a604f13ecb32efc8d4f2e6e9fd0';

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'http://localhost:3010/v1/',
    });

    try {
      // Make models request
      const response = await openai.models.list();

      console.log('\n✅ Models Request successful!');
      console.log('Response:', JSON.stringify(response, null, 2));
      
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

    } catch (error: any) {
      console.log('\n❌ Models Request failed:');
      console.log('========================');
      
      // Re-throw the error so the test fails
      throw error;
    }
  });
*/
/*
  test('should call embeddings API with generated credentials', async () => {
    const apiKey = 'sk-5751ead0784dbe18621b7401ebab87b4c5de1a604f13ecb32efc8d4f2e6e9fd0';

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'http://localhost:3010/v1/',
    });

    try {
      // Make embeddings request
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: 'This is a test text for embedding generation.'
      });

      console.log('\n✅ Embeddings Request successful!');
      console.log('Response:', JSON.stringify(response, null, 2));
      
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0].embedding).toBeDefined();

    } catch (error: any) {
      console.log('\n❌ Embeddings Request failed:');
      console.log('============================');
    
      // Re-throw the error so the test fails
      throw error;
    }
  });
*/
});
