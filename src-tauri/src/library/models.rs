use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Library {
    pub manga: Vec<Manga>,
}

#[derive(Debug, Deserialize)]
pub struct MangaInput {
    pub title: String,
    pub path: String,
    pub category: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Manga {
    pub id: String,
    pub title: String,
    pub path: String,
    pub category: String,
    pub cover: String,
    pub last_read: Option<String>,
    pub created_at: String,
    pub progress: u32,
    pub source: String,
}