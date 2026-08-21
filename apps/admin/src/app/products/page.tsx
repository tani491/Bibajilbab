import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"

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
          <Link href="/products/new" className={buttonStyles({ className: "w-full sm:w-auto" })}>
            Nouveau produit
          </Link>
        }
      />

      <Card className="mt-8">
        <CardContent>
          <form className="flex w-full flex-wrap gap-4 md:grid md:grid-cols-[1fr_220px_auto]">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Rechercher par nom, slug ou référence"
              className="h-11 w-full min-w-0 rounded-card border border-brand-border px-3 text-sm md:w-auto"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="h-11 w-full rounded-card border border-brand-border px-3 text-sm md:w-auto"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publiés</option>
              <option value="archived">Archivés</option>
            </select>
            <button className={buttonStyles({ className: "w-full md:w-auto" })} type="submit">
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
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/products/${product.id}`}
                          className={buttonStyles({ variant: "outline", size: "sm", className: "h-8 px-2 text-xs" })}
                          aria-label={`Modifier ${product.name}`}
                        >
                          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifier</span>
                        </Link>
                        <a
                          href={`/products/${product.id}?preview=1`}
                          className={buttonStyles({ variant: "ghost", size: "sm", className: "h-8 px-2 text-xs" })}
                          aria-label={`Prévisualiser ${product.name}`}
                        >
                          <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                          <span className="sr-only">Prévisualiser</span>
                        </a>
                        <ActionForm action={updateProductStatusAction} submitLabel="Publier" compact>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="published" />
                        </ActionForm>
                        <ActionForm action={updateProductStatusAction} submitLabel="Dépublier" compact>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="draft" />
                        </ActionForm>
                        <ActionForm action={duplicateProductAction} submitLabel="Dupliquer" compact>
                          <input type="hidden" name="id" value={product.id} />
                        </ActionForm>
                        <ActionForm action={updateProductStatusAction} submitLabel="Archiver" compact>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value="archived" />
                        </ActionForm>
                        {session.role === "admin" ? (
                          <ActionForm
                            action={deleteProductAction}
                            submitLabel={`Supprimer ${product.name}`}
                            danger
                            compact
                            confirmMessage={`Confirmer la suppression de « ${product.name} » ?`}
                            submitIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                          >
                            <input type="hidden" name="id" value={product.id} />
                          </ActionForm>
                        ) : null}
                      </div>
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
