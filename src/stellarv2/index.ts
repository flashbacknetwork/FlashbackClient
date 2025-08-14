import { StellarNetwork } from './wallet/transaction';
import { FlashOnStellarClientV2, FlashOnStellarClientConfigV2 } from './client';

// Export operation classes
export { ConsumerOps } from './client/consumer';
export { ProviderOps } from './client/provider';
export { BucketOps } from './client/bucket';
export { DealOps } from './client/deal';
export { FundingOps } from './client/funding';

// Export models and types
export * from './models';

// Export main client and configuration
export { StellarNetwork, FlashOnStellarClientV2, FlashOnStellarClientConfigV2 };
