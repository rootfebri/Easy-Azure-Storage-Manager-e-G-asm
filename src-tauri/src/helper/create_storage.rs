use crate::azure::new_storage_response;
use crate::azure::NewStorageData;
use crate::azure::SuccessResponse;
use crate::azure::SuccessResponse::{Accepted, Created};
use crate::error::ErrorResponse;
use reqwest::header::HeaderMap;
use reqwest::{Body, Client};

#[tauri::command(rename_all = "snake_case")]
pub async fn create_storage(
    data: NewStorageData,
    url: String,
    access_token: String,
) -> Result<SuccessResponse, ErrorResponse> {
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());

    let client = Client::new();
    let response = client
        .put(&url)
        .bearer_auth(access_token)
        .headers(headers)
        .body(Body::from(data))
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if response.status() == 202 || response.status() == 201 {
        let accepted = new_storage_response::Accepted {
            message: "processing".to_string(),
        };
        Ok(Accepted(accepted))
    } else if response.status() == 200 {
        let created_response: new_storage_response::Created =
            response.json().await.map_err(ErrorResponse::from)?;
        Ok(Created(created_response))
    } else {
        let error_msg: ErrorResponse = response.json().await?;
        Err(error_msg)
    }
}
