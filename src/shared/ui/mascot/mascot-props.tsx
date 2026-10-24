import { MASCOT_COLORS as C, SEAL_EYES } from "./mascot.constants";
import { toTransform } from "./mascot.utils";
import type { GlassesProps, ItemProps, SpeechBubbleProps } from "./mascot.types";

/** A speech bubble with short text (≤ 5 characters). The tail points down-left, or down-right with `flip`. */
export function SpeechBubble({
  text,
  flip = false,
  color = "#db2777",
  ...placement
}: SpeechBubbleProps) {
  const tail = flip ? "4,5 9,10 8,5" : "-4,5 -9,10 -8,5";

  return (
    <g transform={toTransform(placement)}>
      <rect
        x="-13"
        y="-7"
        width="26"
        height="12"
        rx="3"
        fill="#ffffff"
        stroke={color}
        strokeWidth="1.4"
      />
      <polygon
        points={tail}
        fill="#ffffff"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Re-cover the bubble's bottom edge where the tail joins it. */}
      <line
        x1={flip ? 4.6 : -7.4}
        y1="5"
        x2={flip ? 7.4 : -4.6}
        y2="5"
        stroke="#ffffff"
        strokeWidth="1.6"
      />
      <text
        y="1.9"
        textAnchor="middle"
        fontSize="6"
        fontWeight="800"
        fill={color}
        className="font-sans"
      >
        {text}
      </text>
    </g>
  );
}

/** Four-point twinkle, for "done!" and magic moments. Size via `scale`. */
export function Sparkle({ color = "#fbbf24", ...placement }: ItemProps) {
  return (
    <path
      d="M0 -4 L1.1 -1.1 L4 0 L1.1 1.1 L0 4 L-1.1 1.1 L-4 0 L-1.1 -1.1 Z"
      fill={color}
      transform={toTransform(placement)}
    />
  );
}

/** Glasses worn by the seal, fixed on its eyes: dark sunglasses or round reading glasses. */
export function Glasses({ kind }: GlassesProps) {
  const [[lx, ly], [rx, ry]] = SEAL_EYES as [[number, number], [number, number]];
  const isSun = kind === "sun";
  const lens = isSun
    ? { fill: C.ink, stroke: C.ink }
    : { fill: "#e0f2fe", fillOpacity: 0.35, stroke: C.ink };

  return (
    <g strokeWidth="1">
      <line x1={lx + 4} y1={ly} x2={rx - 4} y2={ry} stroke={C.ink} />
      {isSun ? (
        <>
          <rect x={lx - 4.5} y={ly - 3} width="9" height="6" rx="1.5" {...lens} />
          <rect x={rx - 4.5} y={ry - 3} width="9" height="6" rx="1.5" {...lens} />
          {/* The "deal with it" shine. */}
          <path
            d={`M${lx - 3} ${ly - 1}l2 -1M${rx - 3} ${ry - 1}l2 -1`}
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx={lx} cy={ly} r="4" {...lens} />
          <circle cx={rx} cy={ry} r="4" {...lens} />
        </>
      )}
    </g>
  );
}

/** Magnifying glass: lens at (0, 0), handle toward the bottom right. */
export function Magnifier(placement: ItemProps) {
  return (
    <g transform={toTransform(placement)}>
      <line
        x1="5"
        y1="5"
        x2="12"
        y2="12"
        stroke={C.metal}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle r="7" fill="#e0f2fe" fillOpacity="0.55" stroke={C.metal} strokeWidth="2.2" />
      <path
        d="M-4 -2 a4.5 4.5 0 0 1 3 -3"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** A cartoon sweat drop, for nervous moments. */
export function SweatDrop(placement: ItemProps) {
  return (
    <path
      d="M0 -4 C2.5 -0.5 3 1.5 0 3.5 C-3 1.5 -2.5 -0.5 0 -4 Z"
      fill="#93c5fd"
      stroke="#3b82f6"
      strokeWidth="0.7"
      transform={toTransform(placement)}
    />
  );
}
