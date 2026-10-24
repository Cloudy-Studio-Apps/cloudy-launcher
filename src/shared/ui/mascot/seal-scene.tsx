import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import {
  FLIPPER_SHAPES,
  MASCOT_COLORS as C,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SEAL_BODY,
  SEAL_EYES,
  SEAL_SPOTS,
} from "./mascot.constants";
import type { FlipperPose, SealMood, SealSceneProps } from "./mascot.types";

/** Eyes for each mood. All drawn around (0, 0), then placed on each eye center. */
const EYES: Record<SealMood, React.ReactNode> = {
  // The plush's look: small dark eyes under a heavy lid.
  sleepy: (
    <>
      <ellipse rx="2.8" ry="1.7" fill={C.ink} />
      <path
        d="M-3.4 -1.2 q3.4 -1.6 6.8 0"
        fill="none"
        stroke={C.ink}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </>
  ),
  // Closed, smiling arcs (^ ^).
  happy: (
    <path
      d="M-2.8 0.8 q2.8 -3.6 5.6 0"
      fill="none"
      stroke={C.ink}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  ),
  // Wide awake: round eyes with a shine.
  focused: (
    <>
      <circle r="2.8" fill={C.ink} />
      <circle cx="0.9" cy="-0.9" r="0.9" fill="#ffffff" />
    </>
  ),
};

/**
 * One mascot illustration: the round plush seal plus whatever props a scene adds.
 * Ported from Cloudy PDF's mascot, so both apps draw the same foca watona.
 */
export function SealScene({
  behind,
  front,
  left = "rest",
  right = "rest",
  mood = "sleepy",
  className,
}: SealSceneProps) {
  return (
    <svg
      viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
      aria-hidden="true"
      className={cn("overflow-visible select-none", className)}
    >
      <ellipse cx={SEAL_BODY.cx} cy="90" rx="38" ry="3.5" fill={C.shadow} opacity="0.08" />
      {behind}
      <SealBody mood={mood} />
      {front}
      <SealFlippers left={left} right={right} />
    </svg>
  );
}

function SealBody({ mood }: { mood: SealMood }) {
  // Many seals can be on screen, so gradient and clip ids are per instance.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { fur: `${uid}-fur`, belly: `${uid}-belly`, clip: `${uid}-clip` };
  const { cx, cy, rx, ry } = SEAL_BODY;

  return (
    <g>
      <defs>
        {/* Light from the top gives the ball its squishy volume. */}
        <radialGradient id={ids.fur} cx="0.45" cy="0.3" r="0.75">
          <stop offset="0" stopColor={C.furLight} />
          <stop offset="0.65" stopColor={C.furMid} />
          <stop offset="1" stopColor={C.furDark} />
        </radialGradient>
        <linearGradient id={ids.belly} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.7" stopColor={C.pale} stopOpacity="0" />
          <stop offset="1" stopColor={C.pale} stopOpacity="0.9" />
        </linearGradient>
        <clipPath id={ids.clip}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      {/* Bottom flippers, peeking out under the body. */}
      <g fill={C.flipper}>
        <ellipse cx="48" cy="87" rx="6.5" ry="3.2" transform="rotate(-12 48 87)" />
        <ellipse cx="72" cy="87" rx="6.5" ry="3.2" transform="rotate(12 72 87)" />
      </g>

      <g clipPath={`url(#${ids.clip})`}>
        <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} fill={`url(#${ids.fur})`} />
        <g fill={C.spot}>
          {SEAL_SPOTS.map((spot) => (
            <ellipse key={`${spot.cx}-${spot.cy}`} {...spot} />
          ))}
        </g>
        <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} fill={`url(#${ids.belly})`} />
      </g>

      <SealFace mood={mood} />
    </g>
  );
}

function SealFace({ mood }: { mood: SealMood }) {
  return (
    <g>
      {/* Slightly darker fur around the eyes, like the plush. */}
      {SEAL_EYES.map(([x, y]) => (
        <ellipse key={`shade-${x}`} cx={x} cy={y} rx="5" ry="3.6" fill={C.furDark} opacity="0.25" />
      ))}
      {SEAL_EYES.map(([x, y]) => (
        <g key={`eye-${x}`} transform={`translate(${x} ${y})`}>
          {EYES[mood]}
        </g>
      ))}

      {/* Blush cheeks, the launcher's touch. */}
      <ellipse cx="46" cy="55" rx="3.4" ry="2" fill={C.blush} opacity="0.75" />
      <ellipse cx="74" cy="55" rx="3.4" ry="2" fill={C.blush} opacity="0.75" />

      <ellipse cx="57" cy="55.5" rx="4.2" ry="3.4" fill={C.pale} />
      <ellipse cx="63" cy="55.5" rx="4.2" ry="3.4" fill={C.pale} />
      <g fill={C.furDark}>
        <circle cx="55.6" cy="55" r="0.45" />
        <circle cx="57.4" cy="56.8" r="0.45" />
        <circle cx="62.6" cy="56.8" r="0.45" />
        <circle cx="64.4" cy="55" r="0.45" />
      </g>
      <ellipse cx="60" cy="52.4" rx="2.8" ry="1.9" fill={C.nose} />

      {/* The plush's signature: a faint smile line low on the belly. */}
      <path
        d="M52 65 q8 3.6 16 0"
        fill="none"
        stroke={C.furDark}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  );
}

/** Front flippers. Shapes are defined for the left side; the right one is mirrored. */
function SealFlippers({ left, right }: { left: FlipperPose; right: FlipperPose }) {
  const l = FLIPPER_SHAPES[left];
  const r = FLIPPER_SHAPES[right];
  const mirroredX = SEAL_BODY.cx * 2 - r.cx;

  return (
    <g fill={C.flipper}>
      <ellipse
        cx={l.cx}
        cy={l.cy}
        rx="4.5"
        ry="9"
        transform={`rotate(${l.rotate} ${l.cx} ${l.cy})`}
      />
      <ellipse
        cx={mirroredX}
        cy={r.cy}
        rx="4.5"
        ry="9"
        transform={`rotate(${-r.rotate} ${mirroredX} ${r.cy})`}
      />
    </g>
  );
}
