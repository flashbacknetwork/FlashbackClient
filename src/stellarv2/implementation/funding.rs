use soroban_sdk::token;
use soroban_sdk::{contractimpl, Address, Env};

use crate::types::DataKey;
use crate::validate::{assert_initialized, owner_or_panic};
use crate::ContractClient;
use crate::ContractArgs;

#[allow(dead_code)]
pub trait FundingOps {
    fn send_funds_owner(env: Env, receiver: Address, amount: i128) -> bool;
    fn test_faucet_owner(env: Env, receiver: Address, amount: i128) -> bool;
    fn change_asset_admin(env: Env, new_admin: Address) -> bool;
}

#[contractimpl]
impl FundingOps for super::super::Contract {
    fn send_funds_owner(
        env: Env,
        receiver: Address,
        amount: i128,
    ) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        let contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
        let token_client = token::StellarAssetClient::new(&env, &contract_id);
        token_client.set_authorized(&receiver, &true);
        token_client.mint(&receiver, &amount);
        true
    }

    fn test_faucet_owner(env: Env, receiver: Address, amount: i128) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        let contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
        let token_client = token::StellarAssetClient::new(&env, &contract_id);
        token_client.set_authorized(&receiver, &true);
        token_client.mint(&receiver, &amount);
        true
    }

    fn change_asset_admin(env: Env, new_admin: Address) -> bool {
        assert_initialized(&env);
        owner_or_panic(&env);

        let asset_contract_id = env.storage().persistent().get(&DataKey::StableAssetAddress).unwrap();
        let token_client = token::StellarAssetClient::new(&env, &asset_contract_id);
        token_client.set_admin(&new_admin);
        true
    }
}
