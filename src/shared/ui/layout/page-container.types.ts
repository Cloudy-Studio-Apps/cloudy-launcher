import type { ComponentProps } from "react";

export interface PageContainerProps extends ComponentProps<"div"> {
  as?: "div" | "main" | "header" | "section";
}
