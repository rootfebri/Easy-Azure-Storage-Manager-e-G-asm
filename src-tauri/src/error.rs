use serde::Deserialize;

#[derive(Deserialize)]
pub struct Errors {
    pub code: String,
    pub message: String,
}
#[derive(Deserialize)]
pub struct ErrorResponse {
    pub error: Errors,
}
