import { cn } from "@shared/ui/lib/utils";
import type { WordmarkProps } from "./wordmark.types";

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/darkredgm_logo.png" alt="" width={26} height={26} className="shrink-0" />
      <span className="text-md font-semibold tracking-tight text-foreground">Cloudy Launcher</span>
    </span>
  );
}
