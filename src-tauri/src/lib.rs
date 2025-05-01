mod library;
mod extensions;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,

            // Library Commands
            library::import_manga_folder,
            library::import_manga_cbz,
            library::delete_manga,

            // Extensions Commands
            extensions::validate_extension_repo,
            extensions::validate_extension_repo_url,
            extensions::create_extensions_from_repo,
            extensions::create_extensions_from_url,
            extensions::get_extensions_list,
            extensions::delete_extension_repo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
