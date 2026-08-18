import { brandConfig } from "@bibajilbab/config"
import { Badge, Card, CardContent } from "@bibajilbab/ui/server"

import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  getSiteSettingsDocument,
  listFaqs,
  listHomepageSections,
  listTestimonials,
} from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

function valueFrom(settings: unknown, key: string, fallback: string): string {
  if (!settings || typeof settings !== "object") {
    return fallback
  }

  const value = (settings as Record<string, unknown>)[key]

  return typeof value === "string" && value.trim() ? value : fallback
}

export default async function ContentPreviewPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const [settings, sections, faqs, testimonials] = await Promise.all([
    getSiteSettingsDocument(),
    listHomepageSections(),
    listFaqs(),
    listTestimonials(),
  ])

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Aperçu"
        title="Prévisualisation interne"
        description="Vue privée des contenus enregistrés avant publication sur la boutique."
      />

      <section className="mt-8 rounded-card border border-brand-border bg-white p-6">
        <p className="text-sm font-semibold uppercase text-brand-plum">
          {valueFrom(settings, "announcement", "Nouvelle collection disponible")}
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-ink">
          {valueFrom(settings, "brandName", brandConfig.name)}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-brand-muted">
          {valueFrom(settings, "slogan", brandConfig.slogan)}
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Accueil</h2>
            <ul className="mt-5 space-y-3">
              {sections.map((section) => (
                <li key={section.id} className="rounded-card border border-brand-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-brand-ink">{section.title}</span>
                    <Badge variant={section.status === "published" ? "success" : "outline"}>
                      {section.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-brand-muted">{section.kind}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">FAQ</h2>
            <ul className="mt-5 space-y-3">
              {faqs.map((faq) => (
                <li key={faq.id} className="rounded-card border border-brand-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-brand-ink">{faq.question}</span>
                    <Badge variant={faq.status === "published" ? "success" : "outline"}>
                      {faq.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Témoignages</h2>
            <ul className="mt-5 space-y-3">
              {testimonials.map((testimonial) => (
                <li key={testimonial.id} className="rounded-card border border-brand-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-brand-ink">
                      {testimonial.customerName}
                    </span>
                    <Badge variant={testimonial.status === "published" ? "success" : "outline"}>
                      {testimonial.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  )
}
