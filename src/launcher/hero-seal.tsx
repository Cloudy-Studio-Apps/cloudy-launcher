import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@shared/ui/lib/utils";
import {
  Glasses,
  Magnifier,
  Sparkle,
  SpeechBubble,
  SweatDrop,
} from "@shared/ui/mascot/mascot-props";
import type { FlipperPose, SealMood } from "@shared/ui/mascot/mascot.types";
import { SealScene } from "@shared/ui/mascot/seal-scene";
import type { HeroSealProps, HeroSealState } from "./hero-seal.types";

interface Meme {
  mood: SealMood;
  left?: FlipperPose;
  right?: FlipperPose;
  /** Bubble text, ≤ 5 characters. */
  says: string;
  color: string;
  front?: ReactNode;
  /** CSS animation for the whole seal. */
  animate?: string;
}

/** The foca watona reacting to what the launcher is doing. */
const MEMES: Record<HeroSealState, Meme> = {
  checking: {
    mood: "focused",
    right: "out",
    says: "hmm?",
    color: "var(--ice-700)",
    front: <Magnifier x={103} y={56} scale={0.9} />,
    animate: "animate-seal-hop",
  },
  update: {
    mood: "happy",
    left: "up",
    right: "up",
    says: "new!!",
    color: "var(--blush-600)",
    front: (
      <>
        <Sparkle x={14} y={30} scale={1.2} />
        <Sparkle x={24} y={16} scale={0.8} color="var(--blush-400)" />
        <Sparkle x={104} y={44} scale={0.9} />
      </>
    ),
    animate: "animate-seal-hop",
  },
  // "Deal with it": everything is up to date.
  "up-to-date": {
    mood: "sleepy",
    says: "chill",
    color: "var(--seal-800)",
    front: <Glasses kind="sun" />,
  },
  fresh: {
    mood: "happy",
    left: "up",
    says: "hi!",
    color: "var(--ice-700)",
  },
};

/** Clicking the seal plays one of these, for fun. */
const EXTRAS: Meme[] = [
  {
    mood: "sleepy",
    says: "bruh",
    color: "var(--seal-700)",
    front: <SweatDrop x={78} y={40} />,
  },
  {
    mood: "happy",
    left: "up",
    right: "up",
    says: "yay!",
    color: "var(--blush-600)",
    front: <Sparkle x={18} y={26} scale={1.1} />,
    animate: "animate-seal-hop",
  },
  { mood: "sleepy", says: "zzz", color: "var(--lilac-600)" },
  { mood: "focused", left: "hold", right: "hold", says: "uwu", color: "var(--blush-600)" },
  {
    mood: "focused",
    says: "B)",
    color: "var(--seal-800)",
    front: <Glasses kind="reading" />,
  },
];

export function HeroSeal({ state }: HeroSealProps) {
  const [extra, setExtra] = useState<number | null>(null);
  useEffect(() => {
    if (extra === null) return;
    const timer = setTimeout(() => setExtra(null), 2500);
    return () => clearTimeout(timer);
  }, [extra]);

  const meme = extra === null ? MEMES[state] : EXTRAS[extra]!;

  return (
    <button
      type="button"
      title="Boop the seal"
      aria-label="Boop the seal"
      className="group relative shrink-0 cursor-pointer outline-none"
      onClick={() => setExtra((current) => ((current ?? -1) + 1) % EXTRAS.length)}
    >
      {/* Keyed so each new meme pops in; the hop lives on the inner scene so the two animations don't clash. */}
      <div
        key={meme.says}
        className="animate-in transition-transform duration-300 zoom-in-95 fade-in group-hover:scale-105 group-active:scale-95"
      >
        <SealScene
          mood={meme.mood}
          left={meme.left}
          right={meme.right}
          front={
            <>
              {meme.front}
              <SpeechBubble text={meme.says} color={meme.color} x={98} y={18} scale={1.35} />
            </>
          }
          className={cn("w-44 origin-bottom", meme.animate)}
        />
      </div>
    </button>
  );
}
