use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListContainers {
    pub value: Vec<Value>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Value {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub type_field: String,
    pub etag: String,
    pub properties: Properties,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Properties {
    pub immutable_storage_with_versioning: ImmutableStorageWithVersioning,
    pub deleted: bool,
    pub remaining_retention_days: i64,
    pub default_encryption_scope: String,
    pub deny_encryption_scope_override: bool,
    pub public_access: String,
    pub lease_status: String,
    pub lease_state: String,
    pub last_modified_time: String,
    pub has_immutability_policy: bool,
    pub has_legal_hold: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImmutableStorageWithVersioning {
    pub enabled: bool,
}
