import { AlertTriangle, Heart, MessageCircle, Package, ShoppingBag } from "lucide-react"

import { Card, CardContent, SectionHeading } from "@bibajilbab/ui/server"

import { AdminShell } from "@/components/layout/admin-shell"
import { getDashboardData } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

const metricLabels = [
  { key: "products", label: "Produits", icon: Package },
  { key: "publishedProducts", label: "Publiés", icon: Package },
  { key: "drafts", label: "Brouillons", icon: Package },
  { key: "outOfStock", label: "Ruptures", icon: AlertTriangle },
  { key: "lowStock", label: "Stocks faibles", icon: AlertTriangle },
  { key: "whatsappRequests", label: "Demandes WhatsApp", icon: MessageCircle },
  { key: "cartAdds", label: "Ajouts panier", icon: ShoppingBag },
  { key: "favoriteAdds", label: "Ajouts favoris", icon: Heart },
] as const

function shortDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date)
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession()
  const dashboard = await getDashboardData()
  const analyticsSummary = [
    { label: "Visites totales", value: dashboard.totalVisits },
    { label: "Produits consultés", value: dashboard.productViews },
    { label: "Clics WhatsApp", value: dashboard.whatsappClicks },
    { label: "Catégories", value: dashboard.categories },
    { label: "Collections", value: dashboard.collections },
  ]

  return (
    <AdminShell session={session}>
      <SectionHeading
        eyebrow="Pilotage"
        title="Tableau de bord"
        description="Indicateurs catalogue et demandes WhatsApp. Rien ici ne représente des ventes payées."
      />
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricLabels.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.key}>
              <CardContent className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 text-sm font-medium text-brand-muted">{metric.label}</p>
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-plum" />
                </div>
                <p className="mt-4 break-words text-2xl font-semibold text-brand-ink sm:text-3xl">
                  {dashboard[metric.key]}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Contenus récemment modifiés</h2>
            {dashboard.recentlyModified.length > 0 ? (
              <>
                <div className="mt-5 grid gap-3 md:hidden">
                  {dashboard.recentlyModified.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-card border border-brand-border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-ink">{item.label}</p>
                          <p className="mt-1 text-xs uppercase text-brand-muted">
                            {item.collection}
                          </p>
                        </div>
                        <time className="shrink-0 whitespace-nowrap text-xs text-brand-muted">
                          {shortDate(item.updatedAt)}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="text-brand-muted">
                      <tr>
                        <th className="border-b border-brand-border py-3 pr-4">Élément</th>
                        <th className="border-b border-brand-border py-3 pr-4">Collection</th>
                        <th className="border-b border-brand-border py-3">Modification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentlyModified.map((item) => (
                        <tr key={item.id}>
                          <td className="border-b border-brand-border py-3 pr-4 font-medium text-brand-ink">
                            {item.label}
                          </td>
                          <td className="border-b border-brand-border py-3 pr-4 text-brand-muted">
                            {item.collection}
                          </td>
                          <td className="whitespace-nowrap border-b border-brand-border py-3 text-xs text-brand-muted sm:text-sm">
                            {item.updatedAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm text-brand-muted">
                Aucun contenu modifié à afficher pour l'instant.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Analytique & Provenance</h2>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
              {analyticsSummary.map((metric) => (
                <div
                  key={metric.label}
                  className="min-w-0 rounded-card border border-brand-border p-3"
                >
                  <dt className="text-xs font-medium uppercase text-brand-muted">
                    {metric.label}
                  </dt>
                  <dd className="mt-2 break-words text-2xl font-semibold text-brand-ink">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 grid gap-5 border-t border-brand-border pt-5">
              <div>
                <h3 className="text-sm font-semibold text-brand-ink">Origine des visites</h3>
                {dashboard.trafficSources.length > 0 ? (
                  <dl className="mt-3 space-y-3 text-sm">
                    {dashboard.trafficSources.map((source) => (
                      <div key={source.source} className="flex justify-between gap-4">
                        <dt className="min-w-0 truncate text-brand-muted">{source.source}</dt>
                        <dd className="shrink-0 font-semibold text-brand-ink">{source.count}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-brand-muted">Aucune provenance enregistrée.</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-ink">Pages clés consultées</h3>
                {dashboard.topPages.length > 0 ? (
                  <dl className="mt-3 space-y-3 text-sm">
                    {dashboard.topPages.map((page) => (
                      <div key={page.path} className="flex justify-between gap-4">
                        <dt className="min-w-0 truncate text-brand-muted">{page.path}</dt>
                        <dd className="shrink-0 font-semibold text-brand-ink">{page.count}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-brand-muted">
                    Aucune consultation enregistrée.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  )
}
