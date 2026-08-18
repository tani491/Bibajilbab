import { AlertTriangle } from "lucide-react"

import { Badge, Card, CardContent, EmptyState } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import { adjustInventoryAction } from "@/lib/admin-actions"
import { listProducts } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"
import { isLowStock } from "@/lib/inventory"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const products = await listProducts()
  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      ...variant,
    })),
  )

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Stock"
        title="Inventaire"
        description="Ajustements manuels par variante. Les stocks négatifs sont refusés côté serveur."
      />

      <section className="mt-8 overflow-hidden rounded-card border border-brand-border bg-white">
        {variants.length === 0 ? (
          <EmptyState
            title="Aucune variante"
            description="Créez des variantes produit pour piloter le stock."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-brand-blush text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Variante</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Seuil</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Ajustement</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const low = isLowStock(variant)

                  return (
                    <tr
                      key={`${variant.productId}-${variant.id}`}
                      className="border-t border-brand-border align-top"
                    >
                      <td className="px-4 py-4 font-semibold text-brand-ink">
                        {variant.productName}
                      </td>
                      <td className="px-4 py-4 text-brand-muted">
                        <p>{variant.id}</p>
                        <p className="mt-1 text-xs">{variant.sku}</p>
                      </td>
                      <td className="px-4 py-4 text-brand-muted">{variant.stock}</td>
                      <td className="px-4 py-4 text-brand-muted">{variant.lowStockThreshold}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={variant.status === "active" ? "success" : "outline"}>
                            {variant.status}
                          </Badge>
                          {low ? (
                            <Badge variant="warning">
                              <AlertTriangle aria-hidden="true" className="mr-1 h-3 w-3" />
                              Stock faible
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ActionForm action={adjustInventoryAction} submitLabel="Ajuster">
                          <input type="hidden" name="productId" value={variant.productId} />
                          <input type="hidden" name="variantId" value={variant.id} />
                          <div className="grid gap-3 md:grid-cols-[110px_1fr]">
                            <input
                              name="delta"
                              type="number"
                              required
                              placeholder="+3 / -1"
                              className="h-10 rounded-card border border-brand-border px-3 text-sm"
                            />
                            <input
                              name="reason"
                              required
                              placeholder="Réception, correction, casse"
                              className="h-10 rounded-card border border-brand-border px-3 text-sm"
                            />
                          </div>
                        </ActionForm>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card className="mt-8">
        <CardContent>
          <p className="text-sm leading-6 text-brand-muted">
            Les demandes WhatsApp ne réservent pas automatiquement le stock. La diminution se fait
            au passage confirmé ou via un ajustement manuel audité.
          </p>
        </CardContent>
      </Card>
    </AdminShell>
  )
}
