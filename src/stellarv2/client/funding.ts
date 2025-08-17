import { ClientContext } from '.';
import { executeWalletTransaction, prepareTransaction } from '../wallet/transaction';
import { withSignature } from '../utils/decorator';

/**
 * Funding operations client for FlashOnStellar V2
 * Implements all funding-related contract methods (owner only)
 */
export class FundingOps {
  private context: ClientContext;

  constructor(context: ClientContext) {
    this.context = context;
  }

  async getStableAssetName(wallet_address: string): Promise<string> {
    const response = await prepareTransaction(this.context, wallet_address, {
      method: 'get_stable_asset_name',
      args: []
    });
    if (response.isSuccess) {
      return response.result as string;
    }
    return '';  
  }

  async getStableAssetAddress(wallet_address: string): Promise<string> {
    const response = await prepareTransaction(this.context, wallet_address, {
      method: 'get_stable_asset_address',
      args: []
    });
    if (response.isSuccess) {
      return response.result as string;
    }
    return '';  
  }

  /**
   * Sends funds from the contract to a receiver (owner only)
   * @param receiver - Address of the receiver
   * @param amount - Amount to send in the stable asset's smallest unit
   * @returns Promise resolving to the transfer result
   */
  sendFundsOwner = withSignature(
    async (receiver: string, amount: bigint): Promise<void> => {
      await executeWalletTransaction(this.context, '', "send_funds_owner", [
        { value: receiver, type: 'address' },
        { value: amount, type: 'i128' }
      ]);
    }
  );

  /**
   * Test faucet function for minting tokens to a receiver (owner only)
   * @param receiver - Address of the receiver
   * @param amount - Amount to mint in the stable asset's smallest unit
   * @returns Promise resolving to the minting result
   */
  testFaucet = withSignature(
    async (receiver: string, amount: bigint): Promise<void> => {
        await executeWalletTransaction(this.context, receiver, "test_faucet", [
          { value: amount, type: 'i128' }
        ]);
      }
    );

  /**
   * Changes the admin of the stable asset contract (owner only)
   * @param new_admin - Address of the new admin
   * @returns Promise resolving to the admin change result
   */
  changeAssetAdmin = withSignature(
    async (new_admin: string): Promise<void> => {
      await executeWalletTransaction(this.context, '', "change_asset_admin", [
        { value: new_admin, type: 'address' }
      ]);
    }
  );

  /**
   * Checks if an address is authorized for the stable asset
   * @param address - Address to check
   * @returns Promise resolving to true if authorized, false otherwise
   */
  async isAuthorizedForAsset(address: string): Promise<boolean> {
    // This would typically be a getter method on the stable asset contract
    // Implementation depends on the specific stable asset contract interface
    throw new Error('isAuthorizedForAsset not implemented - requires stable asset contract interaction');
  }

  /**
   * Gets the balance of an address for the stable asset
   * @param address - Address to check balance for
   * @returns Promise resolving to the balance amount
   */
  async getAssetBalance(address: string): Promise<bigint> {
    // This would typically be a getter method on the stable asset contract
    // Implementation depends on the specific stable asset contract interaction
    throw new Error('getAssetBalance not implemented - requires stable asset contract interaction');
  }
} 