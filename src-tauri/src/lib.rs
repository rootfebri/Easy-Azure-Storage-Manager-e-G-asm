use std::path::PathBuf;
use tauri::{Manager, Wry};
use tauri_plugin_store::{with_store, StoreCollection};
use serde_json::{json, Value};

mod azure;
mod cmd;
mod error;
mod helper;
mod my_impl;

use crate::helper::{
    create_storage, get_shared_key, get_storages, get_subscriptions,
    storage::{create_container, generate_sas, list_container, put_blob},
};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

#[derive(Default, Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct AppState {
    pub client_id: String,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn to_json(&self) -> Value {
        serde_json::to_value(self).unwrap()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        // .plugin(tauri_plugin_window::init())
        // .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_dialog::init())
        // .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let stores = app.app_handle().state::<StoreCollection<Wry>>();
            let path = PathBuf::from("AppData.bin");

            with_store(app.app_handle().clone(), stores, path, |store| {
                let defaults = json!({"client_id": ""});
                let value = store.get("app-client-id").unwrap_or(&defaults);
                let app_state: AppState = serde_json::from_value(value.clone()).unwrap();
                if app_state.client_id.is_empty() {
                    app.dialog()
                    .message("Client ID is required to proceed.")
                    .kind(MessageDialogKind::Warning)
                    .title("No Client ID Detected! Go to setting to add and start uploading.")
                    .ok_button_label("Ok")
                    .show(|_| {})
                }
                Ok(())
            })?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_subscriptions,
            get_storages,
            create_storage,
            get_shared_key,
            list_container,
            create_container,
            put_blob,
            generate_sas
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
