import type { Product } from "@bibajilbab/types"
import { Card, CardContent } from "@bibajilbab/ui/server"

import { saveProductAction } from "@/lib/admin-actions"
import type { AdminMainHeroSection } from "@/lib/admin-data"

import { ActionForm } from "./action-feedback"
import { ProductHeroFields } from "./product-hero-fields"
import { ProductTaxonomyFields } from "./product-taxonomy-fields"
import type { ProductTaxonomyOption } from "./product-taxonomy-fields"
import { ProductVisualFields } from "./product-visual-fields"

interface ProductFormProps {
  product?: (Partial<Product> & { id?: string }) | undefined
  categories: ProductTaxonomyOption[]
  collections: ProductTaxonomyOption[]
  heroSection?: AdminMainHeroSection | null | undefined
}

function defaultAvailabilityStatus(product: ProductFormProps["product"]) {
  if (product?.badge === "Promotion") {
    return "promotion"
  }

  if (product?.inStock === false) {
    return "outOfStock"
  }

  if (
    Array.isArray(product?.variants) &&
    product.variants.length > 0 &&
    product.variants.every((variant) => variant.stock <= 0 || variant.status === "inactive")
  ) {
    return "outOfStock"
  }

  return "inStock"
}

export function ProductForm({ product, categories, collections, heroSection }: ProductFormProps) {
  const isHeroProduct = Boolean(
    product?.id && heroSection?.productIds.some((productId) => productId === product.id),
  )
  const availabilityStatus = defaultAvailabilityStatus(product)

  return (
    <Card>
      <CardContent>
        <ActionForm action={saveProductAction} submitLabel="Enregistrer le produit">
          <input type="hidden" name="id" defaultValue={product?.id ?? ""} />
          <input type="hidden" name="sku" defaultValue={product?.sku ?? ""} />
          <input type="hidden" name="status" defaultValue={product?.status ?? "published"} />
          <input type="hidden" name="tags" defaultValue={product?.tags?.join(", ") ?? ""} />
          <input type="hidden" name="material" defaultValue={product?.material ?? ""} />
          <input
            type="hidden"
            name="careInstructions"
            defaultValue={product?.careInstructions ?? ""}
          />
          {product?.featured ? <input type="hidden" name="featured" value="on" /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            <section className="grid gap-4 rounded-card border border-brand-border bg-white p-4 md:col-span-2 md:grid-cols-2">
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Nom du produit</span>
                <input
                  name="name"
                  defaultValue={product?.name ?? ""}
                  required
                  className="h-11 w-full rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                />
              </label>
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Prix XOF</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={product?.price ?? 0}
                  required
                  className="h-11 w-full rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                />
              </label>
              <label className="text-sm font-medium text-brand-ink md:col-span-2">
                <span className="mb-2 block">Description courte</span>
                <input
                  name="shortDescription"
                  defaultValue={product?.shortDescription ?? ""}
                  placeholder="Une phrase claire pour donner envie de découvrir le vêtement."
                  required
                  className="h-11 w-full rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                />
              </label>
            </section>

            <ProductTaxonomyFields
              categories={categories}
              collections={collections}
              defaultCategoryId={product?.categoryId}
              defaultCollectionIds={product?.collectionIds}
            />

            <section className="grid gap-4 rounded-card border border-brand-border bg-white p-4 md:col-span-2 md:grid-cols-2">
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Statut global</span>
                <select
                  name="availabilityStatus"
                  defaultValue={availabilityStatus}
                  className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                >
                  <option value="inStock">En stock</option>
                  <option value="outOfStock">En rupture</option>
                  <option value="promotion">En promotion</option>
                </select>
              </label>
            </section>

            <ProductHeroFields
              defaultEnabled={isHeroProduct}
              defaultDesktopImage={isHeroProduct ? heroSection?.heroDesktopMedia : undefined}
              defaultVideoUrl={isHeroProduct ? heroSection?.heroVideoUrl : undefined}
            />

            {product ? <ProductVisualFields product={product} /> : <ProductVisualFields />}
          </div>
        </ActionForm>
      </CardContent>
    </Card>
  )
}
