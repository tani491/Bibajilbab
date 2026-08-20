"use client"

import { X } from "lucide-react"
import { useEffect, useId } from "react"
import type { MouseEvent, ReactNode } from "react"

import { cn } from "../lib/cn"
import { IconButton } from "./icon-button"

export type DrawerSide = "left" | "right"

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  side?: DrawerSide
  footer?: ReactNode
  className?: string
}

const sideClasses: Record<DrawerSide, string> = {
  left: "left-0",
  right: "right-0",
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  footer,
  className,
}: DrawerProps) {
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
      className="fixed inset-0 z-50 bg-brand-ink/35 animate-fade-in"
      onMouseDown={handleOverlayClick}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "fixed inset-y-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-brand-border bg-white shadow-soft animate-slide-up sm:border-l",
          sideClasses[side],
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-border bg-white p-5">
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
        {footer ? <footer className="border-t border-brand-border p-5">{footer}</footer> : null}
      </aside>
    </div>
  )
}
