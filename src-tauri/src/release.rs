// The latest published GitHub release of an app, and its installer for this platform.

use serde::{Deserialize, Serialize};

use crate::catalog::CatalogApp;

/// The Tauri bundle the launcher installs: the NSIS installer on Windows, the AppImage on Linux.
const INSTALLER_SUFFIX: &str = if cfg!(windows) {
    "-setup.exe"
} else {
    ".AppImage"
};

#[derive(Deserialize)]
struct GithubRelease {
    tag_name: String,
    body: Option<String>,
    published_at: Option<String>,
    assets: Vec<GithubAsset>,
}

#[derive(Deserialize)]
struct GithubAsset {
    name: String,
    browser_download_url: String,
    size: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    pub version: String,
    pub notes: Option<String>,
    pub published_at: Option<String>,
    pub size: u64,
    #[serde(skip)]
    pub download_url: String,
    #[serde(skip)]
    pub signature_url: Option<String>,
}

pub fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(concat!("cloudy-launcher/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| e.to_string())
}

/// `None` when the app has no published release, or none with a build for this platform.
pub async fn latest(app: &CatalogApp) -> Result<Option<Release>, String> {
    let url = format!("https://api.github.com/repos/{}/releases/latest", app.repo);
    let response = client()?
        .get(url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|e| format!("Couldn't reach GitHub: {e}"))?;
    if response.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }
    if response.status() == reqwest::StatusCode::FORBIDDEN {
        return Err("GitHub's rate limit was reached. Try again in a few minutes.".into());
    }
    let release: GithubRelease = response
        .error_for_status()
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let Some(installer) = release
        .assets
        .iter()
        .find(|asset| asset.name.ends_with(INSTALLER_SUFFIX))
    else {
        return Ok(None);
    };
    let signature_name = format!("{}.sig", installer.name);
    let signature_url = release
        .assets
        .iter()
        .find(|asset| asset.name == signature_name)
        .map(|asset| asset.browser_download_url.clone());

    Ok(Some(Release {
        version: release.tag_name.trim_start_matches('v').to_owned(),
        notes: release.body.filter(|notes| !notes.trim().is_empty()),
        published_at: release.published_at,
        size: installer.size,
        download_url: installer.browser_download_url.clone(),
        signature_url,
    }))
}
