import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { ConvertSealLogoProps } from "./convert-seal-logo.types";

// Cloudy Convert's mark: the same foca watona as SealLogo, holding up a card with two arrows
// chasing each other (one file turning into another).
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [25, 14.6, 1.5, 1],
  [31.5, 12, 1.1, 0.8],
  [38.5, 13.4, 1.6, 1.1],
  [44, 18, 1.2, 0.9],
];

export function ConvertSealLogo({ size = 32, className, title }: ConvertSealLogoProps) {
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

      {/* Seal body (its lower half hides behind the card) */}
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

      {/* Closed, content eyes */}
      <path
        d="M22.5 21.5q2.8-2.8 5.6 0M35.9 21.5q2.8-2.8 5.6 0"
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

      {/* The card */}
      <rect
        x="10"
        y="34"
        width="44"
        height="24"
        rx="1.5"
        className="fill-white stroke-seal-900"
        strokeWidth={ink}
      />

      {/* Two arrows chasing each other around the card's middle */}
      <g fill="none" strokeWidth={2.6}>
        <path d="M24.6 44.5a7.6 7.6 0 0 1 13.6-2.6" className="stroke-ice-600" />
        <path d="M39.4 49.5a7.6 7.6 0 0 1-13.6 2.6" className="stroke-blush-600" />
      </g>
      <path d="M40.6 38.2l.4 6.3-6-1.9z" className="fill-ice-600 stroke-ice-600" strokeWidth={1} />
      <path
        d="M23.4 55.8l-.4-6.3 6 1.9z"
        className="fill-blush-600 stroke-blush-600"
        strokeWidth={1}
      />

      {/* Flippers holding the card's top edge */}
      <ellipse
        cx="17.5"
        cy="35.3"
        rx="4.4"
        ry="2.5"
        transform="rotate(-18 17.5 35.3)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
      <ellipse
        cx="46.5"
        cy="35.3"
        rx="4.4"
        ry="2.5"
        transform="rotate(18 46.5 35.3)"
        className="fill-seal-300 stroke-seal-900"
        strokeWidth={ink}
      />
    </svg>
  );
}
