use tauri::{AppHandle, Runtime};
use crate::library::models::MangaInput;
use crate::library::models::Manga;
use crate::library::service;

#[tauri::command]
pub fn delete_manga(path: &str) -> Result<(), String> {
    service::delete_manga(path)
}

#[tauri::command]
pub async fn import_manga_folder<R: Runtime>(
    app: AppHandle<R>,
    manga_input: MangaInput,
) -> Result<Manga, String> {
    service::import_manga_folder(app, manga_input)
}

#[tauri::command]
pub async fn import_manga_cbz<R: Runtime>(
    app: AppHandle<R>,
    manga_input: MangaInput,
) -> Result<Manga, String> {
    service::import_manga_cbz(app, manga_input).await
}