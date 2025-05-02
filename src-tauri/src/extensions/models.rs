// src-tauri/src/extensions/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub nsfw: bool,
    pub source_type: String, // "file" or "url"
    pub source_path: String, // file path or URL
    pub api: ExtensionApi,
    pub icon: Option<String>,
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtensionApi {
    pub search: ApiEndpoint,
    pub manga_details: ApiEndpoint,
    pub chapter_list: ApiEndpoint,
    pub page_list: ApiEndpoint,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiEndpoint {
    pub url: String,
    pub method: String,
    pub response_type: String,
    pub headers: Option<serde_json::Value>,
    pub params: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ExtensionCollection {
    pub extensions: Vec<Extension>,
    pub last_updated: String,
}