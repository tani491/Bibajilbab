import { LoaderCircle } from "lucide-react"
import { forwardRef } from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "../lib/cn"
import type { ButtonVariant } from "./button"

type IconButtonSize = "sm" | "md" | "lg"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-plum text-white hover:bg-brand-mauve disabled:bg-brand-border",
  secondary: "bg-brand-powder text-brand-ink hover:bg-brand-powder/80 disabled:bg-brand-border",
  outline:
    "border border-brand-border bg-white text-brand-plum hover:border-brand-plum hover:bg-brand-blush",
  ghost: "bg-transparent text-brand-plum hover:bg-brand-blush",
  danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-brand-border",
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: ReactNode
  variant?: ButtonVariant
  size?: IconButtonSize
  isLoading?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className,
    label,
    icon,
    variant = "ghost",
    size = "md",
    isLoading = false,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-card transition duration-200 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-brand-muted disabled:opacity-80",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      aria-label={label}
      title={label}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : icon}
    </button>
  )
})
