import type { ReactNode } from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-plum">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-ink">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
