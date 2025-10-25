import { ApiClient, HttpError } from './client';
import * as ApiTypes from './types/storage';
import * as AuthTypes from './types/auth';
import * as StatsTypes from './types/stats';
import * as ApiInterfaces from './interfaces';
import * as BridgeTypes from './types/bridge';
import * as EmailTypes from './types/email';
import * as QuotaTypes from './types/quota';
import * as SubscriptionTypes from './types/subscriptions';
import * as DeviceTypes from './types/device';
import * as MFATypes from './types/mfa';
import * as SettingsTypes from './types/settings';
import * as RolesTypes from './types/roles';
import * as WorkspaceTypes from './types/workspace';
import * as OrganizationTypes from './types/organization';
import * as NodeRegistrationTypes from './types/noderegistration';
import * as SystemEventTypes from './types/systemEvent';
import * as UserTypes from './types/user';
import * as crypto from 'crypto';

/**
 * Generates an OpenAI-compatible API key/secret pair
 * @returns Object containing apiKey and secretKey
 */
export function generateOpenAICompatibleKey(): string {
    // Generate a random 32-byte key for the secret
    const secretKey = crypto.randomBytes(32).toString('hex');
    
    // Generate OpenAI-style API key (sk- prefix + 48 random characters)
    const randomPart = crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, (char) => {
        switch(char) {
            case '+': return 'A';
            case '/': return 'B';
            case '=': return 'C';
            default: return char;
        }
    });
    const apiKey = `sk-${randomPart}`;
    
    return apiKey;
}

export { ApiClient, 
    ApiTypes, 
    AuthTypes, 
    StatsTypes, 
    ApiInterfaces, 
    HttpError, 
    BridgeTypes, 
    EmailTypes, 
    QuotaTypes, 
    SubscriptionTypes, 
    DeviceTypes, 
    MFATypes, 
    SettingsTypes,
    RolesTypes,
    WorkspaceTypes,
    OrganizationTypes,
    NodeRegistrationTypes,
    SystemEventTypes,
    UserTypes
};
