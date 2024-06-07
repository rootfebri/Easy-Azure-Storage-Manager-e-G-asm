use serde::Serialize;

#[derive(Serialize)]
pub struct LoadedFiles {
    pub file: String,
    pub status: String,
    pub url: String,
}

#[tauri::command]
pub fn load_file() -> Vec<LoadedFiles> {
    rfd::FileDialog::new()
        .add_filter("", &["html"])
        .pick_files()
        .unwrap()
        .iter()
        .map(|f| {
            LoadedFiles {
                file: f.to_str().unwrap().to_string(),
                status: "Loaded".to_string(),
                url: "".to_string()
            }
        })
        .collect()
}
