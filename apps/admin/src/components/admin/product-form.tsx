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

export function ProductForm({ product, categories, collections, heroSection }: ProductFormProps) {
  const isHeroProduct = Boolean(
    product?.id && heroSection?.productIds.some((productId) => productId === product.id),
  )

  return (
    <Card>
      <CardContent>
        <ActionForm action={saveProductAction} submitLabel="Enregistrer le produit">
          <input type="hidden" name="id" defaultValue={product?.id ?? ""} />
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
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Ancien prix facultatif</span>
                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  defaultValue={product?.oldPrice ?? ""}
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
                <span className="mb-2 block">Badge produit</span>
                <select
                  name="badge"
                  defaultValue={product?.badge ?? ""}
                  className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                >
                  <option value="">Aucun badge</option>
                  <option value="Nouveau">Nouveau</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Édition limitée">Édition limitée</option>
                </select>
              </label>
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Visibilité</span>
                <select
                  name="status"
                  defaultValue={product?.status ?? "draft"}
                  className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
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
