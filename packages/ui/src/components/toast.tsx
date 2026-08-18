"use client"

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import type { HTMLAttributes } from "react"

import { cn } from "../lib/cn"
import { IconButton } from "./icon-button"

export type ToastVariant = "info" | "success" | "error"

const variantClasses: Record<ToastVariant, string> = {
  info: "border-brand-border bg-white text-brand-ink",
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
}

const icons = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
} satisfies Record<ToastVariant, typeof Info>

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string | undefined
  variant?: ToastVariant
  onClose?: () => void
}

export function Toast({
  className,
  title,
  description,
  variant = "info",
  onClose,
  ...props
}: ToastProps) {
  const Icon = icons[variant]

  return (
    <div
      role="status"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-card border p-4 shadow-soft animate-slide-up",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm opacity-85">{description}</p> : null}
      </div>
      {onClose ? (
        <IconButton
          label="Fermer la notification"
          icon={<X aria-hidden="true" className="h-4 w-4" />}
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="-mr-2 -mt-2"
        />
      ) : null}
    </div>
  )
}
