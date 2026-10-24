import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { SealLogoProps } from "./seal-logo.types";

// The mascot — a "foca watona" (chubby spotted seal) peeking over a canvas.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS_FULL: [cx: number, cy: number, rx: number, ry: number][] = [
  [24, 15.5, 1.6, 1.1],
  [31, 12.6, 1.2, 0.8],
  [38.5, 14, 1.8, 1.2],
  [45, 19, 1.3, 1],
  [18.6, 20.5, 1.2, 0.9],
  [28.5, 17.8, 0.9, 0.7],
  [42, 17, 0.8, 0.6],
];
const SPOTS_MARK = SPOTS_FULL.slice(0, 4);

export function SealLogo({ size = 32, variant = "full", className, title }: SealLogoProps) {
  const id = useId();
  const furId = `${id}-fur`;
  const isMark = variant === "mark";
  const ink = isMark ? 2.4 : 1.6;
  const spots = isMark ? SPOTS_MARK : SPOTS_FULL;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={furId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--seal-300)" }} />
          <stop offset="75%" style={{ stopColor: "var(--seal-100)" }} />
        </linearGradient>
      </defs>

      {/* Seal body (its lower half hides behind the canvas) */}
      <ellipse
        cx="32"
        cy="28"
        rx="20"
        ry="16.5"
        fill={`url(#${furId})`}
        className="stroke-seal-900"
        strokeWidth={ink}
      />
      {spots.map(([cx, cy, rx, ry]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="fill-seal-400" />
      ))}

      {/* Blush cheeks */}
      <ellipse cx="19.5" cy="26" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />
      <ellipse cx="44.5" cy="26" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />

      {/* Closed, content eyes */}
      <path
        d="M21.5 22.5q3-3 6 0M36.5 22.5q3-3 6 0"
        fill="none"
        className="stroke-seal-900"
        strokeWidth={ink}
      />

      {/* Puffy muzzle, nose and ω mouth */}
      <path
        d="M32 26.2c-1-1.6-5.6-1.6-6 1.4-.3 2.4 2.6 3.4 4.4 2.6.8-.3 1.3-.8 1.6-1.3.3.5.8 1 1.6 1.3 1.8.8 4.7-.2 4.4-2.6-.4-3-5-3-6-1.4z"
        className="fill-seal-50 stroke-seal-900"
        strokeWidth={ink * 0.8}
      />
      <ellipse cx="32" cy="25.9" rx="1.7" ry="1.15" className="fill-seal-900" />

      {/* Canvas */}
      <rect
        x="8"
        y="33"
        width="48"
        height="25"
        rx="1.5"
        className="fill-white stroke-seal-900"
        strokeWidth={ink}
      />
      {!isMark && (
        <>
          <path
            d="M15 50c4-6 8-6 11-2s7 4 11-1"
            fill="none"
            className="stroke-ice-500"
            strokeWidth="2.2"
          />
          <circle cx="45" cy="44" r="3" className="fill-blush-300" />
        </>
      )}

      {/* Flippers resting on the canvas edge */}
      <ellipse
        cx="17.5"
        cy="34.5"
        rx="4.6"
        ry="2.6"
        transform="rotate(-18 17.5 34.5)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
      <ellipse
        cx="46.5"
        cy="34.5"
        rx="4.6"
        ry="2.6"
        transform="rotate(18 46.5 34.5)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
    </svg>
  );
}
