use crate::types::{DataKey, Bucket, BucketStatus, ErrorCode, generate_bucket_uid};
use crate::validate::{assert_initialized};
use crate::ContractClient;
use soroban_sdk::{contractimpl, Address, Env, Vec, Map, panic_with_error, String, log};
use crate::ContractArgs;
use crate::implementation::ProviderOps;

#[allow(dead_code)]
pub trait BucketOps {
    fn create_bucket(
        env: Env,
        provider_id: Address,
        name: String,
        region: String,
        country: String,
        versioning_enabled: bool,
        fb_bucket_id: String,
        api_compatibility: String,
        price_per_gb_storage: u128,
        price_per_gb_egress: u128,
    ) -> u32;
    fn create_from_bucket(
        env: Env,
        bucket: Bucket
    ) -> u32;
    fn update_bucket_basic(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        name: Option<String>,
        region: Option<String>,
        country: Option<String>
    ) -> bool;
    fn update_bucket_pricing(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        price_per_gb_storage: Option<u128>,
        price_per_gb_egress: Option<u128>,
        max_storage_gb: Option<u32>,
        max_egress_gb: Option<u32>
    ) -> bool;
    fn update_bucket_sla(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        sla_avg_latency_ms: Option<u32>,
        sla_avg_uptime_pct: Option<u32>
    ) -> bool;
    fn lock_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool;
    fn unlock_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool;
    fn delete_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool;
    fn get_bucket(env: Env, provider_id: Address, bucket_id: u32) -> Option<Bucket>;
    fn get_bucket_count(env: Env) -> u32;
    fn get_buckets(env: Env, skip: u32, take: u32) -> Vec<Bucket>;
    fn get_buckets_by_provider(env: Env, provider_id: Address) -> Vec<Bucket>;
}

#[contractimpl]
impl BucketOps for super::super::Contract {
    fn create_bucket(
        env: Env,
        provider_id: Address,
        name: String,
        region: String,
        country: String,
        versioning_enabled: bool,
        fb_bucket_id: String,
        api_compatibility: String,
        price_per_gb_storage: u128,
        price_per_gb_egress: u128,
    ) -> u32 {
        log!(&env, "create_bucket: Starting bucket creation for provider: {}", provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        // Generate unique bucket ID
        let (bucket_key, bucket_id) = generate_bucket_uid(&env, &provider_id);
        log!(&env, "create_bucket: Generated bucket ID: {}, key: {:?}", bucket_id, bucket_key);

        // Check if bucket already exists
        if internal_get_bucket(env.clone(), bucket_key.clone()).is_some() {
            log!(&env, "create_bucket: Bucket already exists with key: {:?}", bucket_key);
            panic_with_error!(&env, ErrorCode::BucketAlreadyExists);
        }

        log!(&env, "create_bucket: Creating new bucket with ID: {}", bucket_id);

        // Create bucket with default values for optional fields
        let bucket = Bucket {
            bucket_id: bucket_id,
            name: name.clone(),
            region: region.clone(),
            country: country.clone(),
            provider_id: provider_id.clone(),
            fb_bucket_id: fb_bucket_id.clone(),
            price_per_gb_storage,
            price_per_gb_egress,
            max_storage_gb: 0,
            max_egress_gb: 0,
            versioning_enabled,
            encryption_at_rest: false,
            encryption_in_transit: false,
            object_locking: false,
            api_compatibility,
            sla_avg_latency_ms: 0,
            sla_avg_uptime_pct: 9990, // 99.90%
            access_scope: String::from_str(&env, "private"),
            tags: Vec::new(&env),
            created_ts: env.ledger().timestamp(),
            status: BucketStatus::Active,
            locked: false, // Initially unlocked
        };

        // Store bucket
        env.storage().persistent().set(&bucket_key, &bucket);
        log!(&env, "create_bucket: Bucket stored successfully with key: {:?}", bucket_key);

        // add to bucket map
        let mut bucket_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::BucketMap).unwrap_or_else(|| Map::new(&env));
        bucket_map.set(bucket_key.clone(), bucket_id);
        env.storage().persistent().set(&DataKey::BucketMap, &bucket_map);

        // Add bucket to provider's buckets list
        let provider_id_clone = provider_id.clone();
        let mut provider = Self::get_provider(env.clone(), provider_id_clone.clone()).unwrap();
        provider.buckets.set(bucket_key.clone(), 0);
        env.storage().persistent().set(&DataKey::Provider(provider_id_clone), &provider);
        log!(&env, "create_bucket: Added bucket to provider's bucket list: {}", provider_id);

        bucket_id
    }

    fn create_from_bucket(
        env: Env,
        bucket: Bucket
    ) -> u32 {
        log!(&env, "create_from_bucket: Starting bucket creation from existing bucket");
        assert_initialized(&env);
        Self::create_bucket(env, 
            bucket.provider_id, 
            bucket.name, 
            bucket.region, 
            bucket.country, 
            bucket.versioning_enabled, 
            bucket.fb_bucket_id, 
            bucket.api_compatibility, 
            bucket.price_per_gb_storage, 
            bucket.price_per_gb_egress)
    }

    fn update_bucket_basic(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        name: Option<String>,
        region: Option<String>,
        country: Option<String>
    ) -> bool {
        log!(&env, "update_bucket_basic: Updating bucket {} for provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "update_bucket_basic: Using key: {:?}", key);
        
        let mut bucket = internal_get_bucket(env.clone(), key.clone()).unwrap();
        log!(&env, "update_bucket_basic: Retrieved existing bucket: {}", bucket_id);

        // Check if bucket is locked
        if bucket.locked {
            log!(&env, "update_bucket_basic: Bucket {} is locked, cannot update", bucket_id);
            panic_with_error!(&env, ErrorCode::BucketLocked);
        }

        // Update fields if provided
        if let Some(name) = name {
            log!(&env, "update_bucket_basic: Updating name to: {}", name);
            bucket.name = name;
        }
        if let Some(region) = region {
            log!(&env, "update_bucket_basic: Updating region to: {}", region);
            bucket.region = region;
        }
        if let Some(country) = country {
            log!(&env, "update_bucket_basic: Updating country to: {}", country);
            bucket.country = country;
        }

        env.storage().persistent().set(&key.clone(), &bucket);
        log!(&env, "update_bucket_basic: Bucket updated successfully: {}", bucket_id);
        true
    }

    fn update_bucket_pricing(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        price_per_gb_storage: Option<u128>,
        price_per_gb_egress: Option<u128>,
        max_storage_gb: Option<u32>,
        max_egress_gb: Option<u32>
    ) -> bool {
        log!(&env, "update_bucket_pricing: Updating pricing for bucket {} from provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "update_bucket_pricing: Using key: {:?}", key);
        
        let mut bucket = internal_get_bucket(env.clone(), key.clone()).unwrap();
        log!(&env, "update_bucket_pricing: Retrieved existing bucket: {}", bucket_id);

        // Check if bucket is locked
        if bucket.locked {
            log!(&env, "update_bucket_pricing: Bucket {} is locked, cannot update", bucket_id);
            panic_with_error!(&env, ErrorCode::BucketLocked);
        }

        // Update fields if provided
        if let Some(price) = price_per_gb_storage {
            log!(&env, "update_bucket_pricing: Updating storage price to: {}", price);
            bucket.price_per_gb_storage = price;
        }
        if let Some(price) = price_per_gb_egress {
            log!(&env, "update_bucket_pricing: Updating egress price to: {}", price);
            bucket.price_per_gb_egress = price;
        }
        if let Some(max_storage) = max_storage_gb {
            log!(&env, "update_bucket_pricing: Updating max storage to: {}", max_storage);
            bucket.max_storage_gb = max_storage;
        }
        if let Some(max_egress) = max_egress_gb {
            log!(&env, "update_bucket_pricing: Updating max egress to: {}", max_egress);
            bucket.max_egress_gb = max_egress;
        }

        env.storage().persistent().set(&key, &bucket);
        log!(&env, "update_bucket_pricing: Bucket pricing updated successfully: {}", bucket_id);
        true
    }

    fn update_bucket_sla(
        env: Env,
        provider_id: Address,
        bucket_id: u32,
        sla_avg_latency_ms: Option<u32>,
        sla_avg_uptime_pct: Option<u32>
    ) -> bool {
        log!(&env, "update_bucket_sla: Updating SLA for bucket {} from provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "update_bucket_sla: Using key: {:?}", key);
        
        let mut bucket = internal_get_bucket(env.clone(), key.clone()).unwrap();
        log!(&env, "update_bucket_sla: Retrieved existing bucket: {}", bucket_id);

        // Check if bucket is locked
        if bucket.locked {
            log!(&env, "update_bucket_sla: Bucket {} is locked, cannot update", bucket_id);
            panic_with_error!(&env, ErrorCode::BucketLocked);
        }

        // Update fields if provided
        if let Some(sla_latency) = sla_avg_latency_ms {
            log!(&env, "update_bucket_sla: Updating SLA latency to: {}", sla_latency);
            bucket.sla_avg_latency_ms = sla_latency;
        }
        if let Some(sla_uptime) = sla_avg_uptime_pct {
            log!(&env, "update_bucket_sla: Updating SLA uptime to: {}", sla_uptime);
            bucket.sla_avg_uptime_pct = sla_uptime;
        }

        env.storage().persistent().set(&key, &bucket);
        log!(&env, "update_bucket_sla: Bucket SLA updated successfully: {}", bucket_id);
        true
    }

    fn lock_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool {
        log!(&env, "lock_bucket: Locking bucket {} for provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "lock_bucket: Using key: {:?}", key);
        
        let mut bucket = internal_get_bucket(env.clone(), key.clone()).unwrap();
        log!(&env, "lock_bucket: Retrieved existing bucket: {}", bucket_id);

        // Check if bucket is already locked
        if bucket.locked {
            log!(&env, "lock_bucket: Bucket {} is already locked", bucket_id);
            return false;
        }

        // Lock the bucket
        bucket.locked = true;
        env.storage().persistent().set(&key, &bucket);
        log!(&env, "lock_bucket: Bucket {} locked successfully", bucket_id);
        true
    }

    fn unlock_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool {
        log!(&env, "unlock_bucket: Unlocking bucket {} for provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "unlock_bucket: Using key: {:?}", key);
        
        let mut bucket = internal_get_bucket(env.clone(), key.clone()).unwrap();
        log!(&env, "unlock_bucket: Retrieved existing bucket: {}", bucket_id);

        // Check if bucket is locked
        if !bucket.locked {
            log!(&env, "unlock_bucket: Bucket {} is not locked", bucket_id);
            return false;
        }

        // Unlock the bucket
        bucket.locked = false;
        env.storage().persistent().set(&key, &bucket);
        log!(&env, "unlock_bucket: Bucket {} unlocked successfully", bucket_id);
        true
    }

    fn delete_bucket(env: Env, provider_id: Address, bucket_id: u32) -> bool {
        log!(&env, "delete_bucket: Deleting bucket {} from provider: {}", bucket_id, provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        // Check if bucket is locked before deletion
        let bucket_key = DataKey::Bucket(provider_id.clone(), bucket_id);
        let bucket = internal_get_bucket(env.clone(), bucket_key.clone()).unwrap();
        
        if bucket.locked {
            log!(&env, "delete_bucket: Bucket {} is locked, cannot delete", bucket_id);
            panic_with_error!(&env, ErrorCode::BucketLocked);
        }

        // delete from provider's buckets list
        let provider_key = DataKey::Provider(provider_id.clone());
        log!(&env, "delete_bucket: Using bucket key: {:?}, provider key: {:?}", bucket_key, provider_key);
        
        let mut provider = Self::get_provider(env.clone(), provider_id.clone()).unwrap();
        provider.buckets.remove(bucket_key.clone());
        env.storage().persistent().set(&provider_key, &provider);
        log!(&env, "delete_bucket: Removed bucket from provider's bucket list");

        // delete from bucket map
        let mut bucket_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::BucketMap).unwrap_or_else(|| Map::new(&env));
        bucket_map.remove(bucket_key.clone());
        env.storage().persistent().set(&DataKey::BucketMap, &bucket_map);

        // delete the bucket data
        env.storage().persistent().remove(&bucket_key);
        log!(&env, "delete_bucket: Bucket deleted successfully: {}", bucket_id);
        true
    }

    fn get_bucket(env: Env, provider_id: Address, bucket_id: u32) -> Option<Bucket> {
        log!(&env, "get_bucket: Retrieving bucket {} from provider: {}", bucket_id, provider_id);
        let bucket_key = DataKey::Bucket(provider_id.clone(), bucket_id);
        log!(&env, "get_bucket: Using key: {:?}", bucket_key);
        
        let result = internal_get_bucket(env.clone(), bucket_key);
        match &result {
            Some(_bucket) => log!(&env, "get_bucket: Found bucket: {}", bucket_id),
            None => log!(&env, "get_bucket: Bucket not found: {}", bucket_id),
        }
        
        result
    }

    fn get_bucket_count(env: Env) -> u32 {
        log!(&env, "get_bucket_count: Starting count retrieval");
        
        // Get the total count from the BucketCount key that we maintain
        let total_count = env.storage().persistent().get(&DataKey::BucketCount).unwrap_or(0u32);
        log!(&env, "get_bucket_count: Retrieved bucket count: {}", total_count);
        total_count
    }

    fn get_buckets(env: Env, skip: u32, take: u32) -> Vec<Bucket> {
        log!(&env, "get_buckets: Starting retrieval, skip: {}, take: {}", skip, take);
        let mut result = Vec::new(&env);

        // Get the bucket map from storage
        let bucket_map: Map<DataKey, u32> = env.storage().persistent().get(&DataKey::BucketMap).unwrap_or_else(|| Map::new(&env));
        
        if bucket_map.is_empty() {
            log!(&env, "get_buckets: No buckets found, returning empty map");
            return result;
        }

        let mut count = 0u32;
        let mut skipped = 0u32;
        
        // Iterate through the bucket map
        for (bucket_key, _bucket_id) in bucket_map.iter() {
            // Skip buckets until we reach the skip count
            if skipped < skip {
                skipped += 1;
                continue;
            }
            
            // Stop if we've reached the take limit
            if count >= take {
                break;
            }
            let bucket = internal_get_bucket(env.clone(), bucket_key.clone()).unwrap();
            result.push_back(bucket);
            count += 1;
        }
        
        log!(&env, "get_buckets: Retrieved {} buckets (skipped: {}, requested: {})", count, skip, take);
        result
    }

    fn get_buckets_by_provider(env: Env, provider_id: Address) -> Vec<Bucket> {
        log!(&env, "get_buckets_by_provider: Getting buckets for provider: {}", provider_id);
        assert_initialized(&env);
        
        let provider = Self::get_provider(env.clone(), provider_id.clone()).unwrap();
        let mut buckets = Vec::new(&env);
        
        for (bucket_key, _) in provider.buckets.iter() {
            if let Some(bucket) = internal_get_bucket(env.clone(), bucket_key) {
                buckets.push_back(bucket);
            }
        }
        log!(&env, "get_buckets_by_provider: Retrieved {} buckets for provider: {}", buckets.len(), provider_id);
        buckets
    }
}

pub(crate) fn internal_get_bucket(env: Env, bucket_key: DataKey) -> Option<Bucket> {
    log!(&env, "internal_get_bucket: Retrieving bucket with key: {:?}", bucket_key);
    let result = env.storage().persistent().get::<_, Bucket>(&bucket_key);
    match &result {
        Some(bucket) => log!(&env, "internal_get_bucket: Found bucket with ID: {}", bucket.bucket_id),
        None => log!(&env, "internal_get_bucket: No bucket found with key: {:?}", bucket_key),
    }
    result
}