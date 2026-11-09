import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { ClipSealLogoProps } from "./clip-seal-logo.types";

// Cloudy Clip's mark: the same foca watona as SealLogo, peeking over a clapperboard.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [25, 14.6, 1.5, 1],
  [31.5, 12, 1.1, 0.8],
  [38.5, 13.4, 1.6, 1.1],
  [44, 18, 1.2, 0.9],
];

/** The clapper's diagonal stripes, as x offsets along the arm. */
const STRIPES = [12, 21, 30, 39, 48];

export function ClipSealLogo({ size = 32, className, title }: ClipSealLogoProps) {
  const id = useId();
  const furId = `${id}-fur`;
  const armId = `${id}-arm`;
  const ink = 1.6;

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
        <clipPath id={armId}>
          <rect x="12" y="33.5" width="40" height="5.5" rx="1" />
        </clipPath>
      </defs>

      {/* Seal body (its lower half hides behind the clapperboard) */}
      <ellipse
        cx="32"
        cy="25"
        rx="18"
        ry="15"
        fill={`url(#${furId})`}
        className="stroke-seal-900"
        strokeWidth={ink}
      />
      {SPOTS.map(([cx, cy, rx, ry]) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy - 1}
          rx={rx}
          ry={ry}
          className="fill-seal-400"
        />
      ))}

      {/* Blush cheeks */}
      <ellipse cx="20.5" cy="24" rx="2.6" ry="1.6" className="fill-blush-300" opacity={0.9} />
      <ellipse cx="43.5" cy="24" rx="2.6" ry="1.6" className="fill-blush-300" opacity={0.9} />

      {/* Closed, content eyes */}
      <path
        d="M22.5 20.5q2.8-2.8 5.6 0M35.9 20.5q2.8-2.8 5.6 0"
        fill="none"
        className="stroke-seal-900"
        strokeWidth={ink}
      />

      {/* Puffy muzzle and nose */}
      <path
        d="M32 24.4c-1-1.5-5.2-1.5-5.6 1.3-.3 2.2 2.4 3.2 4.1 2.4.8-.3 1.2-.7 1.5-1.2.3.5.7.9 1.5 1.2 1.7.8 4.4-.2 4.1-2.4-.4-2.8-4.6-2.8-5.6-1.3z"
        className="fill-seal-50 stroke-seal-900"
        strokeWidth={ink * 0.8}
      />
      <ellipse cx="32" cy="24.1" rx="1.6" ry="1.1" className="fill-seal-900" />

      {/* Clapperboard: the board, then its striped arm swung open from the left hinge */}
      <rect
        x="12"
        y="39"
        width="40"
        height="20"
        rx="1.5"
        className="fill-white stroke-seal-900"
        strokeWidth={ink}
      />
      <path d="M29 44v10l8.5-5z" className="fill-blush-600 stroke-blush-600" strokeWidth={ink} />
      <g transform="rotate(-9 12 39)">
        <g clipPath={`url(#${armId})`}>
          <rect x="12" y="33.5" width="40" height="5.5" className="fill-seal-900" />
          {STRIPES.map((x) => (
            <path key={x} d={`M${x} 39l4.5-5.5h4.5l-4.5 5.5z`} className="fill-white" />
          ))}
        </g>
        <rect
          x="12"
          y="33.5"
          width="40"
          height="5.5"
          rx="1"
          fill="none"
          className="stroke-seal-900"
          strokeWidth={ink}
        />
      </g>
      <circle cx="12" cy="39" r="1.3" className="fill-seal-900" />

      {/* Flippers gripping the board's sides */}
      <ellipse
        cx="12.5"
        cy="47"
        rx="2.5"
        ry="4.4"
        transform="rotate(12 12.5 47)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
      <ellipse
        cx="51.5"
        cy="47"
        rx="2.5"
        ry="4.4"
        transform="rotate(-12 51.5 47)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
    </svg>
  );
}
