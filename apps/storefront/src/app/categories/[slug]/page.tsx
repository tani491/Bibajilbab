import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { Breadcrumbs } from "@/components/commerce/breadcrumbs"
import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import { createPageMetadata, getCategoryLabelMap } from "@/lib/catalog"
import { getFilteredProducts, parseCatalogFilters, type SearchParamRecord } from "@/lib/filters"
import {
  getStorefrontCategories,
  getStorefrontCategoryBySlug,
  getStorefrontProducts,
} from "@/lib/storefront-data"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamRecord>
}

export const revalidate = 0

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getStorefrontCategoryBySlug(slug)

  if (!category) {
    return {}
  }

  return createPageMetadata({
    title: `${category.name} a Dakar`,
    description: `Decouvrez nos ${category.name.toLowerCase()} BibaJilbab a Dakar: ${category.description} Commande simple sur WhatsApp et livraison au Senegal.`,
    path: `/categories/${category.slug}`,
  })
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const [products, categories] = await Promise.all([
    getStorefrontProducts({ status: "published" }),
    getStorefrontCategories(),
  ])
  const category = categories.find((item) => item.slug === slug || item.id === slug)

  if (!category) {
    notFound()
  }

  const categoryLabels = getCategoryLabelMap(categories)
  const filters = { ...parseCatalogFilters(await searchParams), category: category.id }
  const filteredProducts = getFilteredProducts(products, filters, categoryLabels)
  const sizeOptions = Array.from(
    new Map(
      products
        .flatMap((product) => product.sizes)
        .map((item) => [item.id, { value: item.id, label: item.label }]),
    ).values(),
  )
  const colorOptions = Array.from(
    new Map(
      products
        .flatMap((product) => product.colors)
        .map((item) => [item.id, { value: item.id, label: item.name }]),
    ).values(),
  )

  return (
    <main className="py-12">
      <Container>
        <Breadcrumbs items={[{ href: `/categories/${category.slug}`, label: category.name }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Catégorie"
            title={category.name}
            description={category.description}
          />
        </div>
        <div className="mt-8">
          <CatalogFiltersForm
            filters={filters}
            pathname={`/categories/${category.slug}`}
            resetHref={`/categories/${category.slug}`}
            categories={categories}
            lockCategory={category.id}
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
          />
        </div>
        <p className="mt-6 text-sm font-medium text-brand-muted">
          {filteredProducts.length} produit(s)
        </p>
        <div className="mt-6">
          <ProductGrid products={filteredProducts} categoryLabels={categoryLabels} />
        </div>
      </Container>
    </main>
  )
}
