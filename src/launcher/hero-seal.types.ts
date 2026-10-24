/** What the launcher is up to, which picks the seal's meme. */
export type HeroSealState = "checking" | "update" | "up-to-date" | "fresh";

export interface HeroSealProps {
  state: HeroSealState;
}
