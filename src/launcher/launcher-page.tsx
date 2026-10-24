import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button } from "@shared/ui/components/ui/button";
import { AppHeader } from "@shared/ui/layout/app-header";
import { PageContainer } from "@shared/ui/layout/page-container";
import { cn } from "@shared/ui/lib/utils";
import { SealScene } from "@shared/ui/mascot/seal-scene";
import { AppCard } from "./app-card";
import { HeroSeal } from "./hero-seal";
import { useAppsStore } from "./apps-store";
import { isNewer, onInstallProgress } from "./launcher-api";

export function LauncherPage() {
  const apps = useAppsStore((s) => s.apps);
  const checking = useAppsStore((s) => s.checking);
  const releases = useAppsStore((s) => s.releases);
  const { refresh, setProgress } = useAppsStore.getState();

  useEffect(() => {
    void refresh();
    const unlisten = onInstallProgress(setProgress);
    return () => void unlisten.then((stop) => stop());
  }, [refresh, setProgress]);

  const installedCount = apps.filter((app) => app.installed).length;
  const updateCount = apps.filter(({ id, installed }) => {
    const release = releases[id];
    return (
      installed?.managed &&
      installed.version &&
      release &&
      isNewer(release.version, installed.version)
    );
  }).length;

  let summary: string;
  if (checking) summary = "Looking for new versions…";
  else if (updateCount > 0)
    summary = `${updateCount} ${updateCount === 1 ? "update is" : "updates are"} ready to install.`;
  else if (installedCount > 0) summary = "Everything is up to date.";
  else summary = "Pick an app to get started.";

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        actions={
          <Button variant="ghost" size="sm" disabled={checking} onClick={() => void refresh()}>
            <RefreshCw className={cn(checking && "animate-spin")} />
            Check for updates
          </Button>
        }
      >
        <Wordmark />
      </AppHeader>

      <section className="relative overflow-hidden border-b bg-linear-to-b from-ice-100 to-background">
        <Clouds />
        <PageContainer className="relative flex items-center gap-12 pt-10 pb-6">
          <HeroSeal
            state={
              checking
                ? "checking"
                : updateCount > 0
                  ? "update"
                  : installedCount > 0
                    ? "up-to-date"
                    : "fresh"
            }
          />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tighter">Your Cloudy apps</h1>
            <p className="mt-1 text-md text-muted-foreground">{summary}</p>
            {apps.length > 0 && (
              <p className="mt-3 text-sm text-subtle-foreground">
                {installedCount} of {apps.length} installed
              </p>
            )}
          </div>
        </PageContainer>
      </section>

      <PageContainer as="main" className="flex-1 py-8">
        {apps.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading apps…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </PageContainer>

      <footer className="border-t">
        <PageContainer className="flex items-center justify-between gap-4 py-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <SealScene mood="happy" className="w-14" />
            Made with love by the foca watona
          </span>
          <span className="flex items-center gap-2">
            Created by
            <img src="/darkredgm_logo.png" alt="" width={18} height={18} />
            <span className="font-semibold text-foreground">DarkRedGM</span>
          </span>
        </PageContainer>
      </footer>
    </div>
  );
}

/** Soft clouds drifting behind the hero. Decorative. */
function Clouds() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 960 200"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full fill-white"
    >
      <g opacity="0.9">
        <ellipse cx="760" cy="70" rx="70" ry="22" />
        <ellipse cx="720" cy="58" rx="34" ry="24" />
        <ellipse cx="785" cy="52" rx="40" ry="28" />
      </g>
      <g opacity="0.7">
        <ellipse cx="900" cy="140" rx="60" ry="18" />
        <ellipse cx="880" cy="128" rx="30" ry="20" />
        <ellipse cx="920" cy="124" rx="34" ry="22" />
      </g>
      <g opacity="0.5">
        <ellipse cx="560" cy="150" rx="44" ry="12" />
        <ellipse cx="572" cy="142" rx="24" ry="14" />
      </g>
    </svg>
  );
}
