import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Download, ExternalLink, Play, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@shared/ui/components/ui/badge";
import { Button } from "@shared/ui/components/ui/button";
import { Card } from "@shared/ui/components/ui/card";
import { cn } from "@shared/ui/lib/utils";
import { AppLogo } from "./app-logo";
import { useAppsStore } from "./apps-store";
import { isNewer } from "./launcher-api";
import type { AppCardProps } from "./app-card.types";

type Tone = "idle" | "busy" | "ready" | "update" | "error";

const DOT: Record<Tone, string> = {
  idle: "bg-subtle-foreground",
  busy: "bg-primary animate-pulse",
  ready: "bg-success",
  update: "bg-accent",
  error: "bg-destructive",
};

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function AppCard({ app }: AppCardProps) {
  const release = useAppsStore((s) => s.releases[app.id]);
  const task = useAppsStore((s) => s.tasks[app.id]);
  const progress = useAppsStore((s) => s.progress[app.id]);
  const error = useAppsStore((s) => s.errors[app.id]);
  const checking = useAppsStore((s) => s.checking);
  const { install, uninstall, launch } = useAppsStore.getState();

  // Uninstalling takes a second click on the same button.
  const [confirmUninstall, setConfirmUninstall] = useState(false);
  useEffect(() => {
    if (!confirmUninstall) return;
    const timer = setTimeout(() => setConfirmUninstall(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmUninstall]);

  const { installed } = app;
  const updateAvailable =
    !!installed?.managed &&
    !!installed.version &&
    !!release &&
    isNewer(release.version, installed.version);
  const busy = task !== undefined;

  const downloadShare =
    progress?.phase === "downloading" && progress.total
      ? progress.downloaded / progress.total
      : undefined;

  let status: string;
  let tone: Tone = "idle";
  if (task === "installing") {
    tone = "busy";
    if (downloadShare !== undefined)
      status = `Downloading… ${Math.round(downloadShare * 100)}% of ${megabytes(progress!.total!)}`;
    else status = installed ? "Updating…" : "Installing…";
  } else if (task === "uninstalling") [tone, status] = ["busy", "Uninstalling…"];
  else if (task === "launching") [tone, status] = ["busy", "Opening…"];
  else if (updateAvailable) [tone, status] = ["update", `Version ${release.version} is ready`];
  else if (installed)
    [tone, status] = ["ready", installed.managed ? "Up to date" : "Installed by your system"];
  else if (release === undefined && checking) [tone, status] = ["busy", "Checking for releases…"];
  else if (release) status = `Version ${release.version} · ${megabytes(release.size)}`;
  else status = "No release for your system yet";
  if (error) tone = "error";

  return (
    <Card className="group overflow-hidden transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-lifted">
      <div className="flex items-start gap-4 p-5">
        <AppLogo
          id={app.id}
          size={60}
          className="transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3"
        />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight">{app.name}</h3>
            {installed?.version && <Badge variant="secondary">v{installed.version}</Badge>}
            {updateAvailable && <Badge variant="accent">Update</Badge>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{app.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="View on GitHub"
          title="View on GitHub"
          className="-mt-1 -mr-2"
          onClick={() => void openUrl(`https://github.com/${app.repo}/releases`)}
        >
          <ExternalLink />
        </Button>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t bg-surface-sunken/60 px-5 py-3">
        {task === "installing" && <ProgressBar value={downloadShare} />}
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              "flex min-w-0 items-center gap-2 text-sm",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <span className={cn("size-2 shrink-0 rounded-full", DOT[tone])} />
            <span className="truncate" title={error ?? status}>
              {error ?? status}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {installed?.managed && !busy && (
              <Button
                variant={confirmUninstall ? "destructive" : "ghost"}
                size={confirmUninstall ? "sm" : "icon"}
                aria-label="Uninstall"
                title="Uninstall"
                onClick={() => {
                  if (!confirmUninstall) return setConfirmUninstall(true);
                  setConfirmUninstall(false);
                  void uninstall(app.id);
                }}
              >
                <Trash2 />
                {confirmUninstall && "Uninstall"}
              </Button>
            )}
            {updateAvailable && (
              <Button variant="accent" disabled={busy} onClick={() => void install(app.id)}>
                <RefreshCw />
                Update
              </Button>
            )}
            {installed ? (
              <Button
                variant={updateAvailable ? "outline" : "default"}
                disabled={busy}
                onClick={() => void launch(app.id)}
              >
                <Play />
                Open
              </Button>
            ) : (
              <Button disabled={busy || !release} onClick={() => void install(app.id)}>
                <Download />
                Install
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** A determinate bar for `value` in 0..1, or a sliding one when it's unknown. */
function ProgressBar({ value }: { value: number | undefined }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      {value === undefined ? (
        <div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary" />
      ) : (
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      )}
    </div>
  );
}
