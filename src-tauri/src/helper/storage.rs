use chrono::{Duration, Utc};
use reqwest::{Body, Client};

use crate::azure::{BodyForSas, ContainerCreated, CreateContainerBody, ListContainers, Props, SasToken};
use crate::error::ErrorResponse;

#[tauri::command(rename_all = "snake_case")]
pub async fn list_container(storage_name: String, subscription_id: String, resource_group_name: String, access_token: String) -> Result<ListContainers, ErrorResponse> {
    let url: String = format!("https://management.azure.com/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Storage/storageAccounts/{}/blobServices/default/containers?api-version=2023-01-01", subscription_id, resource_group_name, storage_name);

    let client = Client::new();
    let response = client
        .get(url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if response.status().is_success() {
        let list_containers: ListContainers = response.json().await?;
        Ok(list_containers)
    } else {
        let error_response: ErrorResponse = response.json().await?;
        Err(error_response)
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_container(access_token: String, sub: String, res: String, con: String) -> Result<ContainerCreated, ErrorResponse> {

    let url = format!("https://management.azure.com/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Storage/storageAccounts/{}/blobServices/default/containers/web?api-version=2023-01-01", sub, res, con);
    let client = Client::new();
    let response = client
        .put(url)
        .header("Content-Type", "application/json")
        .bearer_auth(access_token)
        .body(Body::from(CreateContainerBody {
            properties: Props {
                public_access: "Container".to_string()
            }
        }))
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if response.status().is_success() {
        let result: ContainerCreated = response.json().await?;
        Ok(result)
    } else {
        let error_message: ErrorResponse = response.json().await?;
        Err(error_message)
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn put_blob() {
    todo!()
}

#[tauri::command(rename_all = "snake_case")]
pub async fn generate_sas(storage: String, res: String, sub: String, access_token: String) -> Result<SasToken, ErrorResponse> {
    let client = Client::new();
    let (start, expire) = generate_signed_times(12, 1);
    let url = format!("https://management.azure.com/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Storage/storageAccounts/{}/ListAccountSas?api-version=2023-01-01", sub, res, storage);

    let request = client
        .post(&url)
        .bearer_auth(access_token)
        .header("Content-Type", "application/json")
        .body(Body::from(serde_json::to_string(&BodyForSas {
            signed_services: "bfqt".to_string(),
            signed_resource_types: "sco".to_string(),
            signed_permission: "acdlpruw".to_string(),
            signed_protocol: "http,https".to_string(),
            signed_start: start,
            signed_expiry: expire,
            key_to_sign: "key1".to_string(),
        }).unwrap()))
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if request.status().is_success() {
        Ok(request
            .json()
            .await?)
    } else {
        Err(request
            .json()
            .await?
        )
    }
}

fn generate_signed_times(hours_ahead: i64, days_ahead: i64) -> (String, String) {
    let now = Utc::now();
    let signed_start = now.to_rfc3339();

    let expiry_date = now
        + Duration::hours(hours_ahead)
        + Duration::days(days_ahead);
    let signed_expiry = expiry_date.to_rfc3339();

    (signed_start, signed_expiry)
}