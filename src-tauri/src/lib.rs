mod azure;
mod error;
mod my_impl;
mod helper;

use crate::helper::{load_file, get_subscriptions, get_storages, create_storage, get_shared_key, storage::{list_container, create_container, put_blob, generate_sas}};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![load_file, get_subscriptions, get_storages, create_storage, get_shared_key, list_container, create_container, put_blob, generate_sas])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

