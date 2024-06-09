use crate::error::ErrorResponse;
use reqwest::header::HeaderMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SharedKeyResponse {
    pub keys: Vec<Key>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Key {
    pub creation_time: String,
    pub key_name: String,
    pub value: String,
    pub permissions: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_shared_key(
    access_token: String,
    url: String,
) -> Result<SharedKeyResponse, ErrorResponse> {
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    headers.insert("Content-Length", "0".parse().unwrap());

    let response = client
        .post(url)
        .bearer_auth(access_token.clone())
        .headers(headers)
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if response.status().is_success() {
        Ok(response.json::<SharedKeyResponse>().await?)
    } else {
        let error_msg: ErrorResponse = response.json().await?;
        Err(error_msg)
    }
}
