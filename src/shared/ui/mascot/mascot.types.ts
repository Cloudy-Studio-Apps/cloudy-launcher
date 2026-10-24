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

/** Layers, back to front: `behind` → seal → `front` → flippers (so they overlap what's held). */
export interface SealSceneProps {
  behind?: ReactNode;
  front?: ReactNode;
  left?: FlipperPose;
  right?: FlipperPose;
  mood?: SealMood;
  className?: string;
}
