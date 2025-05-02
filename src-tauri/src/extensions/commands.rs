// src-tauri/src/extensions/commands.rs
use tauri::{AppHandle, Runtime};
use crate::extensions::models::{Extension, ExtensionCollection};
use crate::extensions::service;

#[tauri::command]
pub async fn validate_extension_file(path: &str) -> Result<Extension, String> {
    service::validate_extension_file(path).await
}

#[tauri::command]
pub async fn validate_extension_url(url: &str) -> Result<Extension, String> {
    service::validate_extension_url(url).await
}

#[tauri::command]
pub async fn add_extension<R: Runtime>(
    app: AppHandle<R>,
    extension: Extension,
) -> Result<(), String> {
    service::add_extension(app, extension).await
}

#[tauri::command]
pub async fn remove_extension<R: Runtime>(
    app: AppHandle<R>,
    extension_id: String,
) -> Result<(), String> {
    service::remove_extension(app, &extension_id).await
}

#[tauri::command]
pub async fn get_all_extensions<R: Runtime>(
    app: AppHandle<R>,
) -> Result<ExtensionCollection, String> {
    service::get_all_extensions(app).await
}