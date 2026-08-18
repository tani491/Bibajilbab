import type { ReactNode } from "react"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

export function InfoPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="py-12">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-8 grid gap-6 text-base leading-8 text-brand-muted">{children}</div>
      </Container>
    </main>
  )
}

export function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-brand-border bg-white p-5">
      <h2 className="text-xl font-semibold text-brand-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}
