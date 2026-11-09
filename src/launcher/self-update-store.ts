import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { create } from "zustand";

import {
  launcherInstallCommand,
  launcherInstallKind,
  runInstallInTerminal,
  type LauncherInstallKind,
} from "./launcher-api";

// The launcher's own updates, through Tauri's updater: `plugins.updater` in tauri.conf.json points
// at this repo's `latest.json` on GitHub and holds the public key the download must be signed with.
// Only the Windows installer and the AppImage can be replaced in place (`canInstall`). Elsewhere
// on Linux the banner offers the install script (`script`) or the release page (`package`).

type Phase = "idle" | "available" | "downloading" | "restarting" | "error";

interface SelfUpdateState {
  /** The running launcher's version, `null` until loaded. */
  version: string | null;
  kind: LauncherInstallKind | null;
  /** The Linux install command (install.sh), for copying or running in a terminal. */
  installCommand: string | null;

  phase: Phase;
  update: Update | null;
  /** Download progress in 0..1, `undefined` when the size isn't known. */
  progress: number | undefined;
  error: string | null;
  /** The user chose "Later" for this version: don't show it again until the next start. */
  dismissed: string | null;

  /** Reads the version and how the launcher is installed. */
  load: () => Promise<void>;
  /** Looks for a newer launcher. Quiet: a failed check (offline, no release yet) shows nothing. */
  check: () => Promise<void>;
  /** Downloads and installs the update, then restarts the launcher (`canInstall` only). */
  install: () => Promise<void>;
  /** Opens a terminal running the install script (Linux). */
  runScript: () => Promise<void>;
  dismiss: () => void;
}

/** Whether Tauri's updater can replace this install in place. */
export const canInstall = (kind: LauncherInstallKind | null) =>
  kind === "installer" || kind === "appimage";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const useSelfUpdateStore = create<SelfUpdateState>((set, get) => ({
  version: null,
  kind: null,
  installCommand: null,
  phase: "idle",
  update: null,
  progress: undefined,
  error: null,
  dismissed: null,

  load: async () => {
    const [version, kind, installCommand] = await Promise.all([
      getVersion(),
      launcherInstallKind(),
      launcherInstallCommand(),
    ]);
    set({ version, kind, installCommand });
  },

  check: async () => {
    // Dev builds have no release to compare with.
    if (import.meta.env.DEV || !["idle", "available"].includes(get().phase)) return;
    try {
      const update = await check();
      set(update ? { phase: "available", update } : { phase: "idle", update: null });
    } catch {
      // Leave things as they are: the next check tries again.
    }
  },

  install: async () => {
    const { update, kind } = get();
    if (!update || !canInstall(kind) || get().phase === "downloading") return;
    set({ phase: "downloading", progress: undefined, error: null });
    let total: number | undefined;
    let downloaded = 0;
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") total = event.data.contentLength;
        else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          set({ progress: total ? downloaded / total : undefined });
        }
      });
      // On Windows the installer closes the launcher itself; elsewhere restart into the new one.
      set({ phase: "restarting" });
      await relaunch();
    } catch (error) {
      set({ phase: "error", error: message(error) });
    }
  },

  runScript: async () => {
    set({ error: null });
    try {
      await runInstallInTerminal();
    } catch (error) {
      set({ error: message(error) });
    }
  },

  dismiss: () => set((state) => ({ dismissed: state.update?.version ?? null })),
}));
