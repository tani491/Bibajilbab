import { PageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"
import { AdminShell } from "@/components/layout/admin-shell"
import { getMainHeroSection, listCategories, listCollections } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const [categories, collections, heroSection] = await Promise.all([
    listCategories(),
    listCollections(),
    getMainHeroSection(),
  ])

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Produit"
        title="Nouveau produit"
        description="Créez la fiche complète : photos, catégorie, collections, bannière, variantes et stock."
      />
      <div className="mt-8">
        <ProductForm categories={categories} collections={collections} heroSection={heroSection} />
      </div>
    </AdminShell>
  )
}
