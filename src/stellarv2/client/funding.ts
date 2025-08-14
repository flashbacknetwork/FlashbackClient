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
  testFaucetOwner = withSignature(
    async (receiver: string, amount: bigint): Promise<void> => {
      await executeWalletTransaction(this.context, '', "test_faucet_owner", [
        { value: receiver, type: 'address' },
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
   * Gets the stable asset address from the contract
   * @returns Promise resolving to the stable asset contract address
   */
  async getStableAssetAddress(): Promise<string> {
    // This would typically be a getter method, but since it's not in the FundingOps trait,
    // we'll need to implement it separately or access it through the main contract
    throw new Error('getStableAssetAddress not implemented in FundingOps - use main contract methods');
  }

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