use chrono::{Duration, SecondsFormat, Timelike, Utc};
use reqwest::{Body, Client};

use crate::azure::{
    BodyForSas, CreateContainerBody, ListContainers, Props, SasToken,
};
use crate::error::ErrorResponse;

/// Lists all containers in the specified storage account.
///
/// # Arguments
///
/// * `storage_name` - A string representing the name of the storage account.
/// * `subscription_id` - A string representing the Azure subscription ID.
/// * `resource_group_name` - A string representing the Azure resource group name.
/// * `access_token` - A string representing the Azure access token.
///
/// # Returns
///
/// * `Result<ListContainers, ErrorResponse>` - On success, returns a `ListContainers` object containing information about the containers.
///   On error, returns an `ErrorResponse` object containing details about the error.
#[tauri::command(rename_all = "snake_case")]
pub async fn list_container(
    storage_name: String,
    subscription_id: String,
    resource_group_name: String,
    access_token: String,
) -> Result<ListContainers, ErrorResponse> {
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
pub async fn create_container(access_token: String, subscription_id: String, resource_group_name: String, storage_name:String, container_name: String) -> Result<u16, ErrorResponse> {
    let url = format!("https://management.azure.com/subscriptions/{subscription_id}/resourceGroups/{resource_group_name}/providers/Microsoft.Storage/storageAccounts/{storage_name}/blobServices/default/containers/{container_name}?api-version=2023-01-01");

    let client = Client::new();
    let response = client
        .put(url)
        .header("Content-Type", "application/json")
        .bearer_auth(access_token)
        .body(Body::from(CreateContainerBody {
            properties: Props {
                public_access: "Container".to_string(),
            },
        }))
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    Ok(response.status().as_u16())
}

/// Uploads a file to a specified Azure Blob Storage URL.
///
/// # Arguments
///
/// * `full_path_to_file` - A string representing the full path to the file to be uploaded.
/// * `url` - A string representing the Azure Blob Storage URL where the file will be uploaded.
///
/// # Returns
///
/// * `u16` - The HTTP status code of the response from the server. A 2xx status code indicates success.
///
/// # Errors
///
/// This function will panic if there is an error opening or reading the file, or if there is an error
/// while making the HTTP request.
#[tauri::command(rename_all = "snake_case")]
pub async fn put_blob(full_path_to_file: String, url: String) -> u16 {
    use std::fs::File;
    use std::io::Read;


    let content_type = match full_path_to_file.as_str() {
        file if file.ends_with(".html") => "text/html",
        file if file.ends_with(".htm") => "text/html",
        file if file.ends_with(".css") => "text/css",
        file if file.ends_with(".js") => "application/javascript",
        file if file.ends_with(".json") => "application/json",
        file if file.ends_with(".wasm") => "application/wasm",
        file if file.ends_with(".png") => "image/png",
        file if file.ends_with(".jpg") => "image/jpeg",
        file if file.ends_with(".svg") => "image/svg+xml",
        file if file.ends_with(".txt") => "text/plain",
        file if file.ends_with(".xml") => "text/xml",
        file if file.ends_with(".pdf") => "application/pdf",
        file if file.ends_with(".mp4") => "video/mp4",
        file if file.ends_with(".mkv") => "video/x-matroska",
        file if file.ends_with(".avi") => "video/x-msvideo",
        file if file.ends_with(".mov") => "video/x-quicktime",
        file if file.ends_with(".wmv") => "video/x-ms-wmv",
        file if file.ends_with(".flv") => "video/x-flv",
        file if file.ends_with(".webm") => "video/x-webm",
        file if file.ends_with(".ogg") => "video/x-ogg",
        _ => "application/octet-stream",
    }.to_string();

    // Read the file into a buffer
    let mut file_buf = Vec::new();
    File::open(full_path_to_file.clone())
        .expect("error while opening file")
        .read_to_end(&mut file_buf)
        .expect("error while reading file");

    // Create a new HTTP client
    let client = Client::new();

    // Make the PUT request to the specified URL
    let response = client
        .put(url)
        .header("Content-Type", content_type)
        .header("x-ms-blob-type", "BlockBlob")
        .body(Body::from(file_buf))
        .send()
        .await
        .expect("error while uploading file");

    // Return the HTTP status code of the response
    let code = response.status().as_u16();
    code
}

/// Generates a Shared Access Signature (SAS) token for a specified Azure Storage account.
///
/// # Arguments
///
/// * `storage` - A string representing the name of the storage account.
/// * `res` - A string representing the Azure resource group name.
/// * `sub` - A string representing the Azure subscription ID.
/// * `access_token` - A string representing the Azure access token.
///
/// # Returns
///
/// * `Result<SasToken, ErrorResponse>` - On success, returns a `SasToken` object containing the generated SAS token.
///   On error, returns an `ErrorResponse` object containing details about the error.
///
/// # Errors
///
/// This function will return an error if there is an issue with the HTTP request, such as a network error or a
/// server error. It will also return an error if the server response is not successful (status code 2xx).
#[tauri::command(rename_all = "snake_case")]
pub async fn generate_sas(
    storage: String,
    res: String,
    sub: String,
    access_token: String,
) -> Result<SasToken, ErrorResponse> {
    let client = Client::new();
    let (start, expire) = generate_signed_times(2, 0);
    let url = format!("https://management.azure.com/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Storage/storageAccounts/{}/ListAccountSas?api-version=2023-01-01", sub, res, storage);

    let request = client
        .post(&url)
        .bearer_auth(access_token)
        .header("Content-Type", "application/json")
        .body(Body::from(
            serde_json::to_string(&BodyForSas {
                signed_services: "bfqt".to_string(),
                signed_resource_types: "sco".to_string(),
                signed_permission: "acdlpruw".to_string(),
                signed_protocol: "http,https".to_string(),
                signed_start: start,
                signed_expiry: expire,
                key_to_sign: "key1".to_string(),
            })
            .unwrap(),
        ))
        .send()
        .await
        .map_err(ErrorResponse::from)?;

    if request.status().is_success() {
        Ok(request.json().await?)
    } else {
        Err(request.json().await?)
    }
}

/// Generates a pair of start and expiry times for a SAS token, in RFC3339 format.
///
/// # Arguments
///
/// * `hours_ahead` - An integer representing the number of hours in the future from the current time that the SAS token should start being valid.
/// * `days_ahead` - An integer representing the number of days in the future from the current time that the SAS token should expire.
///
/// # Returns
///
/// * A tuple containing two strings:
///   - The first string is the start time in RFC3339 format.
///   - The second string is the expiry time in RFC3339 format.
///
/// # Examples
///
/// ```rust
/// use chrono::{Duration, Utc};
///
/// fn main() {
///     let (start, expiry) = generate_signed_times(12, 1);
///     println!("Start: {}, Expiry: {}", start, expiry);
/// }
/// ```
fn generate_signed_times(hours_ahead: i64, days_ahead: i64) -> (String, String) {
    let now = Utc::now();
    let signed_start = now
        .with_second(0)
        .unwrap()
        .with_nanosecond(0)
        .unwrap()
        .to_rfc3339_opts(SecondsFormat::Secs, true);

    let expiry_date = now + Duration::hours(hours_ahead) + Duration::days(days_ahead);
    let signed_expiry = expiry_date
        .with_second(0)
        .unwrap()
        .with_nanosecond(0)
        .unwrap()
        .to_rfc3339_opts(SecondsFormat::Secs, true);
    (signed_start, signed_expiry)
}
