// Rust installs and launches the apps; the frontend only shows them.
mod catalog;
mod commands;
mod install;
mod release;
mod self_install;
#[cfg(not(windows))]
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // The launcher updates itself from its own GitHub releases (src/launcher/self-update).
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_apps,
            commands::latest_release,
            commands::install_app,
            commands::uninstall_app,
            commands::launch_app,
            self_install::launcher_install_kind,
            self_install::launcher_install_command,
            self_install::run_install_in_terminal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
