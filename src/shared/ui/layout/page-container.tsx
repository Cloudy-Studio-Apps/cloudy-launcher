import { cn } from "@shared/ui/lib/utils";
import type { PageContainerProps } from "./page-container.types";

/** Centered max-width column with the app's page gutters. */
export function PageContainer({ as: Tag = "div", className, ...props }: PageContainerProps) {
  return <Tag className={cn("mx-auto w-full max-w-6xl px-6 sm:px-10", className)} {...props} />;
}
