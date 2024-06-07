use crate::azure::StorageList;
use crate::error::ErrorResponse;

#[tauri::command(rename_all = "snake_case")]
pub async fn get_storages(subscription_id: String, access_token: String) -> Result<StorageList, ErrorResponse> {
    let url = format!("https://management.azure.com/subscriptions/{}/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01", subscription_id);
    let client_builder = reqwest::Client::new();

    let response = client_builder
        .get(url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(ErrorResponse::from)?;
    if response.status().is_success() {
        Ok(response.json::<StorageList>().await?)
    } else {
        let error_msg: ErrorResponse = response.json().await?;
        Err(error_msg)
    }
}