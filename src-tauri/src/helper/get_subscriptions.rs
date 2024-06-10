use crate::azure::subscription_list::SubscriptionList;
use crate::error::ErrorResponse;

const SUBSCRIPTION_ENDPOINT: &str =
    "https://management.azure.com/subscriptions?api-version=2024-03-01";

#[tauri::command(rename_all = "snake_case")]
pub async fn get_subscriptions(access_token: String) -> Result<SubscriptionList, ErrorResponse> {
    let client = reqwest::Client::new();
    let response = client
        .get(SUBSCRIPTION_ENDPOINT)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if response.status().is_success() {
        let result = response.json::<SubscriptionList>().await.unwrap();
        Ok(result)
    } else {
        let error_msg: ErrorResponse = response.json().await?;
        Err(error_msg)
    }
}
