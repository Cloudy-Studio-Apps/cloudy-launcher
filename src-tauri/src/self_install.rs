// How the launcher itself is installed, and running its Linux install script in a terminal.
// The frontend uses these to decide whether "Update and restart" can work (src/launcher/self-update-store.ts).

use serde::Serialize;

/// The one-line install (and update) command for Linux. Keep in sync with install.sh's header.
pub const INSTALL_COMMAND: &str = "curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum InstallKind {
    /// The Windows NSIS installer: the updater replaces it in place.
    Installer,
    /// Run as an AppImage: the updater replaces the file.
    Appimage,
    /// Installed by the system's package manager (the Arch package, in /usr): pacman owns it, so
    /// updating means installing the new package from the release page.
    Package,
    /// Anything else on Linux (a dev build, a copied binary): the updater can't replace it, so
    /// updating goes through the install script, which switches it to the AppImage.
    Script,
}

#[tauri::command]
pub fn launcher_install_kind() -> InstallKind {
    if cfg!(windows) {
        InstallKind::Installer
    } else if std::env::var_os("APPIMAGE").is_some() {
        InstallKind::Appimage
    } else if std::env::current_exe().is_ok_and(|exe| exe.starts_with("/usr")) {
        InstallKind::Package
    } else {
        InstallKind::Script
    }
}

#[tauri::command]
pub fn launcher_install_command() -> &'static str {
    INSTALL_COMMAND
}

/// Opens a terminal running the install script, so the user sees what it does. Fails when no
/// known terminal is installed; the frontend then asks to paste the command instead.
#[tauri::command]
pub fn run_install_in_terminal() -> Result<(), String> {
    #[cfg(not(target_os = "linux"))]
    {
        Err("The install script is for Linux.".into())
    }
    #[cfg(target_os = "linux")]
    {
        linux::open_terminal(&format!(
            "{INSTALL_COMMAND}; echo; read -rp 'Press Enter to close this window. '"
        ))
    }
}

#[cfg(target_os = "linux")]
mod linux {
    use std::process::{Command, Stdio};

    /// Terminals in order of preference, with the arguments that come before `bash -c <script>`.
    const TERMINALS: &[(&str, &[&str])] = &[
        ("x-terminal-emulator", &["-e"]),
        ("ptyxis", &["--"]),
        ("kgx", &["--"]),
        ("gnome-terminal", &["--"]),
        ("konsole", &["-e"]),
        ("xfce4-terminal", &["-x"]),
        ("mate-terminal", &["-x"]),
        ("tilix", &["-e"]),
        ("kitty", &[]),
        ("alacritty", &["-e"]),
        ("wezterm", &["start", "--"]),
        ("foot", &[]),
        ("ghostty", &["-e"]),
        ("xterm", &["-e"]),
    ];

    pub fn open_terminal(script: &str) -> Result<(), String> {
        // The user's own choice first, when it's one we know how to call.
        let preferred = std::env::var("TERMINAL").ok();
        let ordered = preferred
            .iter()
            .filter_map(|name| TERMINALS.iter().find(|(terminal, _)| terminal == name))
            .chain(TERMINALS.iter());

        for (terminal, args) in ordered {
            let spawned = Command::new(terminal)
                .args(*args)
                .args(["bash", "-c", script])
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn();
            if spawned.is_ok() {
                return Ok(());
            }
        }
        Err("No terminal found. Copy the command and run it in your terminal.".into())
    }
}
