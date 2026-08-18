import type { HTMLAttributes } from "react"

import { cn } from "../lib/cn"

export type BadgeVariant = "powder" | "plum" | "outline" | "success" | "warning"

const variantClasses: Record<BadgeVariant, string> = {
  powder: "bg-brand-blush text-brand-plum",
  plum: "bg-brand-plum text-white",
  outline: "border border-brand-border bg-white text-brand-muted",
  success: "bg-green-50 text-green-800",
  warning: "bg-amber-50 text-amber-900",
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = "powder", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
