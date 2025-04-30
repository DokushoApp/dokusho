use tauri::{AppHandle, State};
use crate::extensions::service;

#[tauri::command]
pub async fn validate_extension_repo(path: &str) -> Result<bool, String> {
    service::validate_extension_repo(path).await
}

#[tauri::command]
pub async fn validate_extension_repo_url(url: &str) -> Result<bool, String> {
    service::validate_extension_repo_url(url).await
}

#[tauri::command]
pub async fn refresh_extension_repo(
    app: State<'_, AppHandle>,
    id: String,
    url: String,
    repo_type: String,
) -> Result<(), String> {
    service::refresh_extension_repo(app, id, url, repo_type).await
}