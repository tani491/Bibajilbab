import { LoaderCircle } from "lucide-react"
import { forwardRef } from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "../lib/cn"

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-plum text-white hover:bg-brand-mauve focus-visible:shadow-focus disabled:bg-brand-border disabled:text-brand-muted",
  secondary:
    "bg-brand-powder text-brand-ink hover:bg-brand-powder/80 focus-visible:shadow-focus disabled:bg-brand-border disabled:text-brand-muted",
  outline:
    "border border-brand-border bg-white text-brand-plum hover:border-brand-plum hover:bg-brand-blush focus-visible:shadow-focus disabled:bg-white disabled:text-brand-muted",
  ghost:
    "bg-transparent text-brand-plum hover:bg-brand-blush focus-visible:shadow-focus disabled:text-brand-muted",
  danger:
    "bg-red-700 text-white hover:bg-red-800 focus-visible:shadow-focus disabled:bg-brand-border disabled:text-brand-muted",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
}

export function buttonStyles(options?: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string | undefined
}): string {
  const variant = options?.variant ?? "primary"
  const size = options?.size ?? "md"

  return cn(
    "inline-flex items-center justify-center gap-2 rounded-card font-medium transition duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-80",
    variantClasses[variant],
    sizeClasses[size],
    options?.className,
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
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
      className={buttonStyles({ variant, size, className })}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!isLoading ? rightIcon : null}
    </button>
  )
})
