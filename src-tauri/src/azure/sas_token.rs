use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyForSas {
    pub signed_services: String,
    pub signed_resource_types: String,
    pub signed_permission: String,
    pub signed_protocol: String,
    pub signed_start: String,
    pub signed_expiry: String,
    pub key_to_sign: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SasToken {
    pub account_sas_token: String
}