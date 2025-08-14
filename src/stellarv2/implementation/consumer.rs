use crate::types::{DataKey, Consumer, ErrorCode};
use crate::validate::{assert_initialized};
use crate::ContractClient;
use soroban_sdk::{contractimpl, Address, Env, Map, panic_with_error, log};
use crate::ContractArgs;

#[allow(dead_code)]
pub trait ConsumerOps {
    fn register_consumer(
        env: Env,
        consumer_id: Address,
        description: soroban_sdk::String
    );
	fn update_consumer(env: Env, consumer_id: Address, description: soroban_sdk::String) -> bool;
    fn delete_consumer(env: Env, consumer_id: Address) -> bool;
    fn get_consumer(env: Env, consumer_id: Address) -> Option<Consumer>;
    fn get_consumer_count(env: Env) -> u32;
    fn get_consumers(env: Env, skip: u32, take: u32) -> soroban_sdk::Map<Address, Consumer>;
}

#[contractimpl]
impl ConsumerOps for super::super::Contract {
    fn register_consumer(
        env: Env,
        consumer_id: Address,
        description: soroban_sdk::String,
    ) {
        log!(&env, "register_consumer: Starting registration for consumer: {}", consumer_id);
        assert_initialized(&env);
        consumer_id.require_auth();

        // check if consumer already exists
        if Self::get_consumer(env.clone(), consumer_id.clone()).is_some() {
            log!(&env, "register_consumer: Consumer already exists: {}", consumer_id);
            panic_with_error!(&env, ErrorCode::ConsumerAlreadyExists);
        }

        log!(&env, "register_consumer: Creating new consumer: {}", consumer_id);

        // Store consumer using their address as key
        let key = DataKey::Consumer(consumer_id.clone());
        let consumer = Consumer {
            consumer_id: consumer_id.clone(),
            description,
            reputation: 50,
            registered_ts: env.ledger().timestamp(),
            last_update_ts: env.ledger().timestamp(),
			deals: Map::new(&env),
            active_deals: Map::new(&env),
        };

        env.storage().persistent().set(&key, &consumer);
        log!(&env, "register_consumer: Consumer stored successfully: {}", consumer_id);

        // increase ConsumerCount
        let current_count: u32 = env.storage().persistent().get(&DataKey::ConsumerCount).unwrap_or(0u32);
        log!(&env, "register_consumer: Current consumer count: {}", current_count);
        let new_count = current_count + 1;
        env.storage().persistent().set(&DataKey::ConsumerCount, &new_count);
        log!(&env, "register_consumer: Updated consumer count to: {}", new_count);
    }

	fn update_consumer(env: Env, consumer_id: Address, description: soroban_sdk::String) -> bool {
		log!(&env, "update_consumer: Updating consumer: {}", consumer_id);
		assert_initialized(&env);

		let key = DataKey::Consumer(consumer_id.clone());
		let mut consumer = Self::get_consumer(env.clone(), consumer_id.clone()).unwrap();
		consumer.description = description;
		consumer.last_update_ts = env.ledger().timestamp();
		env.storage().persistent().set(&key, &consumer);
		log!(&env, "update_consumer: Consumer updated successfully: {}", consumer_id);
		
		true
	}

    fn delete_consumer(env: Env, consumer_id: Address) -> bool {
        log!(&env, "delete_consumer: Deleting consumer: {}", consumer_id);
        assert_initialized(&env);
        consumer_id.require_auth();

        let key = DataKey::Consumer(consumer_id.clone());
        env.storage().persistent().remove(&key);
        log!(&env, "delete_consumer: Consumer removed from storage: {}", consumer_id);

        // decrease ConsumerCount
        let current_count: u32 = env.storage().persistent().get(&DataKey::ConsumerCount).unwrap_or(0u32);
        log!(&env, "delete_consumer: Current consumer count: {}", current_count);
        let new_count = if current_count > 0 { current_count - 1 } else { 0 };
        env.storage().persistent().set(&DataKey::ConsumerCount, &new_count);
        log!(&env, "delete_consumer: Updated consumer count to: {}", new_count);

        true
    }

    fn get_consumer(env: Env, consumer_id: Address) -> Option<Consumer> {
        log!(&env, "get_consumer: Retrieving consumer: {}", consumer_id);
        assert_initialized(&env);

        let key = DataKey::Consumer(consumer_id.clone());
        log!(&env, "get_consumer: Using key: {:?}", key);
        
        let result = env.storage().persistent().get::<_, Consumer>(&key);
        match &result {
            Some(_consumer) => log!(&env, "get_consumer: Found consumer: {}", consumer_id),
            None => log!(&env, "get_consumer: Consumer not found: {}", consumer_id),
        }
        
        result
    }

    fn get_consumer_count(env: Env) -> u32 {
        log!(&env, "get_consumer_count: Starting count retrieval");
        assert_initialized(&env);
        
        let count_key = DataKey::ConsumerCount;
        log!(&env, "get_consumer_count: Using key: {:?}", count_key);
        
        // Try to get the count with detailed logging
        match env.storage().persistent().get::<_, u32>(&count_key) {
            Some(count) => {
                log!(&env, "get_consumer_count: Successfully retrieved count: {}", count);
                count
            },
            None => {
                log!(&env, "get_consumer_count: No count found, returning 0");
                0
            }
        }
    }

    fn get_consumers(env: Env, skip: u32, take: u32) -> soroban_sdk::Map<Address, Consumer> {
        log!(&env, "get_consumers: Starting retrieval, skip: {}, take: {}", skip, take);
        assert_initialized(&env);
        let result = soroban_sdk::Map::new(&env);

        // Get the total count of consumers
        let total_count = Self::get_consumer_count(env.clone());
        log!(&env, "get_consumers: Total consumer count: {}", total_count);
        
        if total_count == 0 {
            log!(&env, "get_consumers: No consumers found, returning empty map");
            return result;
        }

        // For now, we'll return an empty map since we don't have a way to iterate through all consumers
        // This is a limitation of the current implementation
        // TODO: Implement proper consumer enumeration
        log!(&env, "get_consumers: Consumer enumeration not implemented, returning empty map");
        result
    }
}