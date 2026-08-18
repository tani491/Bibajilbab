import Link from "next/link"

import { Badge, Card, CardContent, EmptyState, buttonStyles } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  deleteProductAction,
  duplicateProductAction,
  updateProductStatusAction,
} from "@/lib/admin-actions"
import { listProducts } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const session = await requireAdminSession(["admin", "editor"])
  const params = await searchParams
  const products = await listProducts()
  const filteredProducts = products.filter((product) => {
    const query = params.q?.toLowerCase().trim() ?? ""
    const status = params.status ?? ""

    return (
      (!query ||
        [product.name, product.slug, product.sku].join(" ").toLowerCase().includes(query)) &&
      (!status || product.status === status)
    )
  })

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Catalogue"
        title="Produits"
        description="Liste claire des articles, stocks indicatifs et statuts de publication."
        action={
          <Link href="/products/new" className={buttonStyles()}>
            Nouveau produit
          </Link>
        }
      />

      <Card className="mt-8">
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Rechercher par nom, slug ou référence"
              className="h-11 rounded-card border border-brand-border px-3 text-sm"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="h-11 rounded-card border border-brand-border px-3 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publiés</option>
              <option value="archived">Archivés</option>
            </select>
            <button className={buttonStyles()} type="submit">
              Filtrer
            </button>
          </form>
        </CardContent>
      </Card>

      <section className="mt-6 overflow-hidden rounded-card border border-brand-border bg-white">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Aucun produit"
            description="Créez un produit ou modifiez les filtres."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-brand-blush text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-brand-border align-top">
                    <td className="px-4 py-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-brand-ink hover:text-brand-plum"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-brand-muted">{product.slug}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-muted">{product.sku}</td>
                    <td className="px-4 py-4">
                      <Badge variant={product.status === "published" ? "success" : "outline"}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-brand-muted">{product.stock}</td>
                    <td className="px-4 py-4 text-brand-muted">{product.price} XOF</td>
                    <td className="space-y-3 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className={buttonStyles({ variant: "outline", size: "sm" })}
                        >
                          Modifier
                        </Link>
                        <a
                          href={`/products/${product.id}?preview=1`}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Prévisualiser
                        </a>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <ActionForm action={updateProductStatusAction} submitLabel="Publier">
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="published" />
                        </ActionForm>
                        <ActionForm action={updateProductStatusAction} submitLabel="Dépublier">
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="draft" />
                        </ActionForm>
                        <ActionForm action={duplicateProductAction} submitLabel="Dupliquer">
                          <input type="hidden" name="id" value={product.id} />
                        </ActionForm>
                        <ActionForm action={updateProductStatusAction} submitLabel="Archiver">
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="archived" />
                        </ActionForm>
                      </div>
                      {session.role === "admin" ? (
                        <ActionForm action={deleteProductAction} submitLabel="Supprimer" danger>
                          <input type="hidden" name="id" value={product.id} />
                          <label className="block text-xs text-brand-muted">
                            Confirmer avec l'ID
                            <input
                              name="confirm"
                              className="mt-1 h-9 w-full rounded-card border border-brand-border px-2"
                            />
                          </label>
                        </ActionForm>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  )
}
