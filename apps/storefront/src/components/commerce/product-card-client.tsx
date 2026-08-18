"use client"

import { Heart } from "lucide-react"
import Link from "next/link"

import { Badge, IconButton, cn } from "@bibajilbab/ui"

import { ResilientImage } from "@/components/resilient-image"
import { getCategoryName, type StoreProduct } from "@/lib/catalog"
import { formatFcfa } from "@/lib/money"

import { useStorefrontState } from "./store-provider"

export function ProductCardClient({ product }: { product: StoreProduct }) {
  const { isFavorite, toggleFavorite } = useStorefrontState()
  const favorite = isFavorite(product.slug)
  const image = product.images[0]

  return (
    <article className="group relative overflow-hidden rounded-card border border-brand-border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <Link
        href={`/produits/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:shadow-focus"
        aria-label={`Voir ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-blush">
          <ResilientImage
            src={image?.src ?? "/demo/image-placeholder.svg"}
            alt={image?.alt ?? product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          {product.badge ? (
            <Badge className="absolute left-3 top-3" variant="plum">
              {product.badge}
            </Badge>
          ) : null}
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-medium uppercase text-brand-muted">
              {getCategoryName(product.categorySlug)}
            </p>
            <h3 className="mt-1 text-base font-semibold text-brand-ink">{product.name}</h3>
          </div>
          <p className="text-lg font-semibold text-brand-plum">{formatFcfa(product.price)}</p>
          <div className="flex flex-wrap items-center gap-2">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color.id}
                className={cn(
                  "h-5 w-5 rounded-full border border-brand-border",
                  color.hex === "#FFFFFF" ? "shadow-inner" : null,
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
            {product.sizes.slice(0, 2).map((size) => (
              <span
                key={size.id}
                className="rounded-full border border-brand-border px-2 py-1 text-xs text-brand-muted"
              >
                {size.label}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <IconButton
        className="absolute right-3 top-3 bg-white/95"
        label={
          favorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`
        }
        icon={
          <Heart
            aria-hidden="true"
            className={cn("h-5 w-5", favorite ? "fill-brand-plum text-brand-plum" : null)}
          />
        }
        onClick={() => toggleFavorite(product.slug)}
      />
    </article>
  )
}
