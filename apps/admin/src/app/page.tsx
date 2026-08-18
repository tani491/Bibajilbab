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

export default async function AdminDashboardPage() {
  const session = await requireAdminSession()
  const dashboard = await getDashboardData()

  return (
    <AdminShell session={session}>
      <SectionHeading
        eyebrow="Pilotage"
        title="Tableau de bord"
        description="Indicateurs catalogue et demandes WhatsApp. Rien ici ne représente des ventes payées."
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricLabels.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.key}>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-brand-muted">{metric.label}</p>
                  <Icon aria-hidden="true" className="h-5 w-5 text-brand-plum" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-brand-ink">
                  {dashboard[metric.key]}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Contenus récemment modifiés</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-brand-muted">
                  <tr>
                    <th className="border-b border-brand-border py-3 pr-4">Élément</th>
                    <th className="border-b border-brand-border py-3 pr-4">Collection</th>
                    <th className="border-b border-brand-border py-3">Modification</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentlyModified.length > 0 ? (
                    dashboard.recentlyModified.map((item) => (
                      <tr key={item.id}>
                        <td className="border-b border-brand-border py-3 pr-4 font-medium text-brand-ink">
                          {item.label}
                        </td>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-muted">
                          {item.collection}
                        </td>
                        <td className="border-b border-brand-border py-3 text-brand-muted">
                          {item.updatedAt}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-brand-muted">
                        Aucun contenu modifié à afficher pour l'instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Événements boutique</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Produits consultés</dt>
                <dd className="font-semibold text-brand-ink">{dashboard.productViews}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Clics WhatsApp</dt>
                <dd className="font-semibold text-brand-ink">{dashboard.whatsappClicks}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Catégories</dt>
                <dd className="font-semibold text-brand-ink">{dashboard.categories}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Collections</dt>
                <dd className="font-semibold text-brand-ink">{dashboard.collections}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  )
}
