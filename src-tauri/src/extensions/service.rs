use tauri::{AppHandle, State};
use tauri_plugin_http::reqwest;
use tauri::Manager;
use std::fs;
use chrono::Utc;
use crate::extensions::models::{Extension, ExtensionCollection};

// Validate an extension file
pub async fn validate_extension_file(path: &str) -> Result<Extension, String> {
    println!("Validating extension file: {}", path);
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read file: {}", err))?;

    // Try to parse the JSON
    let extension: Extension = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

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

    // First get the text content
    let text = response
        .text()
        .await
        .map_err(|err| format!("Failed to read response: {}", err))?;

    // Then parse the text as JSON
    let extension: Extension = serde_json::from_str(&text)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the extension
    validate_extension(&extension)?;

    Ok(extension)
}

// Add an extension to the collection
pub async fn add_extension(
    app: State<'_, AppHandle>,
    extension: Extension,
) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    // Create extensions directory if it doesn't exist
    if !extensions_dir.exists() {
        fs::create_dir_all(&extensions_dir).map_err(|err| err.to_string())?;
    }

    // Load existing extensions
    let collection_path = extensions_dir.join("extensions.json");
    let mut collection = if collection_path.exists() {
        let content = fs::read_to_string(&collection_path).map_err(|err| err.to_string())?;
        serde_json::from_str::<ExtensionCollection>(&content).unwrap_or_else(|_| ExtensionCollection {
            extensions: Vec::new(),
            last_updated: Utc::now().to_rfc3339(),
        })
    } else {
        ExtensionCollection {
            extensions: Vec::new(),
            last_updated: Utc::now().to_rfc3339(),
        }
    };

    // Check if extension already exists
    let existing_index = collection.extensions.iter().position(|e| e.id == extension.id);
    if let Some(index) = existing_index {
        // Update existing extension
        collection.extensions[index] = extension;
    } else {
        // Add new extension
        collection.extensions.push(extension);
    }

    // Update last_updated timestamp
    collection.last_updated = Utc::now().to_rfc3339();

    // Save the updated collection
    let json = serde_json::to_string_pretty(&collection).map_err(|err| err.to_string())?;
    fs::write(collection_path, json).map_err(|err| err.to_string())?;

    Ok(())
}

// Remove an extension from the collection
pub async fn remove_extension(
    app: State<'_, AppHandle>,
    extension_id: &str,
) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");
    let collection_path = extensions_dir.join("extensions.json");

    if !collection_path.exists() {
        return Err("Extension collection file does not exist".to_string());
    }

    // Load existing extensions
    let content = fs::read_to_string(&collection_path).map_err(|err| err.to_string())?;
    let mut collection = serde_json::from_str::<ExtensionCollection>(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Find and remove the extension
    let initial_len = collection.extensions.len();
    collection.extensions.retain(|e| e.id != extension_id);

    if collection.extensions.len() == initial_len {
        return Err(format!("Extension with ID {} not found", extension_id));
    }

    // Update last_updated timestamp
    collection.last_updated = Utc::now().to_rfc3339();

    // Save the updated collection
    let json = serde_json::to_string_pretty(&collection).map_err(|err| err.to_string())?;
    fs::write(collection_path, json).map_err(|err| err.to_string())?;

    Ok(())
}

// Get all extensions
pub async fn get_all_extensions(
    app: State<'_, AppHandle>,
) -> Result<ExtensionCollection, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");
    let collection_path = extensions_dir.join("extensions.json");

    if !collection_path.exists() {
        return Ok(ExtensionCollection {
            extensions: Vec::new(),
            last_updated: Utc::now().to_rfc3339(),
        });
    }

    // Load existing extensions
    let content = fs::read_to_string(&collection_path).map_err(|err| err.to_string())?;
    let collection = serde_json::from_str::<ExtensionCollection>(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    Ok(collection)
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
fn validate_api_endpoint(endpoint: &crate::extensions::models::ApiEndpoint, name: &str) -> Result<(), String> {
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