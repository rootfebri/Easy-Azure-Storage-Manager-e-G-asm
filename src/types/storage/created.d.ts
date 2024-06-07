export interface Created {
    sku: Sku
    kind: string
    id: string
    name: string
    type: string
    location: string
    tags: Tags
    properties: Properties
}
export interface Sku {
    name: string
    tier: string
}
export interface Tags {}
export interface Properties {
    keyCreationTime: KeyCreationTime
    allowCrossTenantReplication: boolean
    privateEndpointConnections: any[]
    minimumTlsVersion: string
    allowBlobPublicAccess: boolean
    allowSharedKeyAccess: boolean
    networkAcls: NetworkAcls
    supportsHttpsTrafficOnly: boolean
    encryption: Encryption
    accessTier: string
    provisioningState: string
    creationTime: string
    primaryEndpoints: PrimaryEndpoints
    primaryLocation: string
    statusOfPrimary: string
    secondaryLocation: string
    statusOfSecondary: string
}
export interface KeyCreationTime {
    key1: string
    key2: string
}
export interface NetworkAcls {
    ipv6Rules: any[]
    bypass: string
    virtualNetworkRules: any[]
    ipRules: any[]
    defaultAction: string
}
export interface Encryption {
    services: Services
    keySource: string
}
export interface Services {
    file: File
    blob: Blob
}
export interface File {
    keyType: string
    enabled: boolean
    lastEnabledTime: string
}
export interface Blob {
    keyType: string
    enabled: boolean
    lastEnabledTime: string
}
export interface PrimaryEndpoints {
    dfs: string
    web: string
    blob: string
    queue: string
    table: string
    file: string
}
