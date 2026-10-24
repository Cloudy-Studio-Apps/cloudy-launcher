// Rust installs and launches the apps; the frontend only shows them.
mod catalog;
mod commands;
mod install;
mod release;
#[cfg(not(windows))]
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_apps,
            commands::latest_release,
            commands::install_app,
            commands::uninstall_app,
            commands::launch_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
