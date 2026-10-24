import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { ReaderSealLogoProps } from "./reader-seal-logo.types";

// Cloudy PDF's mark: the same foca watona as SealLogo, in reading glasses, holding up a PDF page.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [25, 14.6, 1.5, 1],
  [31.5, 12, 1.1, 0.8],
  [38.5, 13.4, 1.6, 1.1],
  [44, 18, 1.2, 0.9],
];

export function ReaderSealLogo({ size = 32, className, title }: ReaderSealLogoProps) {
  const furId = `${useId()}-fur`;
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
      </defs>

      {/* Seal body (its lower half hides behind the page) */}
      <ellipse
        cx="32"
        cy="26"
        rx="18"
        ry="15"
        fill={`url(#${furId})`}
        className="stroke-seal-900"
        strokeWidth={ink}
      />
      {SPOTS.map(([cx, cy, rx, ry]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="fill-seal-400" />
      ))}

      {/* Blush cheeks */}
      <ellipse cx="20.5" cy="25" rx="2.6" ry="1.6" className="fill-blush-300" opacity={0.9} />
      <ellipse cx="43.5" cy="25" rx="2.6" ry="1.6" className="fill-blush-300" opacity={0.9} />

      {/* Reading glasses over closed, content eyes */}
      <g className="fill-white stroke-seal-900" fillOpacity={0.45} strokeWidth={ink * 0.9}>
        <circle cx="25.5" cy="20.5" r="4.2" />
        <circle cx="38.5" cy="20.5" r="4.2" />
      </g>
      <path
        d="M29.7 20.2q2.3-1.4 4.6 0"
        fill="none"
        className="stroke-seal-900"
        strokeWidth={ink * 0.9}
      />
      <path
        d="M23.3 21.3q2.2-2.2 4.4 0M36.3 21.3q2.2-2.2 4.4 0"
        fill="none"
        className="stroke-seal-900"
        strokeWidth={ink}
      />

      {/* Puffy muzzle and nose */}
      <path
        d="M32 25.4c-1-1.5-5.2-1.5-5.6 1.3-.3 2.2 2.4 3.2 4.1 2.4.8-.3 1.2-.7 1.5-1.2.3.5.7.9 1.5 1.2 1.7.8 4.4-.2 4.1-2.4-.4-2.8-4.6-2.8-5.6-1.3z"
        className="fill-seal-50 stroke-seal-900"
        strokeWidth={ink * 0.8}
      />
      <ellipse cx="32" cy="25.1" rx="1.6" ry="1.1" className="fill-seal-900" />

      {/* The page, with a folded corner */}
      <path
        d="M15 33h27l7 7v18.5a1.5 1.5 0 0 1-1.5 1.5h-31a1.5 1.5 0 0 1-1.5-1.5z"
        className="fill-white stroke-seal-900"
        strokeWidth={ink}
      />
      <path
        d="M42 33v5.5a1.5 1.5 0 0 0 1.5 1.5H49"
        className="fill-seal-200 stroke-seal-900"
        strokeWidth={ink}
      />
      <rect x="19" y="43" width="14" height="6.5" rx="1.2" className="fill-blush-600" />
      <text
        x="26"
        y="48.1"
        fontSize="5"
        fontWeight="800"
        textAnchor="middle"
        className="fill-white font-sans"
      >
        PDF
      </text>
      <path d="M19 53.5h24M36 46.2h7" className="stroke-seal-300" strokeWidth={ink} />

      {/* Flippers holding the page's top edge */}
      <ellipse
        cx="18.5"
        cy="34.3"
        rx="4.4"
        ry="2.5"
        transform="rotate(-18 18.5 34.3)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
      <ellipse
        cx="45.5"
        cy="34.3"
        rx="4.4"
        ry="2.5"
        transform="rotate(18 45.5 34.3)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
    </svg>
  );
}
