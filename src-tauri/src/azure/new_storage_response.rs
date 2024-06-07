use serde::{Deserialize, Serialize};
use serde_json::Value;

// Option of Accepted or Created
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SuccessResponse {
    Accepted(Accepted),
    Created(Created),
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Accepted {
    pub message: String
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Created {
    pub sku: Sku,
    pub kind: String,
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub type_field: String,
    pub location: String,
    pub tags: Tags,
    pub properties: Properties,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Sku {
    pub name: String,
    pub tier: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tags {
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Properties {
    pub key_creation_time: KeyCreationTime,
    pub allow_cross_tenant_replication: bool,
    pub private_endpoint_connections: Vec<Value>,
    pub minimum_tls_version: String,
    pub allow_blob_public_access: bool,
    pub allow_shared_key_access: bool,
    pub network_acls: NetworkAcls,
    pub supports_https_traffic_only: bool,
    pub encryption: Encryption,
    pub access_tier: String,
    pub provisioning_state: String,
    pub creation_time: String,
    pub primary_endpoints: PrimaryEndpoints,
    pub primary_location: String,
    pub status_of_primary: String,
    pub secondary_location: String,
    pub status_of_secondary: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyCreationTime {
    pub key1: String,
    pub key2: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkAcls {
    #[serde(rename = "ipv6Rules")]
    pub ipv6rules: Vec<Value>,
    pub bypass: String,
    pub virtual_network_rules: Vec<Value>,
    pub ip_rules: Vec<Value>,
    pub default_action: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Encryption {
    pub services: Services,
    pub key_source: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Services {
    pub file: File,
    pub blob: Blob,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct File {
    pub key_type: String,
    pub enabled: bool,
    pub last_enabled_time: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Blob {
    pub key_type: String,
    pub enabled: bool,
    pub last_enabled_time: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrimaryEndpoints {
    pub dfs: String,
    pub web: String,
    pub blob: String,
    pub queue: String,
    pub table: String,
    pub file: String,
}