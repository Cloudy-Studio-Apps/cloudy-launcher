// The commands the frontend calls (src/launcher/launcher-api.ts).

use serde::Serialize;
use tauri::AppHandle;

use crate::catalog::{self, CatalogApp};
use crate::install::{self, Installation};
use crate::release::{self, Release};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    #[serde(flatten)]
    app: &'static CatalogApp,
    installed: Option<Installation>,
}

/// Every app in the catalog and whether it's installed. Local only: no network.
#[tauri::command]
pub fn list_apps(handle: AppHandle) -> Vec<AppStatus> {
    catalog::APPS
        .iter()
        .map(|app| AppStatus {
            app,
            installed: install::find(&handle, app),
        })
        .collect()
}

#[tauri::command]
pub async fn latest_release(id: String) -> Result<Option<Release>, String> {
    release::latest(catalog::find(&id)?).await
}

/// Installs the latest release, or updates to it. Emits `install-progress` while downloading.
#[tauri::command]
pub async fn install_app(handle: AppHandle, id: String) -> Result<Installation, String> {
    let app = catalog::find(&id)?;
    let release = release::latest(app)
        .await?
        .ok_or("There's no release of this app for your system yet.")?;
    install::install(&handle, app, &release).await
}

#[tauri::command]
pub async fn uninstall_app(handle: AppHandle, id: String) -> Result<(), String> {
    install::uninstall(&handle, catalog::find(&id)?).await
}

#[tauri::command]
pub fn launch_app(handle: AppHandle, id: String) -> Result<(), String> {
    let app = catalog::find(&id)?;
    let installation = install::find(&handle, app).ok_or("The app isn't installed.")?;
    install::launch(&installation.path)
}
