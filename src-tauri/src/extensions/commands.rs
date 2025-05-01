use tauri::AppHandle;
use crate::extensions::service;

// Validate an extension repository from a local file
#[tauri::command]
pub async fn validate_extension_repo(path: &str) -> Result<bool, String> {
    service::validate_extension_repo(path).await
}

// Validate an extension repository from a URL
#[tauri::command]
pub async fn validate_extension_repo_url(url: &str) -> Result<bool, String> {
    service::validate_extension_repo_url(url).await
}

// Create a new extension repository from a local file
#[tauri::command]
pub async fn create_extensions_from_repo(
    app_handle: AppHandle,
    path: &str,
    name: Option<String>,
) -> Result<String, String> {
    service::create_extensions_from_repo(app_handle, path, name).await
}

// Create a new extension repository from a URL
#[tauri::command]
pub async fn create_extensions_from_url(
    app_handle: AppHandle,
    url: &str,
    name: Option<String>,
) -> Result<String, String> {
    service::create_extensions_from_url(app_handle, url, name).await
}

// Get a list of all installed extensions
#[tauri::command]
pub async fn get_extensions_list(
    app_handle: AppHandle,
) -> Result<String, String> {
    service::get_extensions_list(app_handle).await
}

// Delete an extension repository
#[tauri::command]
pub async fn delete_extension_repo(
    app_handle: AppHandle,
    id: String,
) -> Result<(), String> {
    service::delete_extension_repo(app_handle, id).await
}