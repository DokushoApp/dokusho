use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionRepository {
    pub manifest: Manifest,
    pub extensions: Vec<Extension>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub id: Option<String>,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub nsfw: Option<bool>,
    pub language: Option<String>,
    pub api: ExtensionApi,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionApi {
    pub search: ApiEndpoint,
    pub manga_details: ApiEndpoint,
    pub chapter_list: ApiEndpoint,
    pub page_list: ApiEndpoint,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub url: String,
    pub method: String,
    pub response_type: String,
    pub params: Option<serde_json::Value>,
    pub headers: Option<serde_json::Value>,
    pub parser: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionsData {
    pub repositories: Vec<RepositoryInfo>,
    pub extensions: Vec<ExtensionInfo>,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RepositoryInfo {
    pub id: String,
    pub name: String,
    pub r#type: String,  // "file" or "url"
    pub url: String,
    pub file_path: Option<String>,
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionInfo {
    pub id: String,
    pub repo_id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub nsfw: Option<bool>,
    pub language: Option<String>,
    pub path: String,
    pub enabled: bool,
}