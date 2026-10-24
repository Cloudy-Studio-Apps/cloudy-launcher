// Finding, installing, uninstalling and launching apps.
//
// Windows: runs the app's NSIS installer silently (a per-user install, no admin prompt). The
//   registry's uninstall key tells where and which version is installed, so it also sees apps
//   installed by hand or updated by their own updater.
// Linux: keeps the AppImage in the launcher's data folder (`apps/<id>/<binary>.AppImage`) and records
//   it in installed.json. An app installed by the system (a pacman package in /usr/bin) is shown and
//   launched, but left to the package manager.

use std::path::{Path, PathBuf};

use base64::Engine;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::catalog::CatalogApp;
use crate::release::{self, Release};
#[cfg(not(windows))]
use crate::state;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Installation {
    /// `None` when it's unknown (a system package).
    pub version: Option<String>,
    /// The executable.
    pub path: PathBuf,
    /// Whether the launcher can update and uninstall it.
    pub managed: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Progress<'a> {
    id: &'a str,
    phase: &'a str,
    downloaded: u64,
    total: Option<u64>,
}

const PROGRESS_EVENT: &str = "install-progress";

fn emit_progress(handle: &AppHandle, progress: Progress) {
    let _ = handle.emit(PROGRESS_EVENT, progress);
}

// ── Finding ───────────────────────────────────────────────────────────────

#[cfg(windows)]
pub fn find(_handle: &AppHandle, app: &CatalogApp) -> Option<Installation> {
    use winreg::RegKey;
    use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

    let subkey = format!(
        r"Software\Microsoft\Windows\CurrentVersion\Uninstall\{}",
        app.name
    );
    [HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE]
        .into_iter()
        .find_map(|hive| {
            let key = RegKey::predef(hive).open_subkey(&subkey).ok()?;
            let version: Option<String> = key.get_value("DisplayVersion").ok();
            let uninstaller: String = key.get_value("UninstallString").ok()?;
            let dir = Path::new(uninstaller.trim_matches('"'))
                .parent()?
                .to_path_buf();
            let path = dir.join(format!("{}.exe", app.binary));
            path.exists().then_some(Installation {
                version,
                path,
                managed: true,
            })
        })
}

#[cfg(not(windows))]
pub fn find(handle: &AppHandle, app: &CatalogApp) -> Option<Installation> {
    if let Some(installed) = state::load(handle).apps.remove(app.id) {
        if installed.path.exists() {
            return Some(Installation {
                version: Some(installed.version),
                path: installed.path,
                managed: true,
            });
        }
    }
    let system = Path::new("/usr/bin").join(app.binary);
    system.exists().then_some(Installation {
        version: None,
        path: system,
        managed: false,
    })
}

// ── Downloading ───────────────────────────────────────────────────────────

async fn download(
    handle: &AppHandle,
    app: &CatalogApp,
    release: &Release,
) -> Result<Vec<u8>, String> {
    let client = release::client()?;
    let mut response = client
        .get(&release.download_url)
        .send()
        .await
        .and_then(|r| r.error_for_status())
        .map_err(|e| format!("Download failed: {e}"))?;

    let total = response.content_length();
    let mut data = Vec::with_capacity(total.unwrap_or(0) as usize);
    let mut last_emit = 0;
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|e| format!("Download failed: {e}"))?
    {
        data.extend_from_slice(&chunk);
        // Every 512 KiB, so a big download doesn't flood the frontend with events.
        if data.len() - last_emit >= 512 * 1024 {
            last_emit = data.len();
            emit_progress(
                handle,
                Progress {
                    id: app.id,
                    phase: "downloading",
                    downloaded: data.len() as u64,
                    total,
                },
            );
        }
    }

    if let Some(pubkey) = app.pubkey {
        let signature_url = release
            .signature_url
            .as_deref()
            .ok_or("The release has no signature for this download, so it wasn't installed.")?;
        let signature = client
            .get(signature_url)
            .send()
            .await
            .and_then(|r| r.error_for_status())
            .map_err(|e| format!("Couldn't download the signature: {e}"))?
            .text()
            .await
            .map_err(|e| e.to_string())?;
        verify(&data, pubkey, &signature)?;
    }
    Ok(data)
}

/// Checks a download against its Tauri updater signature. Both the key and the signature are
/// base64 of minisign's text format.
fn verify(data: &[u8], pubkey: &str, signature: &str) -> Result<(), String> {
    let decode = |text: &str| -> Result<String, String> {
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(text.trim())
            .map_err(|e| e.to_string())?;
        String::from_utf8(bytes).map_err(|e| e.to_string())
    };
    let key = minisign_verify::PublicKey::decode(&decode(pubkey)?).map_err(|e| e.to_string())?;
    let signature =
        minisign_verify::Signature::decode(&decode(signature)?).map_err(|e| e.to_string())?;
    key.verify(data, &signature, true)
        .map_err(|_| "The download doesn't match its signature, so it wasn't installed.".into())
}

// ── Installing ────────────────────────────────────────────────────────────

pub async fn install(
    handle: &AppHandle,
    app: &CatalogApp,
    release: &Release,
) -> Result<Installation, String> {
    let data = download(handle, app, release).await?;
    emit_progress(
        handle,
        Progress {
            id: app.id,
            phase: "installing",
            downloaded: data.len() as u64,
            total: Some(data.len() as u64),
        },
    );
    install_download(handle, app, release, &data).await
}

#[cfg(windows)]
async fn install_download(
    handle: &AppHandle,
    app: &CatalogApp,
    release: &Release,
    data: &[u8],
) -> Result<Installation, String> {
    let setup = std::env::temp_dir().join(format!("{}-{}-setup.exe", app.binary, release.version));
    tokio::fs::write(&setup, data)
        .await
        .map_err(|e| e.to_string())?;
    let status = tokio::process::Command::new(&setup)
        .arg("/S")
        .status()
        .await;
    let _ = tokio::fs::remove_file(&setup).await;
    let status = status.map_err(|e| format!("Couldn't run the installer: {e}"))?;
    if !status.success() {
        return Err(format!("The installer failed ({status})."));
    }
    find(handle, app).ok_or_else(|| "The installer finished, but the app wasn't found.".into())
}

#[cfg(not(windows))]
async fn install_download(
    handle: &AppHandle,
    app: &CatalogApp,
    release: &Release,
    data: &[u8],
) -> Result<Installation, String> {
    use std::os::unix::fs::PermissionsExt;

    let dir = state::data_dir(handle)?.join("apps").join(app.id);
    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| e.to_string())?;
    let path = dir.join(format!("{}.AppImage", app.binary));
    // Written next to it and renamed over it, so a running copy keeps working.
    let partial = path.with_extension("AppImage.part");
    tokio::fs::write(&partial, data)
        .await
        .map_err(|e| e.to_string())?;
    tokio::fs::set_permissions(&partial, std::fs::Permissions::from_mode(0o755))
        .await
        .map_err(|e| e.to_string())?;
    tokio::fs::rename(&partial, &path)
        .await
        .map_err(|e| e.to_string())?;

    let mut installed = state::load(handle);
    installed.apps.insert(
        app.id.to_owned(),
        state::InstalledApp {
            version: release.version.clone(),
            path: path.clone(),
        },
    );
    state::save(handle, &installed)?;
    Ok(Installation {
        version: Some(release.version.clone()),
        path,
        managed: true,
    })
}

// ── Uninstalling ──────────────────────────────────────────────────────────

#[cfg(windows)]
pub async fn uninstall(handle: &AppHandle, app: &CatalogApp) -> Result<(), String> {
    let installation = find(handle, app).ok_or("The app isn't installed.")?;
    let dir = installation
        .path
        .parent()
        .ok_or("Unknown install folder.")?;
    let status = tokio::process::Command::new(dir.join("uninstall.exe"))
        .arg("/S")
        .status()
        .await
        .map_err(|e| format!("Couldn't run the uninstaller: {e}"))?;
    if !status.success() {
        return Err(format!("The uninstaller failed ({status})."));
    }
    Ok(())
}

#[cfg(not(windows))]
pub async fn uninstall(handle: &AppHandle, app: &CatalogApp) -> Result<(), String> {
    let mut installed = state::load(handle);
    if installed.apps.remove(app.id).is_none() {
        return Err(
            "This copy wasn't installed by the launcher; remove it with your package manager."
                .into(),
        );
    }
    let dir = state::data_dir(handle)?.join("apps").join(app.id);
    if dir.exists() {
        tokio::fs::remove_dir_all(&dir)
            .await
            .map_err(|e| e.to_string())?;
    }
    state::save(handle, &installed)
}

// ── Launching ─────────────────────────────────────────────────────────────

pub fn launch(path: &Path) -> Result<(), String> {
    let mut command = std::process::Command::new(path);
    // When the launcher is itself an AppImage, its runtime's variables would leak into the app and
    // make it load the launcher's bundled libraries.
    if std::env::var_os("APPIMAGE").is_some() {
        for var in [
            "APPDIR",
            "APPIMAGE",
            "ARGV0",
            "OWD",
            "LD_LIBRARY_PATH",
            "GDK_PIXBUF_MODULE_FILE",
            "GIO_MODULE_DIR",
            "GTK_PATH",
            "GTK_DATA_PREFIX",
            "GTK_EXE_PREFIX",
            "GSETTINGS_SCHEMA_DIR",
        ] {
            command.env_remove(var);
        }
    }
    command
        .spawn()
        .map(drop)
        .map_err(|e| format!("Couldn't start the app: {e}"))
}
