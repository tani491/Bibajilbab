import { notFound } from "next/navigation"

import { Card, CardContent } from "@bibajilbab/ui/server"

import { PageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  getMainHeroSection,
  getProductDocument,
  listCategories,
  listCollections,
} from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const session = await requireAdminSession(["admin", "editor"])
  const { id } = await params
  const query = await searchParams
  const [product, categories, collections, heroSection] = await Promise.all([
    getProductDocument(id),
    listCategories(),
    listCollections(),
    getMainHeroSection(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Produit"
        title={`Modifier ${String(product.name ?? id)}`}
        description="Ajustez la fiche complète : photos, bannière, variantes, stock et visibilité."
      />
      {query.preview ? (
        <Card className="mt-8">
          <CardContent>
            <p className="text-sm font-semibold text-brand-ink">Aperçu avant publication</p>
            <h2 className="mt-3 text-2xl font-semibold text-brand-ink">
              {String(product.name ?? "Produit")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              {String(product.shortDescription ?? "Description non renseignée")}
            </p>
          </CardContent>
        </Card>
      ) : null}
      <div className="mt-8">
        <ProductForm
          product={product}
          categories={categories}
          collections={collections}
          heroSection={heroSection}
        />
      </div>
    </AdminShell>
  )
}
