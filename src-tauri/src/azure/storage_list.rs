use serde::{Deserialize, Serialize};
use serde_json::Value as SerdeValue;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageList {
    pub value: Vec<Value>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Value {
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
    #[serde(rename = "ms-resource-usage")]
    pub ms_resource_usage: Option<String>,
    #[serde(rename = "SUMBING")]
    pub sumbing: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Properties {
    pub dns_endpoint_type: Option<String>,
    #[serde(rename = "defaultToOAuthAuthentication")]
    pub default_to_oauth_authentication: Option<bool>,
    pub public_network_access: Option<String>,
    pub key_creation_time: KeyCreationTime,
    pub allow_cross_tenant_replication: bool,
    pub private_endpoint_connections: Vec<SerdeValue>,
    pub minimum_tls_version: String,
    pub allow_blob_public_access: bool,
    pub allow_shared_key_access: Option<bool>,
    pub large_file_shares_state: Option<String>,
    pub network_acls: NetworkAcls,
    pub supports_https_traffic_only: bool,
    pub encryption: Encryption,
    pub access_tier: Option<String>,
    pub provisioning_state: String,
    pub creation_time: String,
    pub primary_endpoints: PrimaryEndpoints,
    pub primary_location: String,
    pub status_of_primary: String,
    pub secondary_location: Option<String>,
    pub status_of_secondary: Option<String>,
    pub secondary_endpoints: Option<SecondaryEndpoints>,
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
    pub ipv6rules: Vec<SerdeValue>,
    pub bypass: String,
    pub virtual_network_rules: Vec<SerdeValue>,
    pub ip_rules: Vec<SerdeValue>,
    pub default_action: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Encryption {
    pub require_infrastructure_encryption: Option<bool>,
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
    pub dfs: Option<String>,
    pub web: Option<String>,
    pub blob: String,
    pub queue: String,
    pub table: String,
    pub file: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecondaryEndpoints {
    pub dfs: String,
    pub web: String,
    pub blob: String,
    pub queue: String,
    pub table: String,
}
