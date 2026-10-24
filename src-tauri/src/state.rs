// What the launcher installed itself (Linux): `installed.json` in the app data folder.
// On Windows the installer's uninstall key in the registry is the record instead (see install.rs).

use std::collections::HashMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Default, Serialize, Deserialize)]
pub struct Installed {
    pub apps: HashMap<String, InstalledApp>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct InstalledApp {
    pub version: String,
    pub path: PathBuf,
}

pub fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

fn file(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join("installed.json"))
}

pub fn load(app: &AppHandle) -> Installed {
    file(app)
        .ok()
        .and_then(|path| std::fs::read(path).ok())
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

pub fn save(app: &AppHandle, installed: &Installed) -> Result<(), String> {
    let path = file(app)?;
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_vec_pretty(installed).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}
