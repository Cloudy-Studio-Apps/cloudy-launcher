import { Box } from "lucide-react";
import type { ComponentType } from "react";

import { ReaderSealLogo } from "@shared/ui/brand/reader-seal-logo";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { cn } from "@shared/ui/lib/utils";
import type { AppLogoProps } from "./app-logo.types";

/** Each app's icon, drawn as it ships: its mark on a colored tile. Apps missing here get a generic box. */
const LOGOS: Record<string, { mark: ComponentType<{ size?: number }>; className: string }> = {
  "cloudy-canvas": { mark: SealLogo, className: "bg-ice-500" },
  "cloudy-pdf": { mark: ReaderSealLogo, className: "bg-blush-300" },
};

export function AppLogo({ id, size = 64, className }: AppLogoProps) {
  const logo = LOGOS[id];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center shadow-lifted ring-1 ring-black/5 ring-inset",
        logo?.className ?? "bg-secondary text-secondary-foreground",
        className,
      )}
      // App icons are brand art, rounded like the OS draws them; the UI's 8px corner cap doesn't apply.
      style={{ width: size, height: size, borderRadius: size * 0.24 }}
    >
      {logo ? (
        <logo.mark size={size * 0.84} />
      ) : (
        <Box style={{ width: size / 2, height: size / 2 }} />
      )}
    </div>
  );
}
