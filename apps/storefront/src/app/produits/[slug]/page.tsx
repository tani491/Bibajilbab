import { Ruler, Shirt, Truck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { parsePublicEnv } from "@bibajilbab/config"
import { Card, CardContent, Container, SectionHeading, buttonStyles } from "@bibajilbab/ui/server"

import { Breadcrumbs } from "@/components/commerce/breadcrumbs"
import { ProductGallery } from "@/components/commerce/product-gallery"
import { ProductGrid } from "@/components/commerce/product-grid"
import { ProductPurchasePanel } from "@/components/commerce/product-purchase-panel"
import { RecentlyViewedProducts } from "@/components/commerce/recently-viewed-products"
import {
  BreadcrumbStructuredData,
  ProductStructuredData,
} from "@/components/commerce/structured-data"
import {
  createPageMetadata,
  getCategoryName,
  getProductBySlug,
  getPublishedProducts,
  getRelatedProducts,
} from "@/lib/catalog"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPublishedProducts().map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {}
  }

  return createPageMetadata({
    title: product.seo.title,
    description: product.seo.description,
    path: `/produits/${product.slug}`,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const publicEnv = parsePublicEnv(process.env)
  const relatedProducts = getRelatedProducts(product)
  const allProducts = getPublishedProducts()
  const breadcrumbItems = [
    { href: "/", label: "Accueil" },
    { href: "/catalogue", label: "Catalogue" },
    { href: `/produits/${product.slug}`, label: product.name },
  ]

  return (
    <main className="py-12">
      <ProductStructuredData product={product} siteUrl={publicEnv.urls.site} />
      <BreadcrumbStructuredData items={breadcrumbItems} siteUrl={publicEnv.urls.site} />
      <Container>
        <Breadcrumbs
          items={[
            { href: "/catalogue", label: "Catalogue" },
            { href: `/produits/${product.slug}`, label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ProductGallery product={product} />
          <div className="space-y-6">
            <ProductPurchasePanel product={product} siteUrl={publicEnv.urls.site} />

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent>
                  <Shirt aria-hidden="true" className="h-5 w-5 text-brand-plum" />
                  <h2 className="mt-3 text-sm font-semibold text-brand-ink">Matière</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{product.material}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Ruler aria-hidden="true" className="h-5 w-5 text-brand-plum" />
                  <h2 className="mt-3 text-sm font-semibold text-brand-ink">Guide</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Vérifiez la coupe avant d'envoyer votre demande.
                  </p>
                  <Link
                    href="/guide-des-tailles"
                    className="mt-3 inline-flex text-sm font-medium text-brand-plum hover:text-brand-mauve"
                  >
                    Guide des tailles
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Truck aria-hidden="true" className="h-5 w-5 text-brand-plum" />
                  <h2 className="mt-3 text-sm font-semibold text-brand-ink">Livraison</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Frais et délai confirmés sur WhatsApp selon votre zone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <SectionHeading
              eyebrow={getCategoryName(product.categorySlug)}
              title="Détails du produit"
              description={product.shortDescription}
            />
            <p className="mt-5 text-base leading-8 text-brand-muted">{product.longDescription}</p>
          </div>
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-brand-ink">Entretien</h2>
              <p className="mt-3 text-sm leading-6 text-brand-muted">{product.careInstructions}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-border px-3 py-1 text-xs font-medium text-brand-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Suggestions"
              title="Produits similaires"
              description="Autres pièces proches de cette catégorie ou collection."
            />
            <Link className={buttonStyles({ variant: "outline" })} href="/catalogue">
              Voir tout le catalogue
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={relatedProducts} emptyTitle="Pas encore de suggestion" />
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Navigation"
            title="Récemment consultés"
            description="Cette liste est enregistrée seulement dans votre navigateur."
          />
          <div className="mt-8">
            <RecentlyViewedProducts products={allProducts} currentSlug={product.slug} />
          </div>
        </section>
      </Container>
    </main>
  )
}
