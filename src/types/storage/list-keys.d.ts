export interface ListKeys {
    keys: Key[]
}

export interface Key {
    creationTime: string
    keyName: string
    value: string
    permissions: string
}
