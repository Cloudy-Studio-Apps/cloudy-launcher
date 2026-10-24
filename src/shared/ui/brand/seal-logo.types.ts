export interface SealLogoProps {
  /** Rendered width/height in px. */
  size?: number;
  /** `mark` is simplified (fewer details, thicker lines) for sizes ≤ 24px. */
  variant?: "full" | "mark";
  className?: string;
  /** Accessible label. Omit when the logo is decorative (e.g. next to the wordmark). */
  title?: string;
}
