/** Types for the mascot: the round plush foca watona and the props it plays with. Ported from Cloudy PDF. */
import type { ReactNode } from "react";

/** A point in scene coordinates (the scene's viewBox is 120 × 96). */
export type Vec = readonly [x: number, y: number];

/** Face expression. "sleepy" is the plush's resting face (half-closed eyes). */
export type SealMood = "sleepy" | "happy" | "focused";

/**
 * Where a front flipper is.
 * - rest: hanging at the side
 * - hold: in front of the belly, gripping whatever is held there
 * - up: raised to the side (cheering, holding something high)
 * - out: stretched sideways, holding something beside the seal
 */
export type FlipperPose = "rest" | "hold" | "up" | "out";

export interface FlipperShape {
  cx: number;
  cy: number;
  rotate: number;
}

export interface SealSpot {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
}

/** Position of a prop. Props are drawn around their own (0, 0), then moved here. */
export interface Placement {
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
}

/** Layers, back to front: `behind` → seal → `front` → flippers (so they overlap what's held). */
export interface SealSceneProps {
  behind?: ReactNode;
  front?: ReactNode;
  left?: FlipperPose;
  right?: FlipperPose;
  mood?: SealMood;
  className?: string;
}

export interface ItemProps extends Placement {
  color?: string;
}

export interface SpeechBubbleProps extends ItemProps {
  text: string;
  /** Put the tail on the right instead of the left. */
  flip?: boolean;
}

export interface GlassesProps {
  kind: "sun" | "reading";
}
