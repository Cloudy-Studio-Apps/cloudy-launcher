import { useEffect, useState } from "react";

import { cn } from "@shared/ui/lib/utils";
import headsetSeal from "./assets/headset-seal.png";
import type { HeroSealProps, HeroSealState } from "./hero-seal.types";

/** What the seal says for each launcher state. */
const CAPTIONS: Record<HeroSealState, string> = {
  checking: "hmm, any updates?",
  update: "new version dropped!!",
  "up-to-date": "all good, just vibing",
  fresh: "hi! pick an app",
};

/** Clicking the seal cycles through these, for fun. */
const EXTRAS = ["bruh", "this slaps", "zzz…", "uwu", "gg ez", "one more song"];

/** Notes floating out of the headset, staggered so one is always rising. */
const NOTES = [
  { glyph: "♪", className: "-right-1 top-6", delay: "0s" },
  { glyph: "♫", className: "right-4 -top-1", delay: "0.8s" },
  { glyph: "♪", className: "-left-1 top-10", delay: "1.6s" },
];

/** The headset seal, bobbing its head to the music; faster while the launcher is busy checking. */
export function HeroSeal({ state }: HeroSealProps) {
  const [extra, setExtra] = useState<number | null>(null);
  useEffect(() => {
    if (extra === null) return;
    const timer = setTimeout(() => setExtra(null), 2500);
    return () => clearTimeout(timer);
  }, [extra]);

  const caption = extra === null ? CAPTIONS[state] : EXTRAS[extra]!;

  return (
    <button
      type="button"
      title="Boop the seal"
      aria-label="Boop the seal"
      className="group relative shrink-0 cursor-pointer pt-2 outline-none"
      onClick={() => setExtra((current) => ((current ?? -1) + 1) % EXTRAS.length)}
    >
      <div
        className={cn(
          "relative origin-bottom transition-transform group-hover:scale-105 group-active:scale-95",
          state === "checking" ? "animate-vibe-fast" : "animate-vibe",
        )}
      >
        <img
          src={headsetSeal}
          alt=""
          draggable={false}
          className="size-32 rounded-full bg-white object-cover shadow-lifted ring-4 ring-white select-none"
        />
        {NOTES.map((note) => (
          <span
            key={note.delay}
            aria-hidden
            className={cn(
              "pointer-events-none absolute animate-note text-xl font-bold text-ice-600 opacity-0",
              note.className,
            )}
            style={{ animationDelay: note.delay }}
          >
            {note.glyph}
          </span>
        ))}
      </div>

      {/* Speech bubble; keyed so each new caption pops in. */}
      <span
        key={caption}
        className="absolute -top-3 left-[calc(100%-1.5rem)] animate-in rounded-lg border-2 border-foreground bg-surface px-2.5 py-1 text-sm font-bold whitespace-nowrap text-foreground shadow-soft duration-300 zoom-in-90 fade-in"
      >
        {caption}
        <span className="absolute -bottom-[7px] left-3 size-3 rotate-45 border-r-2 border-b-2 border-foreground bg-surface" />
      </span>

      <div className="mx-auto mt-2 h-2 w-24 rounded-full bg-seal-900/15 blur-[2px]" />
    </button>
  );
}
