import { create } from "zustand";

import { installApp, latestRelease, launchApp, listApps, uninstallApp } from "./launcher-api";
import type { AppStatus, AppTask, InstallProgress, Release } from "./launcher.types";

interface AppsState {
  apps: AppStatus[];
  /** `undefined` while checking, `null` when the app has no release for this system. */
  releases: Record<string, Release | null | undefined>;
  tasks: Record<string, AppTask | undefined>;
  progress: Record<string, InstallProgress | undefined>;
  errors: Record<string, string | undefined>;
  checking: boolean;

  /** Reloads what's installed and checks every app's latest release. */
  refresh: () => Promise<void>;
  install: (id: string) => Promise<void>;
  uninstall: (id: string) => Promise<void>;
  launch: (id: string) => Promise<void>;
  setProgress: (progress: InstallProgress) => void;
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const useAppsStore = create<AppsState>((set, get) => {
  const setEntry = <K extends "releases" | "tasks" | "progress" | "errors">(
    key: K,
    id: string,
    value: AppsState[K][string],
  ) => set((state) => ({ [key]: { ...state[key], [id]: value } }));

  /** Runs one task on an app, recording its error and reloading the installed state after. */
  const run = async (id: string, task: AppTask, action: () => Promise<unknown>) => {
    if (get().tasks[id]) return;
    setEntry("tasks", id, task);
    setEntry("errors", id, undefined);
    try {
      await action();
    } catch (error) {
      setEntry("errors", id, message(error));
    } finally {
      setEntry("tasks", id, undefined);
      setEntry("progress", id, undefined);
      set({ apps: await listApps() });
    }
  };

  return {
    apps: [],
    releases: {},
    tasks: {},
    progress: {},
    errors: {},
    checking: false,

    refresh: async () => {
      set({ checking: true, errors: {} });
      const apps = await listApps();
      set({ apps, releases: {} });
      await Promise.all(
        apps.map(async ({ id }) => {
          try {
            setEntry("releases", id, await latestRelease(id));
          } catch (error) {
            setEntry("releases", id, null);
            setEntry("errors", id, message(error));
          }
        }),
      );
      set({ checking: false });
    },

    install: (id) => run(id, "installing", () => installApp(id)),
    uninstall: (id) => run(id, "uninstalling", () => uninstallApp(id)),
    launch: (id) => run(id, "launching", () => launchApp(id)),
    setProgress: (progress) => setEntry("progress", progress.id, progress),
  };
});
