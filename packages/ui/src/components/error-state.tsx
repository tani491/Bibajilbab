import { AlertTriangle } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "../lib/cn"

export interface ErrorStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-red-200 bg-red-50 p-6 text-center text-red-950",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-700">
        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm opacity-85">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  )
}
