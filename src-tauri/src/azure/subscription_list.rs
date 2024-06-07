use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct SubscriptionList {
    #[serde(rename = "value")]
    pub value: Vec<Value>,

    #[serde(rename = "count")]
    pub count: Count,
}

#[derive(Serialize, Deserialize)]
pub struct Value {
    #[serde(rename = "promotions")]
    pub promotions: Vec<Promotion>,

    #[serde(rename = "displayName")]
    pub display_name: String,

    #[serde(rename = "tenantId")]
    pub tenant_id: String,

    #[serde(rename = "id")]
    pub id: String,

    #[serde(rename = "managedByTenants")]
    pub managed_by_tenants: Vec<Option<serde_json::Value>>,

    #[serde(rename = "state")]
    pub state: String,

    #[serde(rename = "subscriptionId")]
    pub subscription_id: String,

    #[serde(rename = "subscriptionPolicies")]
    pub subscription_policies: SubscriptionPolicies,

    #[serde(rename = "authorizationSource")]
    pub authorization_source: String,
}

#[derive(Serialize, Deserialize)]
pub struct Promotion {
    #[serde(rename = "category")]
    pub category: String,

    #[serde(rename = "endDateTime")]
    pub end_date_time: String,
}

#[derive(Serialize, Deserialize)]
pub struct SubscriptionPolicies {
    #[serde(rename = "spendingLimit")]
    pub spending_limit: String,

    #[serde(rename = "locationPlacementId")]
    pub location_placement_id: String,

    #[serde(rename = "quotaId")]
    pub quota_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct Count {
    #[serde(rename = "type")]
    pub count_type: String,

    #[serde(rename = "value")]
    pub value: i64,
}
