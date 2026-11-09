import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import type { AppStatus, Installation, InstallProgress, Release } from "./launcher.types";

// Thin wrappers over the commands in src-tauri/src/commands.rs.

export const listApps = () => invoke<AppStatus[]>("list_apps");

export const latestRelease = (id: string) => invoke<Release | null>("latest_release", { id });

export const installApp = (id: string) => invoke<Installation>("install_app", { id });

export const uninstallApp = (id: string) => invoke<void>("uninstall_app", { id });

export const launchApp = (id: string) => invoke<void>("launch_app", { id });

export const onInstallProgress = (
  handler: (progress: InstallProgress) => void,
): Promise<UnlistenFn> =>
  listen<InstallProgress>("install-progress", (event) => handler(event.payload));

/** Whether `a` is a newer `major.minor.patch` than `b` (pre-release tags are ignored). */
export function isNewer(a: string, b: string): boolean {
  const parse = (version: string) => version.split("-")[0]!.split(".").map(Number);
  const [left, right] = [parse(a), parse(b)];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

/** Matches `InstallKind` in src-tauri/src/self_install.rs: how the launcher itself is installed. */
export type LauncherInstallKind = "installer" | "appimage" | "package" | "script";

export const launcherInstallKind = () => invoke<LauncherInstallKind>("launcher_install_kind");

/** The one-line Linux install (and update) command. */
export const launcherInstallCommand = () => invoke<string>("launcher_install_command");

/** Opens a terminal running the install command. */
export const runInstallInTerminal = () => invoke<void>("run_install_in_terminal");
