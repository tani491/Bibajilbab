import type { HTMLAttributes } from "react"

import { cn } from "../lib/cn"

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
}

export function SectionHeading({
  className,
  eyebrow,
  title,
  description,
  align = "left",
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : null, className)}
      {...props}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase text-brand-plum">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold text-brand-ink sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-base leading-7 text-brand-muted">{description}</p>
      ) : null}
    </div>
  )
}
