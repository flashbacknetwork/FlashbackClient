use crate::types::{DataKey, Deal, DealStatus, Provider, Consumer, generate_deal_uid};
use crate::validate::{assert_initialized, owner_or_panic};
use crate::implementation::bucket::internal_get_bucket;
use crate::ContractClient;
use soroban_sdk::token;
use soroban_sdk::{contractimpl, Address, Env, Vec, Map, String, log};
use crate::ContractArgs;
use crate::implementation::ProviderOps;
use crate::implementation::ConsumerOps;
use crate::implementation::BucketOps;

#[allow(dead_code)]
pub trait DealOps {
    fn create_deal(
        env: Env,
        consumer_id: Address,
        provider_id: Address,
        bucket_id: u32,
        duration_secs: u64,
        agreed_storage_gb: u32,
        agreed_egress_gb: u32,
        fb_repo_id: String,
        api_compatibility: String
    ) -> u32;
    fn set_deal_accepted(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> bool;
    fn set_deal_funded(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32, amount_usd: u128) -> bool;
    fn set_deal_completed(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool;
    fn set_deal_cancelled(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool;
    fn set_deal_breached_consumer(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool;
    fn set_deal_breached_provider(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool;
    fn delete_deal(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> bool;
    fn get_deal(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> Option<Deal>;
    fn get_deal_count(env: Env) -> u32;
    fn get_deals(env: Env, skip: u32, take: u32) -> Vec<Deal>;
    fn get_deals_by_consumer(env: Env, consumer_id: Address) -> Vec<Deal>;
    fn get_deals_by_provider(env: Env, provider_id: Address) -> Vec<Deal>;
    fn get_active_deals(env: Env, skip: u32, take: u32) -> Vec<Deal>;
    fn pay_pending_consumption(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool;
    fn update_deal_consumption(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32, storage_gb: u32, egress_gb: u32) -> bool;
    fn update_deal_sla(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32, sla_avg_latency_ms: u32, sla_avg_uptime_pct: u32) -> bool;
}

#[contractimpl]
impl DealOps for super::super::Contract {
    fn create_deal(
        env: Env,
        consumer_id: Address,
        provider_id: Address,
        bucket_id: u32,
        duration_secs: u64,
        agreed_storage_gb: u32,
        agreed_egress_gb: u32,
        fb_repo_id: String,
        api_compatibility: String
    ) -> u32 {
        log!(&env, "create_deal: Starting deal creation for consumer: {}, provider: {}, bucket: {}", consumer_id, provider_id, bucket_id);
        assert_initialized(&env);
        consumer_id.require_auth();

        // Generate unique deal ID using timestamp and sequence
        let (deal_key, deal_id) = generate_deal_uid(&env, &consumer_id, &provider_id);
        log!(&env, "create_deal: Generated deal ID: {}, key: {:?}", deal_id, deal_key);

        // Check if deal already exists (very unlikely but good practice)
        if internal_get_deal(env.clone(), deal_key.clone()).is_some() {
            log!(&env, "create_deal: Deal already exists with key: {:?}", deal_key);
            panic!("Deal already exists");
        }

        log!(&env, "create_deal: Creating new deal with ID: {}", deal_id);

        // Create deal
        let deal = Deal {
            deal_id: deal_id,
            consumer_id: consumer_id.clone(),
            provider_id: provider_id.clone(),
            bucket_id,
            fb_repo_id: fb_repo_id.clone(),
            api_compatibility: api_compatibility.clone(),
            start_ts: env.ledger().timestamp(),
            duration_secs,
            agreed_storage_gb,
            agreed_egress_gb,
            unpaid_storage_gb: 0,
            unpaid_egress_gb: 0,
            paid_storage_gb: 0,
            paid_egress_gb: 0,
            balance_consumer: 0,
            balance_provider: 0,
            sla_avg_latency_ms: 0,
            sla_avg_uptime_pct: 9990,
            slash_amount_usd: 0,
            slash_storage_gb: 0,
            slash_egress_gb: 0,
            status: DealStatus::Pending,
        };

        // Store deal
        env.storage().persistent().set(&deal_key, &deal);
        log!(&env, "create_deal: Deal stored successfully with key: {:?}", deal_key);

        // Add deal to provider's deals list
        let provider_id_clone = provider_id.clone();
        let mut provider = Self::get_provider(env.clone(), provider_id_clone.clone()).unwrap();
        provider.deals.set(deal_key.clone(), 0);
        env.storage().persistent().set(&DataKey::Provider(provider_id_clone), &provider);
        log!(&env, "create_deal: Added deal to provider's deal list: {}", provider_id);

        // add to deal map
        let mut deal_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::DealMap).unwrap_or_else(|| Map::new(&env));
        deal_map.set(deal_key.clone(), deal_id);
        env.storage().persistent().set(&DataKey::DealMap, &deal_map);

        // Add deal to consumer's deals list
        let consumer_id_clone = consumer_id.clone();
        let mut consumer = Self::get_consumer(env.clone(), consumer_id_clone.clone()).unwrap();
        consumer.deals.set(deal_key.clone(), 0);
        env.storage().persistent().set(&DataKey::Consumer(consumer_id_clone), &consumer);
        log!(&env, "create_deal: Added deal to consumer's deal list: {}", consumer_id);

        // Lock the bucket to prevent modifications while deal is active
        let bucket_key = DataKey::Bucket(provider_id.clone(), bucket_id);
        let mut bucket = Self::get_bucket(env.clone(), provider_id.clone(), bucket_id).unwrap();
        bucket.locked = true;
        env.storage().persistent().set(&bucket_key, &bucket);
        log!(&env, "create_deal: Bucket {} locked for deal {}", bucket_id, deal_id);

        deal_id
    }

    fn set_deal_accepted(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> bool {
        log!(&env, "set_deal_accepted: Setting deal {} accepted for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        log!(&env, "set_deal_accepted: Using deal key: {:?}", deal_key);
        
        internal_update_deal_status(env, deal_key, DealStatus::Accepted)
    }

    fn set_deal_funded(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32, amount_usd: u128) -> bool {
        log!(&env, "set_deal_funded: Funding deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        assert_initialized(&env);
        consumer_id.require_auth();
        
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);

        let asset_contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
        let user_token_client = token::Client::new(&env, &asset_contract_id);
    
        let src_amount = user_token_client.balance(&consumer_id);

        if src_amount < amount_usd as i128 {
            log!(&env, "set_deal_funded: Insufficient balance for consumer: {}, provider: {}, deal: {}", consumer_id, provider_id, deal_id);
            return false;
        }

        user_token_client.transfer(&consumer_id, &env.current_contract_address(), &(amount_usd as i128));

        // Add deal to provider's active deals list
        let mut provider = Self::get_provider(env.clone(), provider_id.clone()).unwrap();
        provider.active_deals.set(deal_key.clone(), 0);
        env.storage().persistent().set(&DataKey::Provider(provider_id), &provider);
        log!(&env, "set_deal_funded: Added deal to provider's active deals list");

        // Add deal to consumer's active deals list
        let consumer_id_clone = consumer_id.clone();
        let mut consumer = Self::get_consumer(env.clone(), consumer_id_clone.clone()).unwrap();
        consumer.active_deals.set(deal_key.clone(), 0);
        env.storage().persistent().set(&DataKey::Consumer(consumer_id_clone), &consumer);   
        log!(&env, "set_deal_funded: Added deal to consumer's active deals list");

        // add to active deal map
        let mut active_deal_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::ActiveDealMap).unwrap_or_else(|| Map::new(&env));
        active_deal_map.set(deal_key.clone(), deal_id);
        env.storage().persistent().set(&DataKey::ActiveDealMap, &active_deal_map);
        
        let mut deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        deal.status = DealStatus::Funded;
        deal.balance_consumer = amount_usd;
        deal.balance_provider = 0;
        env.storage().persistent().set(&deal_key, &deal);
        log!(&env, "set_deal_funded: Deal funded successfully");
        
        true
    }

    fn pay_pending_consumption(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        log!(&env, "pay_pending_consumption: Paying deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        let mut deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        let bucket = Self::get_bucket(env.clone(), provider_id.clone(), deal.bucket_id).unwrap();
        
        let mut amount_to_pay: u128 = bucket.price_per_gb_storage.checked_mul(deal.unpaid_storage_gb as u128).unwrap() 
            + bucket.price_per_gb_egress.checked_mul(deal.unpaid_egress_gb as u128).unwrap();

        if amount_to_pay == 0 {
            log!(&env, "pay_pending_consumption: No pending consumption to pay for deal: {}, consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
            return true;
        }

        if deal.balance_consumer == 0 {
            log!(&env, "pay_pending_consumption: No balance to pay for deal: {}, consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
            return false;
        }

        // if sla's are below bucket's specification, slash the provider
        if deal.sla_avg_latency_ms > bucket.sla_avg_latency_ms || deal.sla_avg_uptime_pct < bucket.sla_avg_uptime_pct {
            log!(&env, "pay_pending_consumption: SLA breach for deal: {}, consumer: {}, provider: {}", deal_id, consumer_id, provider_id);

            deal.slash_amount_usd = amount_to_pay;
            deal.slash_egress_gb += deal.unpaid_egress_gb;
            deal.slash_storage_gb += deal.unpaid_storage_gb;
            deal.unpaid_storage_gb = 0;
            deal.unpaid_egress_gb = 0;
            deal.status = DealStatus::BreachedProvider;
            env.storage().persistent().set(&deal_key, &deal);
            log!(&env, "pay_pending_consumption: SLA breach for deal: {}, consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
            return false;
        }
        else {
            deal.status = DealStatus::Funded;
        }

        let success = true;

        if deal.balance_consumer < amount_to_pay {
            log!(&env, "pay_deal_funds: Insufficient balance for consumer: {}, provider: {}, deal: {}", consumer_id, provider_id, deal_id);
            // calculate new unpaid quantities in proportion of the amount paid
            let original_unpaid_storage_gb = deal.unpaid_storage_gb;
            let original_unpaid_egress_gb = deal.unpaid_egress_gb;

            // Use checked arithmetic to prevent overflow/underflow
            let storage_calculation = match (original_unpaid_storage_gb as u128)
                .checked_mul(deal.balance_consumer as u128)
                .and_then(|result| result.checked_div(amount_to_pay as u128))
            {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic overflow in storage calculation");
                    return false;
                }
            };
            
            let egress_calculation = match (original_unpaid_egress_gb as u128)
                .checked_mul(deal.balance_consumer as u128)
                .and_then(|result| result.checked_div(amount_to_pay as u128))
            {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic overflow in egress calculation");
                    return false;
                }
            };

            // Check if the calculated values fit within u32 range before casting
            if storage_calculation > u32::MAX as u128 {
                log!(&env, "pay_deal_funds: Storage calculation result too large for u32");
                return false;
            }
            if egress_calculation > u32::MAX as u128 {
                log!(&env, "pay_deal_funds: Egress calculation result too large for u32");
                return false;
            }
            
            deal.unpaid_storage_gb = storage_calculation as u32;
            deal.unpaid_egress_gb = egress_calculation as u32;

            deal.paid_storage_gb = match original_unpaid_storage_gb
                .checked_sub(deal.unpaid_storage_gb)
            {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic underflow in paid storage calculation");
                    return false;
                }
            };
            
            deal.paid_egress_gb = match original_unpaid_egress_gb
                .checked_sub(deal.unpaid_egress_gb)
            {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic underflow in paid egress calculation");
                    return false;
                }
            };

            amount_to_pay = deal.balance_consumer;
            deal.status = DealStatus::BreachedConsumer;
            // Partial payment is still successful - return true
        }
        else {  // paid in full
            deal.paid_storage_gb = match deal.paid_storage_gb.checked_add(deal.unpaid_storage_gb) {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic underflow in paid storage calculation");
                    return false;
                }
            };
            deal.paid_egress_gb = match deal.paid_egress_gb.checked_add(deal.unpaid_egress_gb) {
                Some(result) => result,
                None => {
                    log!(&env, "pay_deal_funds: Arithmetic underflow in paid egress calculation");
                    return false;
                }
            };
            deal.unpaid_storage_gb = 0;
            deal.unpaid_egress_gb = 0;
            
        }

        deal.balance_consumer = match deal.balance_consumer.checked_sub(amount_to_pay) {
            Some(result) => result,
            None => {
                log!(&env, "pay_deal_funds: Arithmetic underflow in balance consumer calculation");
                return false;
            }
        };
        
        deal.balance_provider = match deal.balance_provider.checked_add(amount_to_pay) {
            Some(result) => result,
            None => {
                log!(&env, "pay_deal_funds: Arithmetic overflow in balance provider calculation");
                return false;
            }
        };

        let asset_contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
        let user_token_client = token::Client::new(&env, &asset_contract_id);
        user_token_client.transfer(&env.current_contract_address(), &provider_id, &(amount_to_pay as i128));

        env.storage().persistent().set(&deal_key, &deal);
        log!(&env, "pay_pending_consumption: Payment processed successfully");
        success
    }

    fn set_deal_completed(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
        assert_initialized(&env);
        consumer_id.require_auth();

        log!(&env, "set_deal_completed: Completing deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        
        // Get the deal to find the bucket ID and validate status
        let deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        
        // Validate deal can be completed
        if deal.status != DealStatus::Funded && deal.status != DealStatus::BreachedProvider {
            log!(&env, "set_deal_completed: Deal {} cannot be completed from status {:?}", deal_id, deal.status);
            return false;
        }
        
        let bucket_id = deal.bucket_id;

        // pay pending consumption
        Self::pay_pending_consumption(env.clone(), provider_id.clone(), consumer_id.clone(), deal_id);

        // return the balance to the consumer if positive
        if deal.balance_consumer > 0 {
            let asset_contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
            let user_token_client = token::Client::new(&env, &asset_contract_id);
            user_token_client.transfer(&env.current_contract_address(), &consumer_id, &(deal.balance_consumer as i128));
            log!(&env, "set_deal_completed: Returned {} to consumer", deal.balance_consumer);
        }
        
        internal_delete_from_active_deals(env.clone(), provider_id.clone(), consumer_id, deal_id);
        internal_update_deal_status(env.clone(), deal_key, DealStatus::Completed);
        
        true
    }

    fn set_deal_cancelled(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
        assert_initialized(&env);
        provider_id.require_auth();

        log!(&env, "set_deal_cancelled: Cancelling deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);

        // Get the deal and validate it can be cancelled
        let deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        
        // only if breached by consumer
        if deal.status != DealStatus::BreachedConsumer {
            log!(&env, "set_deal_cancelled: Deal {} is not breached by consumer, cannot cancel", deal_id);
            return false;
        }
        
        let bucket_id = deal.bucket_id;
        
        // pay pending consumption
        Self::pay_pending_consumption(env.clone(), provider_id.clone(), consumer_id.clone(), deal_id);

        // return the balance to the consumer if positive
        if deal.balance_consumer > 0 {
            let asset_contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
            let user_token_client = token::Client::new(&env, &asset_contract_id);
            user_token_client.transfer(&env.current_contract_address(), &consumer_id, &(deal.balance_consumer as i128));
            log!(&env, "set_deal_cancelled: Returned {} to consumer", deal.balance_consumer);
        }
        
        internal_delete_from_active_deals(env.clone(), provider_id.clone(), consumer_id, deal_id);
        internal_update_deal_status(env.clone(), deal_key, DealStatus::Cancelled);
        
        true
    }

    fn set_deal_breached_consumer(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
        assert_initialized(&env);
        provider_id.require_auth(); // Only provider can mark consumer as breached

        log!(&env, "set_deal_breached_consumer: Marking deal {} as breached for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);

        internal_update_deal_status(env.clone(), deal_key, DealStatus::BreachedConsumer);
        
        true
    }

    fn set_deal_breached_provider(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
        assert_initialized(&env);
        consumer_id.require_auth(); // Only consumer can mark provider as breached

        log!(&env, "set_deal_breached_provider: Marking deal {} as breached for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);

        internal_update_deal_status(env.clone(), deal_key, DealStatus::BreachedProvider);
        
        true
    }

    fn delete_deal(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> bool {
        log!(&env, "delete_deal: Deleting deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        assert_initialized(&env);
        owner_or_panic(&env);

        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        log!(&env, "delete_deal: Using deal key: {:?}", deal_key);
        
        internal_delete_from_active_deals(env.clone(), provider_id.clone(), consumer_id.clone(), deal_id);

        env.storage().persistent().remove(&deal_key);
        log!(&env, "delete_deal: Deal deleted successfully: {}", deal_id);
        true
    }

    fn get_deal(env: Env, consumer_id: Address, provider_id: Address, deal_id: u32) -> Option<Deal> {
        log!(&env, "get_deal: Retrieving deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        log!(&env, "get_deal: Using deal key: {:?}", deal_key);
        
        let result = internal_get_deal(env.clone(), deal_key);
        match &result {
            Some(_deal) => log!(&env, "get_deal: Found deal: {}", deal_id),
            None => log!(&env, "get_deal: Deal not found: {}", deal_id),
        }
        
        result
    }

    fn get_deal_count(env: Env) -> u32 {
        log!(&env, "get_deal_count: Starting count retrieval");
        
        // Get the total count from the DealCount key that we maintain
        let total_count = env.storage().persistent().get(&DataKey::DealCount).unwrap_or(0u32);
        log!(&env, "get_deal_count: Retrieved deal count: {}", total_count);
        total_count
    }

    fn get_deals(env: Env, skip: u32, take: u32) -> Vec<Deal> {
        log!(&env, "get_deals: Starting retrieval, skip: {}, take: {}", skip, take);
        let mut result = Vec::new(&env);

        // Get the deal map from storage
        let deal_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::DealMap).unwrap_or_else(|| Map::new(&env));
        
        if deal_map.is_empty() {
            log!(&env, "get_deals: No deals found, returning empty vector");
            return result;
        }

        let mut count = 0u32;
        let mut skipped = 0u32;
        
        // Iterate through the deal map
        for (deal_key, _deal_id) in deal_map.iter() {
            // Skip deals until we reach the skip count
            if skipped < skip {
                skipped += 1;
                continue;
            }
            
            // Stop if we've reached the take limit
            if count >= take {
                break;
            }
            if let Some(deal) = internal_get_deal(env.clone(), deal_key.clone()) {
                result.push_back(deal);
                count += 1;
            }
        }
        
        log!(&env, "get_deals: Retrieved {} deals (skipped: {}, requested: {})", count, skip, take);
        result
    }

    fn get_deals_by_consumer(env: Env, consumer_id: Address) -> Vec<Deal> {
        log!(&env, "get_deals_by_consumer: Getting deals for consumer: {}", consumer_id);
        assert_initialized(&env);
        
        let consumer = Self::get_consumer(env.clone(), consumer_id.clone()).unwrap();
        let mut deals = Vec::new(&env);
        
        for (deal_key, _) in consumer.deals.iter() {
            if let Some(deal) = internal_get_deal(env.clone(), deal_key) {
                deals.push_back(deal);
            }
        }
        log!(&env, "get_deals_by_consumer: Retrieved {} deals for consumer: {}", deals.len(), consumer_id);
        deals
    }

    fn get_deals_by_provider(env: Env, provider_id: Address) -> Vec<Deal> {
        log!(&env, "get_buckets_by_provider: Getting buckets for provider: {}", provider_id);
        assert_initialized(&env);
        
        let provider = Self::get_provider(env.clone(), provider_id.clone()).unwrap();
        let mut deals = Vec::new(&env);
        
        for (deal_key, _) in provider.deals.iter() {
            if let Some(deal) = internal_get_deal(env.clone(), deal_key) {
                deals.push_back(deal);
            }
        }
        log!(&env, "get_deals_by_provider: Retrieved {} deals for provider: {}", deals.len(), provider_id);
        deals
    }

    fn get_active_deals(env: Env, skip: u32, take: u32) -> Vec<Deal> {
        log!(&env, "get_active_deals: Starting retrieval, skip: {}, take: {}", skip, take);
        let mut result = Vec::new(&env);

        // Get the bucket map from storage
        let active_deal_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::ActiveDealMap).unwrap_or_else(|| Map::new(&env));
        
        if active_deal_map.is_empty() {
            log!(&env, "get_active_deals: No active deals found, returning empty map");
            return result;
        }

        let mut count = 0u32;
        let mut skipped = 0u32;
        
        // Iterate through the bucket map
        for (deal_key, _deal_id) in active_deal_map.iter() {
            // Skip buckets until we reach the skip count
            if skipped < skip {
                skipped += 1;
                continue;
            }
            
            // Stop if we've reached the take limit
            if count >= take {
                break;
            }
            let deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
            result.push_back(deal);
            count += 1;
        }
        
        log!(&env, "get_active_deals: Retrieved {} active deals (skipped: {}, requested: {})", count, skip, take);
        result
    }

    fn update_deal_consumption(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32, storage_gb: u32, egress_gb: u32) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        log!(&env, "update_deal_consumption: Updating deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        let mut deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        deal.unpaid_storage_gb = match deal.unpaid_storage_gb.checked_add(storage_gb) {
            Some(result) => result,
            None => {
                log!(&env, "update_deal_consumption: Arithmetic overflow in storage calculation");
                return false;
            }
        };
        
        deal.unpaid_egress_gb = match deal.unpaid_egress_gb.checked_add(egress_gb) {
            Some(result) => result,
            None => {
                log!(&env, "update_deal_consumption: Arithmetic overflow in egress calculation");
                return false;
            }
        };
        env.storage().persistent().set(&deal_key, &deal);
        true
    }

    fn update_deal_sla(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32, sla_avg_latency_ms: u32, sla_avg_uptime_pct: u32) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        log!(&env, "update_deal_sla: Updating deal {} for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
        let deal_key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
        let mut deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
        deal.sla_avg_latency_ms = sla_avg_latency_ms;
        deal.sla_avg_uptime_pct = sla_avg_uptime_pct;
        env.storage().persistent().set(&deal_key, &deal);
        true
    }
}

fn internal_update_deal_status(env: Env, deal_key: DataKey, status: DealStatus) -> bool {
    log!(&env, "internal_update_deal_status: Updating deal status to {:?} for key: {:?}", status, deal_key);
    assert_initialized(&env);

    let mut deal = internal_get_deal(env.clone(), deal_key.clone()).unwrap();
    deal.status = status;
    env.storage().persistent().set(&deal_key, &deal);
    log!(&env, "internal_update_deal_status: Deal status updated successfully");
    
    true
}

fn internal_get_deal(env: Env, deal_key: DataKey) -> Option<Deal> {
    log!(&env, "internal_get_deal: Retrieving deal with key: {:?}", deal_key);
    let result = env.storage().persistent().get::<_, Deal>(&deal_key);
    match &result {
        Some(deal) => log!(&env, "internal_get_deal: Found deal with ID: {}", deal.deal_id),
        None => log!(&env, "internal_get_deal: No deal found with key: {:?}", deal_key),
    }
    result
}

fn internal_delete_from_active_deals(env: Env, provider_id: Address, consumer_id: Address, deal_id: u32) -> bool {
    log!(&env, "internal_delete_from_active_deals: Removing deal {} from active deals for consumer: {}, provider: {}", deal_id, consumer_id, provider_id);
    let key = DataKey::Deal(consumer_id.clone(), provider_id.clone(), deal_id);
    log!(&env, "internal_delete_from_active_deals: Using deal key: {:?}", key);
    
    let deal = internal_get_deal(env.clone(), key.clone()).unwrap();
    let bucket_id = deal.bucket_id;
    // Don't remove the deal from storage, just remove it from active deals lists
    // Note: We keep the deal in DealMap for logging purposes

    // Remove from provider's active deals
    let mut provider = env.storage()
        .persistent()
        .get::<_, Provider>(&DataKey::Provider(provider_id.clone()))
        .unwrap();
    provider.active_deals.remove(key.clone());
    env.storage().persistent().set(&DataKey::Provider(provider_id.clone()), &provider);
    log!(&env, "internal_delete_from_active_deals: Deal removed from provider's active deals");

    // Remove from consumer's active deals
    let mut consumer = env.storage()
        .persistent()
        .get::<_, Consumer>(&DataKey::Consumer(consumer_id.clone()))
        .unwrap();
    consumer.active_deals.remove(key.clone());
    env.storage().persistent().set(&DataKey::Consumer(consumer_id), &consumer);
    log!(&env, "internal_delete_from_active_deals: Deal removed from consumer's active deals");
    
    // Remove from active deal map
    let mut active_deal_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::ActiveDealMap).unwrap_or_else(|| Map::new(&env));
    active_deal_map.remove(key.clone());
    env.storage().persistent().set(&DataKey::ActiveDealMap, &active_deal_map);

    // Unlock the bucket since the deal is completed/cancelled
    let bucket_key = DataKey::Bucket(provider_id.clone(), bucket_id);
    let mut bucket = internal_get_bucket(env.clone(), bucket_key.clone()).unwrap();
    bucket.locked = false;
    env.storage().persistent().set(&bucket_key, &bucket);
    log!(&env, "internal_delete_from_active_deals: Bucket {} unlocked after deal completion/cancellation", bucket_id);
    
    true
}
