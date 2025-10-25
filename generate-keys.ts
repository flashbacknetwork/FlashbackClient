#!/usr/bin/env ts-node

import { generateOpenAICompatibleKeys } from './src/api';

/**
 * Command line script to generate OpenAI-compatible API key/secret pairs
 * Usage: npx ts-node tests/generate-keys.ts
 */
function main() {
  console.log('🔑 Generating OpenAI-compatible API key/secret pair...\n');
  
  const { apiKey, secretKey } = generateOpenAICompatibleKeys();
  
  console.log('Generated credentials:');
  console.log('====================');
  console.log(`API Key: ${apiKey}`);
  console.log(`Secret Key: ${secretKey}`);
  console.log('\n📋 Copy these values to use in your test script!');
  console.log('\nExample usage in test script:');
  console.log(`const API_KEY = '${apiKey}';`);
  console.log(`const SECRET_KEY = '${secretKey}';`);
}

if (require.main === module) {
  main();
}
