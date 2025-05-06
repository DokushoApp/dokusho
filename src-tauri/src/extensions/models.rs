// src-tauri/src/extensions/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    #[serde(default)]
    pub nsfw: bool,
    #[serde(default)]
    pub source_type: String,
    #[serde(default)]
    pub source_path: String,
    pub api: ExtensionApi,
    #[serde(default)]
    pub icon: Option<String>,
    #[serde(default)]
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtensionApi {
    pub search: ApiEndpoint,
    pub manga_details: ApiEndpoint,
    pub chapter_list: ApiEndpoint,
    pub page_list: ApiEndpoint,
    pub cover_art: ApiEndpoint,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiEndpoint {
    pub url: String,
    pub method: String,
    pub response_type: String,
    #[serde(default)]
    pub headers: Option<serde_json::Value>,
    #[serde(default)]
    pub params: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ExtensionCollection {
    pub extensions: Vec<Extension>,
    pub last_updated: String,
}