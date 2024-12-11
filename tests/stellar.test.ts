/* eslint-disable no-undef */
import { FlashOnStellarClient } from '../src/stellar';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import { getNetwork } from '../src/stellar/transaction';

dotenv.config(); // loads the .env file

const privateKey = process.env.TEST_PRIVATE_KEY || '';
const contractAddress = process.env.TEST_CONTRACT_ADDRESS || '';
const network = process.env.TEST_NETWORK || '';

describe('FlashOnStellarClient', () => {
  let publicKey: string;
  let client: FlashOnStellarClient;

  jest.setTimeout(10000);

  // Real signing function
  const signTransactionTest = async (xdrToSign: string): Promise<string> => {
    const signedTransaction = await client.signTransactionWithKey(xdrToSign, privateKey);
    return Promise.resolve(signedTransaction);
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a new client instance for each test
    client = new FlashOnStellarClient({
      contractAddress: contractAddress,
      signTransaction: signTransactionTest,
      network: getNetwork(network),
    });
    publicKey = client.getPublicKey(privateKey);
  });

  describe('Provider methods', () => {
    // Test structure for provider-related methods
    test('get_provider should return null because the provider is not registered yet', async () => {
      const provider = await client.get_provider(publicKey, publicKey);
      expect(provider).toBeNull();
    });

    test('register_provider + get_provider should return the provider data', async () => {
      await client.register_provider(publicKey, publicKey, 'test provider');
      const provider = await client.get_provider(publicKey, publicKey);
      expect(provider).toBeDefined();
      expect(provider!.description).toBe('test provider');
    });
  });

  describe('Unit methods', () => {
    // Test structure for unit-related methods
  });

  describe('Consumer methods', () => {
    // Test structure for consumer-related methods
    test('get_consumer should fetch consumer data correctly', async () => {
      const consumer = await client.get_consumer(publicKey, publicKey);
      expect(consumer).toBeNull();
    });

    test('register_consumer + get_consumer should return the consumer data', async () => {
      await client.register_consumer(publicKey, publicKey, 'test consumer');
      const consumer = await client.get_consumer(publicKey, publicKey);
      expect(consumer).toBeDefined();
      expect(consumer!.description).toBe('test consumer');
    });
  });

  describe('Reservation methods', () => {
    // Test structure for reservation-related methods
  });

  describe('Stats methods', () => {
    /*
    test('get_stats should return values of current test data', async () => {
      const stats = await client.get_stats(publicKey);
      expect(stats).toBeDefined();
      expect(stats!.total_capacity_gb).toBe(0);
      expect(stats!.total_reserved_gb).toBe(0);
      expect(stats!.total_inuse_bytes_consumer).toBe(0);
      expect(stats!.total_inuse_bytes_provider).toBe(0);
      expect(stats!.total_maintenance_gb).toBe(0);
      expect(stats!.total_decommissioning_gb).toBe(0);
    });
	*/
  });

  describe('Cleanup methods', () => {
    // Test structure for cleanup-related methods
    test('delete_provider + get_provider should return null', async () => {
      await client.delete_provider(publicKey, publicKey);
      const provider = await client.get_provider(publicKey, publicKey);
      expect(provider).toBeNull();
    });

    test('delete_consumer + get_consumer should return null', async () => {
      await client.delete_consumer(publicKey, publicKey);
      const consumer = await client.get_consumer(publicKey, publicKey);
      expect(consumer).toBeNull();
    });
    /*
    test('get_stats should return values of current test data', async () => {
      const stats = await client.get_stats(publicKey);
      expect(stats).toBeDefined();
      expect(stats!.total_capacity_gb).toBe(0);
      expect(stats!.total_reserved_gb).toBe(0);
      expect(stats!.total_inuse_bytes_consumer).toBe(0);
      expect(stats!.total_inuse_bytes_provider).toBe(0);
      expect(stats!.total_maintenance_gb).toBe(0);
      expect(stats!.total_decommissioning_gb).toBe(0);
    });
	*/
  });

  // Additional test groups for Unit and Reservation methods...
});
