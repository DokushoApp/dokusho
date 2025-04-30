use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionRepository {
    pub manifest: Manifest,
    pub extensions: Vec<Extension>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
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
    pub api: ExtensionApi,
    // Add other fields as needed
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionApi {
    pub search: ApiEndpoint,
    pub manga_details: ApiEndpoint,
    pub chapter_list: ApiEndpoint,
    pub page_list: ApiEndpoint,
    // Add other endpoints as needed
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub url: String,
    pub method: String,
    pub response_type: String,
    // Add other fields as needed
}