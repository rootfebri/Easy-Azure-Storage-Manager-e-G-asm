use crate::helper::{
    create_storage, get_shared_key, get_storages, get_subscriptions,
    storage::*,
};

mod azure;
mod cmd;
mod error;
mod helper;
mod my_impl;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
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
