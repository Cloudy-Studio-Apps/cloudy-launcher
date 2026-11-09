// The apps the launcher offers. Hard-coded for now: adding an app means adding an entry here.

use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogApp {
    pub id: &'static str,
    /// Tauri's `productName`: also the install folder and uninstall key of the Windows installer.
    pub name: &'static str,
    pub description: &'static str,
    /// `owner/name` on GitHub. The launcher installs the latest published release.
    pub repo: &'static str,
    /// The Cargo package name, which is the executable's name.
    #[serde(skip)]
    pub binary: &'static str,
    /// The updater's minisign public key (`plugins.updater.pubkey` in tauri.conf.json). When set,
    /// a download must match its `.sig` from the release before it's installed.
    #[serde(skip)]
    pub pubkey: Option<&'static str>,
}

/// The minisign public key every Cloudy app signs its releases with (the repos' `TAURI_SIGNING_PRIVATE_KEY`).
const CLOUDY_PUBKEY: &str = "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEZDOURDRkQ3NUQ4RjREODMKUldTRFRZOWQxOCtkL0drbG5pZmxhcFhpU2lVdXhaUXJyWHJCQ0lGM283VnhDcjVtUzRQWENhcUoK";

pub static APPS: &[CatalogApp] = &[
    CatalogApp {
        id: "cloudy-canvas",
        name: "Cloudy Canvas",
        description: "Boards and designs on one canvas.",
        repo: "Cloudy-Studio-Apps/cloudy-canvas",
        binary: "cloudy-canvas",
        pubkey: Some(CLOUDY_PUBKEY),
    },
    CatalogApp {
        id: "cloudy-pdf",
        name: "Cloudy PDF",
        description: "A minimalist PDF reader.",
        repo: "Cloudy-Studio-Apps/cloudy-pdf",
        binary: "cloudy-pdf",
        pubkey: Some(CLOUDY_PUBKEY),
    },
    CatalogApp {
        id: "cloudy-clip",
        name: "Cloudy Clip",
        description: "A simple video editor that agents can edit with you.",
        repo: "Cloudy-Studio-Apps/cloudy-clip",
        binary: "cloudy-clip",
        pubkey: Some(CLOUDY_PUBKEY),
    },
    CatalogApp {
        id: "cloudy-convert",
        name: "Cloudy Convert",
        description: "Convert footage for editing and save media from the web.",
        repo: "Cloudy-Studio-Apps/cloudy-convert",
        binary: "cloudy-convert",
        pubkey: Some(CLOUDY_PUBKEY),
    },
];

pub fn find(id: &str) -> Result<&'static CatalogApp, String> {
    APPS.iter()
        .find(|app| app.id == id)
        .ok_or_else(|| format!("Unknown app: {id}"))
}
