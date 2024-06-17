// src/models.ts
export interface AppData {
    client_id: string;
    tenant_id: string;
}

export interface AccessToken {
    value: string;
    created_at: number;
    expired_on: number;
}

export interface SasToken {
    accountSasToken: string;
}

export interface ResourceGroupName {
    value: string;
}