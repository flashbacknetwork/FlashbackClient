use crate::types::{DataKey, Provider, ErrorCode};
use crate::validate::{assert_initialized};
use soroban_sdk::{contractimpl, Address, Env, Map, panic_with_error, log};
use crate::ContractClient;
use crate::ContractArgs;

#[allow(dead_code)]
pub trait ProviderOps {
    fn register_provider(
        env: Env,
        provider_id: Address,
        description: soroban_sdk::String
    );
    fn update_provider(env: Env, provider_id: Address, description: soroban_sdk::String) -> bool;
    fn delete_provider(env: Env, provider_id: Address) -> bool;
    fn get_provider(env: Env, provider_id: Address) -> Option<Provider>;
    fn get_provider_count(env: Env) -> u32;
    fn get_providers(env: Env, skip: u32, take: u32) -> soroban_sdk::Map<Address, Provider>;
}

#[contractimpl]
impl ProviderOps for super::super::Contract {
    fn register_provider(
        env: Env,
        provider_id: Address,
        description: soroban_sdk::String,
    ) {
        log!(&env, "register_provider: Starting registration for provider: {}", provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        // check if provider already exists
        if Self::get_provider(env.clone(), provider_id.clone()).is_some() {
            log!(&env, "register_provider: Provider already exists: {}", provider_id);
            panic_with_error!(&env, ErrorCode::ProviderAlreadyExists);
        }

        log!(&env, "register_provider: Creating new provider: {}", provider_id);

        // Store provider using their address as key
        let key = DataKey::Provider(provider_id.clone());
        let provider = Provider {
            provider_id: provider_id.clone(),
            buckets: Map::new(&env),
            deals: Map::new(&env),
            active_deals: Map::new(&env),
            description,
            reputation: 50,
            registered_ts: env.ledger().timestamp(),
            last_update_ts: env.ledger().timestamp(),
            units_count: 0,
        };

        env.storage().persistent().set(&key, &provider);
        log!(&env, "register_provider: Provider stored successfully: {}", provider_id);

        // increase ProviderCount
        let current_count: u32 = env.storage().persistent().get(&DataKey::ProviderCount).unwrap_or(0u32);
        log!(&env, "register_provider: Current provider count: {}", current_count);
        let new_count = current_count + 1;
        env.storage().persistent().set(&DataKey::ProviderCount, &new_count);
        log!(&env, "register_provider: Updated provider count to: {}", new_count);
    }

    fn update_provider(env: Env, provider_id: Address, description: soroban_sdk::String) -> bool {
        log!(&env, "update_provider: Updating provider: {}", provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Provider(provider_id.clone());
        let mut provider = Self::get_provider(env.clone(), provider_id.clone()).unwrap();
        provider.description = description;
        provider.last_update_ts = env.ledger().timestamp();
        env.storage().persistent().set(&key, &provider);
        log!(&env, "update_provider: Provider updated successfully: {}", provider_id);
        
        true
    }

    fn delete_provider(env: Env, provider_id: Address) -> bool {
        log!(&env, "delete_provider: Deleting provider: {}", provider_id);
        assert_initialized(&env);
        provider_id.require_auth();

        let key = DataKey::Provider(provider_id.clone());
        env.storage().persistent().remove(&key);
        log!(&env, "delete_provider: Provider removed from storage: {}", provider_id);

        // decrease ProviderCount
        let current_count: u32 = env.storage().persistent().get(&DataKey::ProviderCount).unwrap_or(0u32);
        log!(&env, "delete_provider: Current provider count: {}", current_count);
        let new_count = if current_count > 0 { current_count - 1 } else { 0 };
        env.storage().persistent().set(&DataKey::ProviderCount, &new_count);
        log!(&env, "delete_provider: Updated provider count to: {}", new_count);

        true
    }

    fn get_provider(env: Env, provider_id: Address) -> Option<Provider> {
        log!(&env, "get_provider: Retrieving provider: {}", provider_id);
        assert_initialized(&env);
        
        let key = DataKey::Provider(provider_id.clone());
        log!(&env, "get_provider: Using key: {:?}", key);
        
        let result = env.storage().persistent().get::<_, Provider>(&key);
        match &result {
            Some(_provider) => log!(&env, "get_provider: Found provider: {}", provider_id),
            None => log!(&env, "get_provider: Provider not found: {}", provider_id),
        }
        
        result
    }

    fn get_provider_count(env: Env) -> u32 {
        log!(&env, "get_provider_count: Starting count retrieval");
        assert_initialized(&env);
        
        let count_key = DataKey::ProviderCount;
        log!(&env, "get_provider_count: Using key: {:?}", count_key);
        
        // Try to get the count with detailed logging
        match env.storage().persistent().get::<_, u32>(&count_key) {
            Some(count) => {
                log!(&env, "get_provider_count: Successfully retrieved count: {}", count);
                count
            },
            None => {
                log!(&env, "get_provider_count: No count found, returning 0");
                0
            }
        }
    }

    fn get_providers(env: Env, skip: u32, take: u32) -> soroban_sdk::Map<Address, Provider> {
        log!(&env, "get_providers: Starting retrieval, skip: {}, take: {}", skip, take);
        assert_initialized(&env);
        let result = soroban_sdk::Map::new(&env);

        // Get the total count of providers
        let total_count = Self::get_provider_count(env.clone());
        log!(&env, "get_providers: Total provider count: {}", total_count);
        
        if total_count == 0 {
            log!(&env, "get_providers: No providers found, returning empty map");
            return result;
        }

        // For now, we'll return an empty map since we don't have a way to iterate through all providers
        // This is a limitation of the current implementation
        // TODO: Implement proper provider enumeration
        log!(&env, "get_providers: Provider enumeration not implemented, returning empty map");
        result
    }
}
