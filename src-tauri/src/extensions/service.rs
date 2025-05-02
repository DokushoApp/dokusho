// src-tauri/src/extensions/service.rs
use tauri::{AppHandle, Runtime};
use tauri::Manager;
use std::fs;
use std::path::Path;
use chrono::Utc;
use tauri_plugin_http::reqwest;

use crate::extensions::models::{Extension, ExtensionCollection, ApiEndpoint};

// Validate an extension file
pub async fn validate_extension_file(path: &str) -> Result<Extension, String> {
    println!("Validating extension file: {}", path);
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read file: {}", err))?;

    // Try to parse the JSON
    let mut extension: Extension = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Set source info for file-based extensions
    extension.source_type = "file".to_string();
    extension.source_path = path.to_string();
    extension.added_at = Utc::now().to_string();

    // Validate the extension
    validate_extension(&extension)?;

    Ok(extension)
}

// Validate an extension from URL
pub async fn validate_extension_url(url: &str) -> Result<Extension, String> {
    println!("Validating extension URL: {}", url);

    // Using tauri_plugin_http's reqwest Client
    let response = reqwest::get(url)
        .await
        .map_err(|err| format!("Failed to fetch URL: {}", err))?;

    // Check if the response is successful
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    // Get the text content
    let text = response
        .text()
        .await
        .map_err(|err| format!("Failed to read response: {}", err))?;

    // Parse the text as JSON
    let mut extension: Extension = serde_json::from_str(&text)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Set source info for URL-based extensions
    extension.source_type = "url".to_string();
    extension.source_path = url.to_string();
    extension.added_at = Utc::now().to_string();

    // Validate the extension
    validate_extension(&extension)?;

    Ok(extension)
}

// Add an extension
pub async fn add_extension<R: Runtime>(
    app: AppHandle<R>,
    extension: Extension,
) -> Result<(), String> {
    // Get app data directory
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    // Create extensions directory if it doesn't exist
    let extensions_dir = app_data_dir.join("extensions");
    fs::create_dir_all(&extensions_dir).map_err(|err| err.to_string())?;

    // Create filename based on extension ID
    let filename = format!("{}.json", extension.id);
    let extension_path = extensions_dir.join(filename);

    // Save the extension as a JSON file
    let json = serde_json::to_string_pretty(&extension)
        .map_err(|err| format!("Failed to serialize extension: {}", err))?;

    fs::write(extension_path, json)
        .map_err(|err| format!("Failed to write extension file: {}", err))?;

    Ok(())
}

// Remove an extension
pub async fn remove_extension<R: Runtime>(
    app: AppHandle<R>,
    extension_id: &str,
) -> Result<(), String> {
    // Get app data directory
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    // Create filename based on extension ID
    let filename = format!("{}.json", extension_id);
    let extension_path = extensions_dir.join(filename);

    // Check if the file exists
    if !extension_path.exists() {
        return Err(format!("Extension with ID {} not found", extension_id));
    }

    // Remove the file
    fs::remove_file(extension_path)
        .map_err(|err| format!("Failed to remove extension file: {}", err))?;

    Ok(())
}

// Get all extensions
pub async fn get_all_extensions<R: Runtime>(
    app: AppHandle<R>,
) -> Result<ExtensionCollection, String> {
    // Get app data directory
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    // Create directory if it doesn't exist
    if !extensions_dir.exists() {
        fs::create_dir_all(&extensions_dir).map_err(|err| err.to_string())?;
        return Ok(ExtensionCollection {
            extensions: Vec::new(),
            last_updated: Utc::now().to_string(),
        });
    }

    // Read all JSON files in the directory
    let mut extensions = Vec::new();
    let entries = fs::read_dir(&extensions_dir)
        .map_err(|err| format!("Failed to read extensions directory: {}", err))?;

    for entry in entries {
        let entry = entry.map_err(|err| format!("Failed to read directory entry: {}", err))?;
        let path = entry.path();

        // Only process JSON files
        if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
            match read_extension_from_file(&path) {
                Ok(extension) => extensions.push(extension),
                Err(err) => println!("Error reading extension from {}: {}", path.display(), err),
            }
        }
    }

    // Create and return the collection
    Ok(ExtensionCollection {
        extensions,
        last_updated: Utc::now().to_string(),
    })
}

// Helper function to read extension from file
fn read_extension_from_file(path: &Path) -> Result<Extension, String> {
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read extension file: {}", err))?;

    serde_json::from_str::<Extension>(&content)
        .map_err(|err| format!("Invalid JSON in extension file {}: {}", path.display(), err))
}

// Validate an extension's structure
fn validate_extension(extension: &Extension) -> Result<(), String> {
    // Validate required fields
    if extension.id.is_empty() {
        return Err("Extension ID cannot be empty".to_string());
    }
    if extension.name.is_empty() {
        return Err("Extension name cannot be empty".to_string());
    }
    if extension.version.is_empty() {
        return Err("Extension version cannot be empty".to_string());
    }
    if extension.author.is_empty() {
        return Err("Extension author cannot be empty".to_string());
    }

    // Validate API endpoints
    validate_api_endpoint(&extension.api.search, "search")?;
    validate_api_endpoint(&extension.api.manga_details, "manga_details")?;
    validate_api_endpoint(&extension.api.chapter_list, "chapter_list")?;
    validate_api_endpoint(&extension.api.page_list, "page_list")?;

    Ok(())
}

// Validate an API endpoint
fn validate_api_endpoint(endpoint: &ApiEndpoint, name: &str) -> Result<(), String> {
    if endpoint.url.is_empty() {
        return Err(format!("API endpoint '{}' URL cannot be empty", name));
    }

    let method = endpoint.method.to_uppercase();
    if !["GET", "POST", "PUT", "DELETE"].contains(&method.as_str()) {
        return Err(format!(
            "API endpoint '{}' has invalid method: {}. Must be GET, POST, PUT, or DELETE",
            name, method
        ));
    }

    let response_type = endpoint.response_type.to_lowercase();
    if !["json", "html", "text"].contains(&response_type.as_str()) {
        return Err(format!(
            "API endpoint '{}' has invalid response_type: {}. Must be json, html, or text",
            name, response_type
        ));
    }

    Ok(())
}