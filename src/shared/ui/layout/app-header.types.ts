import type { ReactNode } from "react";

export interface AppHeaderProps {
  /** Left side: title, back button, logo. */
  children: ReactNode;
  /** Right side actions. */
  actions?: ReactNode;
}
