"use client"

import { X } from "lucide-react"
import { useEffect, useId } from "react"
import type { MouseEvent, ReactNode } from "react"

import { cn } from "../lib/cn"
import { IconButton } from "./icon-button"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onOpenChange, open])

  if (!open) {
    return null
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onOpenChange(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/35 p-4 animate-fade-in"
      onMouseDown={handleOverlayClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "w-full max-w-lg rounded-card border border-brand-border bg-white shadow-soft animate-slide-up",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-brand-border p-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-brand-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-brand-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            label="Fermer"
            icon={<X aria-hidden="true" className="h-4 w-4" />}
            onClick={() => onOpenChange(false)}
            size="sm"
          />
        </header>
        <div className="p-5">{children}</div>
        {footer ? <footer className="border-t border-brand-border p-5">{footer}</footer> : null}
      </section>
    </div>
  )
}
