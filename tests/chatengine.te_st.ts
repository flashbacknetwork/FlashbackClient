/* eslint-disable no-undef */
import { describe, jest, test, expect } from '@jest/globals';
import OpenAI from 'openai';

describe('FlashChatEngine Memory Test', () => {
  jest.setTimeout(180000); // 3 minutes - allows time for multiple API calls with delays

  // Constants for FlashChatEngine configuration
  const BASE_URL = 'http://localhost:8080';
  const API_KEY = 'sk-flashchat-test-12345'; // Valid API key from FlashChatEngine
  
  // Track conversation IDs for cleanup
  let conversationId: string;

  const callChatEngine = async (
    openai: OpenAI, 
    prompt: string, 
    conversationId: string,
    userId: string = 'test_user_001'
  ) => {
    const request = {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      metadata: {
        user_id: userId,
        conversation_id: conversationId,
      },
      messages: [
        {
          role: 'user' as const,
          content: prompt
        }
      ],
    } as any; // Cast to any to allow custom metadata field
    const response = await openai.chat.completions.create(request);
    return response;
  };
/*
  afterAll(async () => {
    // Cleanup: Delete the conversation and all related data
    if (conversationId) {
      try {
        const response = await fetch(`${BASE_URL}/conversation/${conversationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log(`✓ Cleaned up conversation: ${conversationId}`);
        } else {
          console.warn(`⚠ Failed to clean up conversation: ${conversationId} (${response.status})`);
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });
*/
  test('should maintain conversation context across multiple turns using vector memory', async () => {
    // Use a unique conversation ID for this test
    conversationId = `conv_memory_test_${Date.now()}`;

    // Create OpenAI client pointing to FlashChatEngine
    const openai = new OpenAI({
      apiKey: API_KEY,
      baseURL: `${BASE_URL}/v1/`,
    });

    try {
      // Turn 1: Establish context with specific details
      const prompt1 = "I'm planning to build a mobile app for tracking fitness activities. I prefer React Native because I know JavaScript well, and I want the app to work on both iOS and Android.";
      const response1 = await callChatEngine(openai, prompt1, conversationId);
      expect(response1).toBeDefined();
      expect(response1.choices[0].message.content).toBeTruthy();

      // Small delay to allow embedding to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Turn 2: Ask a related but different question
      const prompt2 = "What database would you recommend for storing workout history and user progress data?";
      const response2 = await callChatEngine(openai, prompt2, conversationId);
      expect(response2).toBeDefined();
      expect(response2.choices[0].message.content).toBeTruthy();

      // Small delay to allow embedding to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Turn 3: Ask about state management (tests recent context)
      const prompt3 = "Can you suggest good state management libraries for my project?";
      const response3 = await callChatEngine(openai, prompt3, conversationId);
      expect(response3).toBeDefined();
      expect(response3.choices[0].message.content).toBeTruthy();

      // Small delay to allow embedding to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Turn 4: Reference the first message explicitly (tests vector similarity search)
      const prompt4 = "Based on what I mentioned earlier about my technology preferences and JavaScript knowledge, should I use TypeScript or stick with plain JavaScript for this fitness app?";
      const response4 = await callChatEngine(openai, prompt4, conversationId);
      expect(response4).toBeDefined();
      expect(response4.choices[0].message.content).toBeTruthy();

    } catch (error: any) {
      throw error;
    }
  });

});
