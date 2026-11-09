// The latest published GitHub release of an app, and its installer for this platform.
//
// Read from the release's `latest.json` (the file Tauri's updater uses, uploaded by every app's
// release workflow), not from GitHub's API: the API allows 60 requests an hour per IP address
// without signing in, which a few refreshes use up, while release downloads aren't limited.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::catalog::CatalogApp;

/// `latest.json`'s platform keys for the bundle the launcher installs, most specific first: the
/// NSIS installer on Windows, the AppImage on Linux.
const PLATFORMS: &[&str] = if cfg!(windows) {
    &["windows-x86_64-nsis", "windows-x86_64"]
} else {
    &["linux-x86_64-appimage", "linux-x86_64"]
};

#[derive(Deserialize)]
struct LatestJson {
    version: String,
    notes: Option<String>,
    pub_date: Option<String>,
    platforms: HashMap<String, Platform>,
}

#[derive(Deserialize)]
struct Platform {
    url: String,
    /// The download's minisign signature, base64 (what the `.sig` file holds).
    signature: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    pub version: String,
    pub notes: Option<String>,
    pub published_at: Option<String>,
    /// The installer's size in bytes, when GitHub says.
    pub size: Option<u64>,
    #[serde(skip)]
    pub download_url: String,
    #[serde(skip)]
    pub signature: String,
}

pub fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(concat!("cloudy-launcher/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| e.to_string())
}

/// `None` when the app has no published release, or none with a build for this platform.
pub async fn latest(app: &CatalogApp) -> Result<Option<Release>, String> {
    let client = client()?;
    let url = format!(
        "https://github.com/{}/releases/latest/download/latest.json",
        app.repo
    );
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Couldn't reach GitHub: {e}"))?;
    // No published release yet, or one made before releases had `latest.json`.
    if response.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }
    let latest: LatestJson = response
        .error_for_status()
        .map_err(|e| format!("Couldn't read the latest release: {e}"))?
        .json()
        .await
        .map_err(|e| format!("The latest release's latest.json isn't valid: {e}"))?;

    let Some(platform) = PLATFORMS.iter().find_map(|key| latest.platforms.get(*key)) else {
        return Ok(None);
    };

    Ok(Some(Release {
        version: latest.version.trim_start_matches('v').to_owned(),
        notes: latest.notes.filter(|notes| !notes.trim().is_empty()),
        published_at: latest.pub_date,
        size: size_of(&client, &platform.url).await,
        download_url: platform.url.clone(),
        signature: platform.signature.clone(),
    }))
}

/// The download's size, from a HEAD request (GitHub redirects it to the file's storage, which
/// answers with its length). `None` when that fails: the size is only shown, never needed.
async fn size_of(client: &reqwest::Client, url: &str) -> Option<u64> {
    let response = client
        .head(url)
        .send()
        .await
        .ok()?
        .error_for_status()
        .ok()?;
    response
        .headers()
        .get(reqwest::header::CONTENT_LENGTH)?
        .to_str()
        .ok()?
        .parse()
        .ok()
}
