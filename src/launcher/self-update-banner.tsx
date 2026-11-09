import { openUrl } from "@tauri-apps/plugin-opener";
import { Check, Copy, Download, ExternalLink, RefreshCw, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { PageContainer } from "@shared/ui/layout/page-container";
import { ProgressBar } from "./progress-bar";
import { canInstall, useSelfUpdateStore } from "./self-update-store";

const RELEASES_URL = "https://github.com/Cloudy-Studio-Apps/cloudy-launcher/releases/latest";
/** How often a launcher left open looks for a new version. */
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

/**
 * Offers the launcher's own update under the header. Checks at start and every 6 hours.
 * The Windows installer and the AppImage update in place; another Linux install gets the install
 * script (copy it, or run it in a terminal); the Arch package gets the release page.
 */
export function SelfUpdateBanner() {
  const { kind, installCommand, phase, update, progress, error, dismissed } = useSelfUpdateStore();
  const { check, install, runScript, dismiss } = useSelfUpdateStore.getState();

  useEffect(() => {
    void check();
    const timer = window.setInterval(() => void check(), CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [check]);

  if (phase === "idle" || !update || dismissed === update.version) return null;

  // The in-place update failed: fall back to what works on this system.
  const failed = phase === "error";
  const inPlace = canInstall(kind) && !failed;
  const viaScript =
    installCommand !== null && (kind === "script" || (failed && kind === "appimage"));

  let title = `Cloudy Launcher ${update.version} is available.`;
  let detail = `You have ${update.currentVersion}.`;
  if (phase === "restarting") {
    title = `Restarting into Cloudy Launcher ${update.version}…`;
    detail = "";
  } else if (failed) {
    title = "Couldn't update the launcher.";
    detail = viaScript
      ? "Update it with the install command instead:"
      : "Download it from GitHub instead.";
  } else if (kind === "script") {
    detail =
      "This copy can't update itself. Run the install command once, and it will from then on:";
  } else if (kind === "package") {
    detail = "It was installed with your package manager: install the new package from GitHub.";
  }

  return (
    <div className="border-b bg-accent-soft text-accent-soft-foreground">
      <PageContainer className="flex flex-col gap-2.5 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 text-sm">
            <span className="font-semibold">{title}</span>{" "}
            <span
              className="text-muted-foreground"
              title={failed ? (error ?? undefined) : undefined}
            >
              {detail}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {phase === "available" && (
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Later
              </Button>
            )}
            {inPlace ? (
              <Button
                variant="accent"
                size="sm"
                disabled={phase !== "available"}
                onClick={() => void install()}
              >
                {phase === "available" ? <Download /> : <RefreshCw className="animate-spin" />}
                {phase === "available" ? "Update and restart" : "Updating…"}
              </Button>
            ) : viaScript ? (
              <Button variant="accent" size="sm" onClick={() => void runScript()}>
                <SquareTerminal />
                Run in terminal
              </Button>
            ) : (
              <Button variant="accent" size="sm" onClick={() => void openUrl(RELEASES_URL)}>
                <ExternalLink />
                Open release
              </Button>
            )}
          </div>
        </div>
        {phase === "downloading" && <ProgressBar value={progress} />}
        {viaScript && installCommand && <CommandLine command={installCommand} />}
        {viaScript && error && !failed && <p className="text-sm text-destructive">{error}</p>}
      </PageContainer>
    </div>
  );
}

/** The install command, selectable, with a copy button. */
function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex items-center gap-2 rounded-md border bg-surface-sunken py-1 pr-1 pl-3">
      <code
        className="min-w-0 flex-1 truncate font-mono text-xs text-foreground select-all"
        title={command}
      >
        {command}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigator.clipboard.writeText(command).then(() => setCopied(true))}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
