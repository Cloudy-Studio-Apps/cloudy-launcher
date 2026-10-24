/** Matches `Installation` in src-tauri/src/install.rs. */
export interface Installation {
  /** `null` when it's unknown (a system package). */
  version: string | null;
  path: string;
  /** Whether the launcher can update and uninstall it (false for a system package). */
  managed: boolean;
}

/** Matches `AppStatus` in src-tauri/src/commands.rs (the catalog entry plus its installation). */
export interface AppStatus {
  id: string;
  name: string;
  description: string;
  repo: string;
  installed: Installation | null;
}

/** Matches `Release` in src-tauri/src/release.rs. */
export interface Release {
  version: string;
  notes: string | null;
  publishedAt: string | null;
  size: number;
}

/** The `install-progress` event. */
export interface InstallProgress {
  id: string;
  phase: "downloading" | "installing";
  downloaded: number;
  total: number | null;
}

export type AppTask = "installing" | "uninstalling" | "launching";
