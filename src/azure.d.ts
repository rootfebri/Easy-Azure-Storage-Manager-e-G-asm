export type SubscriptionPromotions = {
  category: string;
  endDateTime: string;
}
export type SubscriptionPolicies = {
  locationPlacementId: string;
  quotaId: string;
  spendingLimit: string;
}
export type SubscriptionValue = {
  authorizationSource: string;
  displayName: string;
  id: string;
  managedByTenants: any[];
  promotions: SubscriptionPromotions[];
  state: string;
  subscriptionId: string;
  subscriptionPolicies: SubscriptionPolicies;
  tenantId: string;
}
export type SubscriptionCount = {
    type: string;
    value: number;
}
export type Subscriptions = {
  count: SubscriptionCount;
  value: SubscriptionValue[];
}

export type Sku = {
  name: string;
  tier: string;
}

export type Tags = {}
export type KeyCreationTime = {
    key1: string;
    key2: string;
}
export type NetworkAcls = {
    ipv6Rules: any[];
    bypass: string;
    virtualNetworkRules: any[];
    ipRules: any[];
    defaultAction: string;
}
export type File = {
    keyType: string;
    enabled: boolean;
    lastEnabledTime: string;
}
export type Blob = {
    keyType: string;
    enabled: boolean;
    lastEnabledTime: string;
}
export type Services = {
    file: File;
    blob: Blob;
}
export type Encryption = {
    requireInfrastructureEncryption: boolean;
    services: Services;
    keySource: string;
}
export type PrimaryEndpoints = {
    dfs: string;
    web: string;
    blob: string;
    queue: string;
    table: string;
    file: string;
}
export type SecondaryEndpoint = {
    dfs: string;
    web: string;
    blob: string;
    queue: string;
    table: string;
}
export type Properties = {
    dnsEndpointType: string;
    defaultToOAuthAuthentication: boolean;
    publicNetworkAccess: string;
    keyCreationTime: KeyCreationTime;
    allowCrossTenantReplication: boolean;
    privateEndpointConnections: any[];
    minimumTlsVersion: string;
    allowBlobPublicAccess: boolean;
    allowSharedKeyAccess: boolean;
    largeFileSharesState: string;
    networkAcls: NetworkAcls;
    supportsHttpsTrafficOnly: boolean;
    encryption: Encryption;
    accessTier: string;
    provisioningState: string;
    creationTime: string;
    primaryEndpoints: PrimaryEndpoints;
    primaryLocation: string;
    statusOfPrimary: string;
    secondaryLocation: string;
    statusOfSecondary: string;
    secondaryEndpoints: SecondaryEndpoint;
}
export type StorageValue = {
    sku: Sku;
    kind: string;
    id: string;
    name: string;
    type: string;
    location: string;
    tags: Tags;
    properties: Properties;
}
export type Storages = {
  value: StorageValue[];
}
