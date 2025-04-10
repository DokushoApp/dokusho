use std::fs;
use std::path::Path;
use tauri::Manager;
use tauri::{Runtime, AppHandle};
use serde::{Serialize, Deserialize};
use nanoid::nanoid;

#[derive(Debug, Deserialize)]
struct MangaInput {
    title: String,
    path: String,
    category: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn import_manga_folder<R: Runtime>(app: AppHandle<R>,manga_input: MangaInput) {
    println!("{:?}, {:?}", manga_input.title, manga_input.category);
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string());
    let folder_dir = Path::new(manga_input.path.as_str());

    println!("{:?}", app_data_dir);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, import_manga_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
