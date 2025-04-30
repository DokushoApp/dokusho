use chrono;
use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;
use tauri::{AppHandle, Runtime};
use zip::ZipArchive;

mod extensions;

#[derive(Debug, Deserialize)]
struct MangaInput {
    title: String,
    path: String,
    category: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Manga {
    id: String,
    title: String,
    path: String,
    category: String,
    cover: String,
    last_read: Option<String>,
    created_at: String,
    progress: u32,
    source: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn delete_manga(path: &str) {
    fs::remove_dir_all(path).ok();
}

#[tauri::command]
async fn import_manga_folder<R: Runtime>(
    app: AppHandle<R>,
    manga_input: MangaInput,
) -> Result<Manga, String> {
    // Generate a unique ID for the manga
    let id = nanoid!();

    // Get app data directory
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    // Create library directory if it doesn't exist
    let library_path = app_data_dir.join("library");
    fs::create_dir_all(&library_path).map_err(|err| err.to_string())?;

    // Create manga-specific directory
    let manga_dir = library_path.join(&id);
    fs::create_dir_all(&manga_dir).map_err(|err| err.to_string())?;

    // Source folder path
    let source_folder = Path::new(&manga_input.path);

    // Copy files from source to destination
    copy_folder_contents(source_folder, &manga_dir).map_err(|err| err.to_string())?;

    // Find suitable cover image
    let cover = find_cover_image(&manga_dir).unwrap_or_default();

    // Create manga struct
    let manga = Manga {
        id: id.clone(),
        title: manga_input.title,
        path: manga_dir
            .to_str()
            .ok_or("Failed to convert path to string")?
            .to_string(),
        category: manga_input.category,
        cover,
        last_read: None,
        created_at: chrono::Utc::now().to_string(),
        progress: 0,
        source: "local".to_string(),
    };

    // Save manga to library.json
    add_manga_to_library(&app, &manga).map_err(|err| err.to_string())?;

    Ok(manga)
}

#[tauri::command]
async fn import_manga_cbz<R: Runtime>(
    app: AppHandle<R>,
    manga_input: MangaInput,
) -> Result<Manga, String> {
    // Generate a unique ID for the manga
    let id = nanoid!();

    // Get app data directory
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    // Create library directory if it doesn't exist
    let library_path = app_data_dir.join("library");
    fs::create_dir_all(&library_path).map_err(|err| err.to_string())?;

    // Create manga-specific directory
    let manga_dir = library_path.join(&id);
    fs::create_dir_all(&manga_dir).map_err(|err| err.to_string())?;

    // Extract CBZ file to the manga directory
    extract_cbz_file(&manga_input.path, &manga_dir).map_err(|err| err.to_string())?;

    // Find suitable cover image
    let cover = find_cover_image(&manga_dir).unwrap_or_default();

    // Create manga struct
    let manga = Manga {
        id: id.clone(),
        title: manga_input.title,
        path: manga_dir
            .to_str()
            .ok_or("Failed to convert path to string")?
            .to_string(),
        category: manga_input.category,
        cover,
        last_read: None,
        created_at: chrono::Utc::now().to_string(),
        progress: 0,
        source: "local".to_string(),
    };

    add_manga_to_library(&app, &manga).map_err(|err| err.to_string())?;

    Ok(manga)
}

fn extract_cbz_file(cbz_path: &str, destination: &Path) -> Result<(), String> {
    // Open the CBZ file
    let file = fs::File::open(cbz_path).map_err(|e| format!("Failed to open CBZ file: {}", e))?;

    // Create a ZipArchive from the file
    let mut archive =
        ZipArchive::new(file).map_err(|e| format!("Failed to read CBZ as ZIP archive: {}", e))?;

    // Extract each file from the archive
    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Failed to access file in archive: {}", e))?;

        // Get the file name
        let file_name = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue, // Skip files with unsafe names
        };

        // Skip directories and non-image files
        if file.is_dir() {
            continue;
        }

        // Check if it's an image file
        let file_name_lower = file_name.to_string_lossy().to_lowercase();
        if !file_name_lower.ends_with(".jpg")
            && !file_name_lower.ends_with(".jpeg")
            && !file_name_lower.ends_with(".png")
            && !file_name_lower.ends_with(".webp")
        {
            continue;
        }

        // Create the destination path
        let dest_path = destination.join(file_name.file_name().unwrap());

        // Create a file to write to
        let mut outfile = fs::File::create(&dest_path)
            .map_err(|e| format!("Failed to create output file: {}", e))?;

        // Copy the file data
        std::io::copy(&mut file, &mut outfile)
            .map_err(|e| format!("Failed to write file data: {}", e))?;
    }

    Ok(())
}

// Helper function to add manga to library.json
fn add_manga_to_library<R: Runtime>(app: &AppHandle<R>, manga: &Manga) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let library_file = app_data_dir.join("library.json");

    // Read existing library or create a new one
    let mut library: Library = if library_file.exists() {
        let content = fs::read_to_string(&library_file).map_err(|err| err.to_string())?;
        serde_json::from_str(&content).unwrap_or_else(|_| Library { manga: Vec::new() })
    } else {
        Library { manga: Vec::new() }
    };

    // Add new manga
    library.manga.push(manga.clone());

    // Write back to file
    let json = serde_json::to_string_pretty(&library).map_err(|err| err.to_string())?;
    fs::write(library_file, json).map_err(|err| err.to_string())?;

    Ok(())
}

// Struct definition for Library
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Library {
    manga: Vec<Manga>,
}

// Helper function to copy folder contents
fn copy_folder_contents(source: &Path, destination: &Path) -> Result<(), std::io::Error> {
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let source_path = entry.path();
        let file_name = source_path.file_name().unwrap();
        let destination_path = destination.join(file_name);

        if file_type.is_file() {
            fs::copy(&source_path, &destination_path)?;
        }
    }
    Ok(())
}

// Function to find a suitable cover image in the manga directory
fn find_cover_image(manga_dir: &Path) -> Option<String> {
    let image_extensions = [".jpg", ".jpeg", ".png", ".webp"];
    let cover_keywords = ["cover", "front", "001", "page1", "page01", "0001"];

    // Try to find a file that looks like a cover
    if let Ok(entries) = fs::read_dir(manga_dir) {
        // First pass: look for files with cover keywords
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(file_name) = path.file_name() {
                    let file_name_str = file_name.to_string_lossy().to_lowercase();

                    // Check if filename contains cover keywords
                    if cover_keywords
                        .iter()
                        .any(|keyword| file_name_str.contains(keyword))
                        && image_extensions
                            .iter()
                            .any(|ext| file_name_str.ends_with(ext))
                    {
                        return path.to_str().map(|s| s.to_string());
                    }
                }
            }
        }
    }

    // Second pass: just take the first image file
    if let Ok(entries) = fs::read_dir(manga_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(file_name) = path.file_name() {
                    let file_name_str = file_name.to_string_lossy().to_lowercase();

                    if image_extensions
                        .iter()
                        .any(|ext| file_name_str.ends_with(ext))
                    {
                        return path.to_str().map(|s| s.to_string());
                    }
                }
            }
        }
    }
    None
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
            import_manga_folder,
            import_manga_cbz,
            delete_manga,

            extensions::validate_extension_repo,
            extensions::validate_extension_repo_url,
            extensions::refresh_extension_repo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
