use crate::error::{Errors, ErrorResponse};
use std::fmt;
use anyhow::Error;
use reqwest::Body;
use tauri::ipc::InvokeError;
use crate::azure::{CreateContainerBody, NewStorageData};

impl fmt::Display for ErrorResponse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.error.message)
    }
}

impl From<ErrorResponse> for InvokeError {
    fn from(error: ErrorResponse) -> Self {
        InvokeError::from_anyhow(Error::msg(error.error.message))
    }
}

impl From<reqwest::Error> for ErrorResponse {
    fn from(err: reqwest::Error) -> Self {
        ErrorResponse {
            error: Errors {
                code: "Request Failed".to_string(),
                message: err.to_string(),
            }
        }
    }
}

impl From<NewStorageData> for Body {
    fn from(data: NewStorageData) -> Self {
        let json = serde_json::to_string(&data).expect("Failed to serialize NewStorageData");
        Body::from(json)
    }
}

impl From<CreateContainerBody> for Body {
    fn from(value: CreateContainerBody) -> Self {
        let json = serde_json::to_string(&value).expect("Failed to serialize CreateContainerBody");
        Body::from(json)
    }
}