use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use chrono;

// Validate an extension repository from a local file
pub async fn validate_extension_repo(path: &str) -> Result<bool, String> {
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read file: {}", err))?;

    // Parse the JSON
    let json: Value = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the schema
    validate_repo_schema(&json)
}

// Validate an extension repository from a URL
pub async fn validate_extension_repo_url(url: &str) -> Result<bool, String> {
    let response = reqwest::get(url)
        .await
        .map_err(|err| format!("Failed to fetch URL: {}", err))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let text = response
        .text()
        .await
        .map_err(|err| format!("Failed to read response: {}", err))?;

    // Parse the JSON
    let json: Value = serde_json::from_str(&text)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the schema
    validate_repo_schema(&json)
}

// Create a new extension repository from a local file
pub async fn create_extensions_from_repo(
    app_handle: AppHandle,
    path: &str,
    name: Option<String>,
) -> Result<String, String> {
    // Validate repository format
    validate_extension_repo(path).await?;

    // Get app data directory and create extensions directory if it doesn't exist
    let app_data_dir = app_handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    if !extensions_dir.exists() {
        fs::create_dir_all(&extensions_dir).map_err(|err| format!("Failed to create extensions directory: {}", err))?;
    }

    // Read the file content
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read file: {}", err))?;

    // Parse the JSON
    let repo_json: Value = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Get repository name (either provided or from the manifest)
    let repo_name = match name {
        Some(n) => n,
        None => {
            repo_json.get("manifest")
                .and_then(|m| m.get("name"))
                .and_then(|n| n.as_str())
                .unwrap_or("Unknown Repository")
                .to_string()
        }
    };

    // Generate a safe filename from the repo name
    let repo_id = format!("repo_{}", chrono::Utc::now().timestamp());
    let repo_filename = repo_id.clone();

    // Save the repository file
    let repo_file_path = extensions_dir.join(format!("{}.json", repo_filename));
    fs::write(&repo_file_path, &content)
        .map_err(|err| format!("Failed to save repository: {}", err))?;

    // Process and save individual extensions
    process_repo_extensions(&repo_json, &extensions_dir).await?;

    // Update extensions.json
    update_extensions_json(app_handle, |extensions_data| {
        // Add new repository to the array
        if let Some(repositories) = extensions_data.get_mut("repositories").and_then(|r| r.as_array_mut()) {
            repositories.push(json!({
                "id": repo_id,
                "name": repo_name,
                "type": "file",
                "url": repo_file_path.to_string_lossy().to_string(),
                "addedAt": chrono::Utc::now().to_rfc3339()
            }));
        } else {
            extensions_data["repositories"] = json!([{
                "id": repo_id,
                "name": repo_name,
                "type": "file",
                "url": repo_file_path.to_string_lossy().to_string(),
                "addedAt": chrono::Utc::now().to_rfc3339()
            }]);
        }

        Ok(())
    })?;

    // Return the repository ID
    Ok(repo_id)
}

// Create a new extension repository from a URL
pub async fn create_extensions_from_url(
    app_handle: AppHandle,
    url: &str,
    name: Option<String>,
) -> Result<String, String> {
    // Validate repository URL
    validate_extension_repo_url(url).await?;

    // Get app data directory and create extensions directory if it doesn't exist
    let app_data_dir = app_handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    if !extensions_dir.exists() {
        fs::create_dir_all(&extensions_dir).map_err(|err| format!("Failed to create extensions directory: {}", err))?;
    }

    // Fetch the repository content
    let response = reqwest::get(url)
        .await
        .map_err(|err| format!("Failed to fetch URL: {}", err))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let content = response
        .text()
        .await
        .map_err(|err| format!("Failed to read response: {}", err))?;

    // Parse the JSON
    let repo_json: Value = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Get repository name (either provided or from the manifest)
    let repo_name = match name {
        Some(n) => n,
        None => {
            repo_json.get("manifest")
                .and_then(|m| m.get("name"))
                .and_then(|n| n.as_str())
                .unwrap_or("Unknown Repository")
                .to_string()
        }
    };

    // Generate a safe filename from the repo name
    let repo_id = format!("repo_{}", chrono::Utc::now().timestamp());
    let repo_filename = repo_id.clone();

    // Save the repository file
    let repo_file_path = extensions_dir.join(format!("{}.json", repo_filename));
    fs::write(&repo_file_path, &content)
        .map_err(|err| format!("Failed to save repository: {}", err))?;

    // Process and save individual extensions
    process_repo_extensions(&repo_json, &extensions_dir).await?;

    // Update extensions.json
    update_extensions_json(app_handle, |extensions_data| {
        // Add new repository to the array
        if let Some(repositories) = extensions_data.get_mut("repositories").and_then(|r| r.as_array_mut()) {
            repositories.push(json!({
                "id": repo_id,
                "name": repo_name,
                "type": "url",
                "url": url,
                "addedAt": chrono::Utc::now().to_rfc3339()
            }));
        } else {
            extensions_data["repositories"] = json!([{
                "id": repo_id,
                "name": repo_name,
                "type": "url",
                "url": url,
                "addedAt": chrono::Utc::now().to_rfc3339()
            }]);
        }

        Ok(())
    })?;

    // Return the repository ID
    Ok(repo_id)
}

// Get a list of all installed extensions
pub async fn get_extensions_list(
    app_handle: AppHandle,
) -> Result<String, String> {
    // Get app data directory
    let app_data_dir = app_handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_json_path = app_data_dir.join("extensions.json");

    // If extensions.json doesn't exist yet, return an empty list
    if !extensions_json_path.exists() {
        return Ok(json!({
            "repositories": [],
            "extensions": [],
            "updated_at": chrono::Utc::now().to_rfc3339()
        }).to_string());
    }

    // Read extensions.json
    let json_str = fs::read_to_string(&extensions_json_path)
        .map_err(|err| format!("Failed to read extensions.json: {}", err))?;

    let mut extensions_data = serde_json::from_str::<Value>(&json_str)
        .map_err(|err| format!("Invalid extensions.json format: {}", err))?;

    // Ensure we have the required fields
    if !extensions_data.get("repositories").is_some_and(|r| r.is_array()) {
        extensions_data["repositories"] = json!([]);
    }

    // Create or update the extensions list by scanning the extensions directory
    let extensions_dir = app_data_dir.join("extensions");
    let mut all_extensions = Vec::new();

    if extensions_dir.exists() {
        // Read all extensions from the extensions directory
        for entry in fs::read_dir(&extensions_dir)
            .map_err(|err| format!("Failed to read extensions directory: {}", err))?
        {
            let entry = entry.map_err(|err| format!("Failed to read directory entry: {}", err))?;
            let path = entry.path();

            // Skip non-JSON files and repository files
            if path.is_file() &&
                path.extension().map_or(false, |ext| ext == "json") &&
                !path.file_name().unwrap().to_string_lossy().starts_with("repo_") {

                // Read and parse the extension file
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(ext_json) = serde_json::from_str::<Value>(&content) {
                        // Extract extension data
                        if let Some(extensions) = ext_json.get("extensions").and_then(|e| e.as_array()) {
                            for extension in extensions {
                                // Create a simplified extension info for the list
                                if let Some(id) = extension.get("id").and_then(|id| id.as_str()) {
                                    let ext_info = json!({
                                        "id": id,
                                        "name": extension.get("name").and_then(|name| name.as_str()).unwrap_or("Unknown Extension"),
                                        "version": extension.get("version").and_then(|ver| ver.as_str()).unwrap_or("0.0.0"),
                                        "description": extension.get("description").and_then(|desc| desc.as_str()).unwrap_or(""),
                                        "nsfw": extension.get("nsfw").and_then(|nsfw| nsfw.as_bool()).unwrap_or(false),
                                        "language": extension.get("language").and_then(|lang| lang.as_str()).unwrap_or("en"),
                                        "path": path.to_string_lossy().to_string(),
                                        "enabled": true // Default to enabled
                                    });

                                    all_extensions.push(ext_info);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Update the extensions array and timestamp
    extensions_data["extensions"] = json!(all_extensions);
    extensions_data["updated_at"] = json!(chrono::Utc::now().to_rfc3339());

    // Return the updated extensions data
    Ok(extensions_data.to_string())
}

// Delete an extension repository
pub async fn delete_extension_repo(
    app_handle: AppHandle,
    id: String,
) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");
    let repo_path = extensions_dir.join(format!("{}.json", id));

    // Check if the repository file exists
    if repo_path.exists() {
        // Delete the repository file
        fs::remove_file(&repo_path).map_err(|err| format!("Failed to delete repository file: {}", err))?;
    }

    // Update extensions.json
    update_extensions_json(app_handle, |extensions_data| {
        if let Some(repositories) = extensions_data.get_mut("repositories").and_then(|r| r.as_array_mut()) {
            // Remove the matching repository
            let index = repositories.iter().position(|repo| {
                repo.get("id").and_then(|i| i.as_str()) == Some(&id)
            });

            if let Some(pos) = index {
                repositories.remove(pos);
            }
        }
        Ok(())
    })?;

    Ok(())
}

// Process extensions from a repository and save them as individual files
async fn process_repo_extensions(
    repo_json: &Value,
    extensions_dir: &PathBuf,
) -> Result<(), String> {
    if let Some(extensions) = repo_json.get("extensions").and_then(|v| v.as_array()) {
        for extension in extensions.iter() {
            // Extract extension data
            let manifest = repo_json
                .get("manifest")
                .ok_or_else(|| "Repository missing manifest".to_string())?;

            // Get extension ID and name
            let extension_id = extension.get("id")
                .and_then(|v| v.as_str())
                .ok_or_else(|| "Extension missing 'id' field".to_string())?;

            let extension_name = extension.get("name")
                .and_then(|v| v.as_str())
                .unwrap_or("unknown-extension");

            // Create a URL-friendly filename
            let safe_filename = sanitize_filename(extension_name);

            // Create a combined JSON for this extension
            let mut extension_json = serde_json::Map::new();
            extension_json.insert("manifest".to_string(), manifest.clone());

            let mut extensions_array = Vec::new();
            extensions_array.push(extension.clone());
            extension_json.insert("extensions".to_string(), Value::Array(extensions_array));

            // Save the extension file
            let extension_file_path = extensions_dir.join(format!("{}-{}.json", safe_filename, extension_id));
            fs::write(
                &extension_file_path,
                serde_json::to_string_pretty(&Value::Object(extension_json))
                    .map_err(|err| format!("Failed to serialize extension: {}", err))?,
            )
                .map_err(|err| format!("Failed to save extension: {}", err))?;
        }
    }

    Ok(())
}

// Helper function to update the extensions.json file
fn update_extensions_json<F>(
    app_handle: AppHandle,
    update_fn: F,
) -> Result<(), String>
where
    F: FnOnce(&mut Value) -> Result<(), String>,
{
    let app_data_dir = app_handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_json_path = app_data_dir.join("extensions.json");

    // Read existing file or create a new one
    let mut extensions_data = if extensions_json_path.exists() {
        let json_str = fs::read_to_string(&extensions_json_path)
            .map_err(|err| format!("Failed to read extensions.json: {}", err))?;

        serde_json::from_str::<Value>(&json_str)
            .map_err(|err| format!("Invalid extensions.json format: {}", err))?
    } else {
        json!({
            "repositories": [],
            "extensions": [],
            "updated_at": chrono::Utc::now().to_rfc3339()
        })
    };

    // Apply the provided update function
    update_fn(&mut extensions_data)?;

    // Update the timestamp
    extensions_data["updated_at"] = json!(chrono::Utc::now().to_rfc3339());

    // Write back to file
    fs::write(
        &extensions_json_path,
        serde_json::to_string_pretty(&extensions_data)
            .map_err(|err| format!("Failed to serialize extensions data: {}", err))?
    ).map_err(|err| format!("Failed to write extensions.json: {}", err))?;

    Ok(())
}

// Helper function to sanitize a string for use as a filename
fn sanitize_filename(input: &str) -> String {
    // Replace characters that are not allowed in filenames
    let sanitized = input
        .chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            ' ' => '-', // Convert spaces to dashes
            c if c.is_ascii_alphanumeric() => c.to_ascii_lowercase(),
            _ => '_' // Replace any other characters with underscore
        })
        .collect::<String>();

    // Trim and ensure it's not empty
    let trimmed = sanitized.trim_matches(|c| c == '-' || c == '_');
    if trimmed.is_empty() {
        return "unknown".to_string();
    }

    trimmed.to_string()
}

// Validate the repository schema
fn validate_repo_schema(json: &Value) -> Result<bool, String> {
    // Check for manifest
    let manifest = json
        .get("manifest")
        .ok_or_else(|| "Repository missing manifest".to_string())?;

    // Validate manifest fields
    if !manifest.get("name").is_some_and(|v| v.is_string()) {
        return Err("Manifest missing 'name' field".to_string());
    }

    if !manifest.get("version").is_some_and(|v| v.is_string()) {
        return Err("Manifest missing 'version' field".to_string());
    }

    if !manifest.get("author").is_some_and(|v| v.is_string()) {
        return Err("Manifest missing 'author' field".to_string());
    }

    if !manifest.get("description").is_some_and(|v| v.is_string()) {
        return Err("Manifest missing 'description' field".to_string());
    }

    // Check for extensions array
    let extensions = json
        .get("extensions")
        .ok_or_else(|| "Repository missing extensions array".to_string())?
        .as_array()
        .ok_or_else(|| "Extensions must be an array".to_string())?;

    if extensions.is_empty() {
        return Err("Extensions array is empty".to_string());
    }

    // Validate each extension
    for (i, extension) in extensions.iter().enumerate() {
        validate_extension_schema(extension, i)?;
    }

    Ok(true)
}

// Validate an individual extension schema
fn validate_extension_schema(extension: &Value, index: usize) -> Result<bool, String> {
    // Check required fields
    if !extension.get("id").is_some_and(|v| v.is_string()) {
        return Err(format!("Extension at index {} missing 'id' field", index));
    }

    if !extension.get("name").is_some_and(|v| v.is_string()) {
        return Err(format!("Extension at index {} missing 'name' field", index));
    }

    if !extension.get("version").is_some_and(|v| v.is_string()) {
        return Err(format!("Extension at index {} missing 'version' field", index));
    }

    // Check for API object
    let api = extension
        .get("api")
        .ok_or_else(|| format!("Extension at index {} missing 'api' field", index))?;

    // Validate required API endpoints
    for endpoint in &["search", "manga_details", "chapter_list", "page_list"] {
        let endpoint_obj = api.get(endpoint).ok_or_else(|| {
            format!("Extension at index {} missing required '{}' API endpoint", index, endpoint)
        })?;

        // Basic endpoint validation
        if !endpoint_obj.get("url").is_some_and(|v| v.is_string()) {
            return Err(format!("Extension at index {} missing 'url' in '{}' endpoint", index, endpoint));
        }

        if !endpoint_obj.get("method").is_some_and(|v| v.is_string()) {
            return Err(format!("Extension at index {} missing 'method' in '{}' endpoint", index, endpoint));
        }

        if !endpoint_obj.get("response_type").is_some_and(|v| v.is_string()) {
            return Err(format!("Extension at index {} missing 'response_type' in '{}' endpoint", index, endpoint));
        }
    }

    Ok(true)
}