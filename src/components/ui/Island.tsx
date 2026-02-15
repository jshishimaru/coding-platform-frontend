import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface IslandProps extends HTMLAttributes<HTMLDivElement> {
  /** Disable the hover scale effect */
  noHover?: boolean;
}

/**
 * Floating island container — the foundational panel primitive.
 * Rounded corners, subtle border, soft shadow, hover lift.
 */
export function Island({ className, noHover, ...props }: IslandProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-secondary p-4 shadow-[0_1px_3px_var(--shadow)]",
        !noHover &&
          "transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--bg-secondary)_88%,var(--text)_12%)]",
        className,
      )}
      {...props}
    />
  );
}
