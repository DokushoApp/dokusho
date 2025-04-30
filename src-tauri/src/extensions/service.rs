use tauri::{AppHandle, State};
use tauri_plugin_http::reqwest;
use tauri::Manager;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

pub async fn validate_extension_repo(path: &str) -> Result<bool, String> {
    println!("Validating extension repo: {}", path);
    let content = fs::read_to_string(path)
        .map_err(|err| format!("Failed to read file: {}", err))?;

    // Try to parse the JSON
    let json: Value = serde_json::from_str(&content)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the schema
    validate_repo_schema(&json)
}

pub async fn validate_extension_repo_url(url: &str) -> Result<bool, String> {
    println!("Validating extension repo URL: {}", url);

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
    let json: Value = serde_json::from_str(&text)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the schema
    validate_repo_schema(&json)
}

pub async fn refresh_extension_repo(
    app: State<'_, AppHandle>,
    id: String,
    url: String,
    repo_type: String,
) -> Result<(), String> {
    println!("Refreshing extension repo: {} ({})", id, repo_type);

    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let extensions_dir = app_data_dir.join("extensions");

    // Create extensions directory if it doesn't exist
    if !extensions_dir.exists() {
        fs::create_dir_all(&extensions_dir).map_err(|err| err.to_string())?;
    }

    let repo_json = match repo_type.as_str() {
        "file" => {
            // Read the file content
            fs::read_to_string(&url).map_err(|err| format!("Failed to read file: {}", err))?
        }
        "url" => {
            // Using tauri_plugin_http's reqwest
            let response = reqwest::get(&url)
                .await
                .map_err(|err| format!("Failed to fetch URL: {}", err))?;

            // Check if the response is successful
            if !response.status().is_success() {
                return Err(format!("HTTP error: {}", response.status()));
            }

            // Get response text
            response
                .text()
                .await
                .map_err(|err| format!("Failed to read response: {}", err))?
        }
        _ => return Err(format!("Invalid repository type: {}", repo_type)),
    };

    // Parse and validate the JSON
    let json: Value = serde_json::from_str(&repo_json)
        .map_err(|err| format!("Invalid JSON: {}", err))?;

    // Validate the schema
    validate_repo_schema(&json)?;

    // Save or update the repository
    let repo_file_path = extensions_dir.join(format!("repo_{}.json", id));
    fs::write(&repo_file_path, &repo_json)
        .map_err(|err| format!("Failed to save repository: {}", err))?;

    // Process the extensions in the repository
    process_repo_extensions(&json, &extensions_dir).await?;

    println!("Successfully refreshed extension repo: {}", id);
    Ok(())
}

// Process extensions from a repository and save them
pub async fn process_repo_extensions(
    repo_json: &Value,
    extensions_dir: &PathBuf,
) -> Result<(), String> {
    if let Some(extensions) = repo_json.get("extensions").and_then(|v| v.as_array()) {
        for (index, extension) in extensions.iter().enumerate() {
            // Extract extension data
            let manifest = repo_json
                .get("manifest")
                .ok_or_else(|| "Repository missing manifest".to_string())?;

            // Create a combined JSON for this extension
            let mut extension_json = serde_json::Map::new();
            extension_json.insert("manifest".to_string(), manifest.clone());

            let mut extensions_array = Vec::new();
            extensions_array.push(extension.clone());
            extension_json.insert("extensions".to_string(), Value::Array(extensions_array));

            // Get extension ID or generate one
            let extension_id_string = match extension.get("id").and_then(|v| v.as_str()) {
                Some(id) => id.to_string(),
                None => format!("ext_{}", index),
            };

            // Save the extension file
            let extension_file_path = extensions_dir.join(format!("{}.json", extension_id_string));
            fs::write(
                &extension_file_path,
                Value::Object(extension_json).to_string(),
            )
                .map_err(|err| format!("Failed to save extension: {}", err))?;

            println!("Saved extension: {}", extension_id_string);
        }
    }

    Ok(())
}

// Validate the repository schema
pub fn validate_repo_schema(json: &Value) -> Result<bool, String> {
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
        return Err(format!(
            "Extension at index {} missing 'version' field",
            index
        ));
    }

    // Check for API object
    let api = extension
        .get("api")
        .ok_or_else(|| format!("Extension at index {} missing 'api' field", index))?;

    // Validate required API endpoints
    for endpoint in &["search", "manga_details", "chapter_list", "page_list"] {
        let endpoint_obj = api.get(endpoint).ok_or_else(|| {
            format!(
                "Extension at index {} missing required '{}' API endpoint",
                index, endpoint
            )
        })?;

        // Validate endpoint schema
        validate_endpoint_schema(endpoint_obj, endpoint, index)?;
    }

    Ok(true)
}

// Validate an API endpoint schema
fn validate_endpoint_schema(
    endpoint: &Value,
    endpoint_name: &str,
    extension_index: usize,
) -> Result<bool, String> {
    // Check required fields
    if !endpoint.get("url").is_some_and(|v| v.is_string()) {
        return Err(format!(
            "Extension at index {} missing 'url' in '{}' endpoint",
            extension_index, endpoint_name
        ));
    }

    if !endpoint.get("method").is_some_and(|v| v.is_string()) {
        return Err(format!(
            "Extension at index {} missing 'method' in '{}' endpoint",
            extension_index, endpoint_name
        ));
    }

    if !endpoint.get("response_type").is_some_and(|v| v.is_string()) {
        return Err(format!(
            "Extension at index {} missing 'responseType' in '{}' endpoint",
            extension_index, endpoint_name
        ));
    }

    // Validate method is a valid HTTP method
    let method = endpoint
        .get("method")
        .unwrap()
        .as_str()
        .unwrap()
        .to_uppercase();
    if !["GET", "POST", "PUT", "DELETE"].contains(&method.as_str()) {
        return Err(format!(
            "Extension at index {} has invalid 'method' in '{}' endpoint: {}",
            extension_index, endpoint_name, method
        ));
    }

    // Validate response_type is a supported type
    let response_type = endpoint
        .get("response_type")
        .unwrap()
        .as_str()
        .unwrap()
        .to_lowercase();
    if !["json", "html", "text"].contains(&response_type.as_str()) {
        return Err(format!(
            "Extension at index {} has invalid 'responseType' in '{}' endpoint: {}",
            extension_index, endpoint_name, response_type
        ));
    }

    Ok(true)
}