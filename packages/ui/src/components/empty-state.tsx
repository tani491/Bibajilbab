import { PackageOpen } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "../lib/cn"

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-brand-border bg-white p-8 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blush text-brand-plum">
        {icon ?? <PackageOpen aria-hidden="true" className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-brand-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-brand-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  )
}
