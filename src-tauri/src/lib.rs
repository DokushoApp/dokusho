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
            extensions::validate_extension_file,
            extensions::validate_extension_url,
            extensions::add_extension,
            extensions::remove_extension,
            extensions::get_all_extensions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
