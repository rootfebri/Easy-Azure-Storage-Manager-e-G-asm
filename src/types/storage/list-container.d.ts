interface Root {
    value: Value[]
}
interface Value {
    id: string
    name: string
    type: string
    etag: string
    properties: Properties
}
interface Properties {
    immutableStorageWithVersioning: ImmutableStorageWithVersioning
    deleted: boolean
    remainingRetentionDays: number
    defaultEncryptionScope: string
    denyEncryptionScopeOverride: boolean
    publicAccess: string
    leaseStatus: string
    leaseState: string
    lastModifiedTime: string
    hasImmutabilityPolicy: boolean
    hasLegalHold: boolean
}
interface ImmutableStorageWithVersioning {
    enabled: boolean
}

export {Root as ListContainer, Value as ContainerData}
export default ListContainer;