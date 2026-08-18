"use client"

import { ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button, EmptyState, Toast } from "@bibajilbab/ui"

import { ResilientImage } from "@/components/resilient-image"
import { createCartLine, validateProductSelection } from "@/lib/cart"
import type { StoreProduct } from "@/lib/catalog"
import { formatFcfa } from "@/lib/money"

import { useStorefrontState } from "./store-provider"

interface FavoriteSelection {
  sizeId: string
  colorId: string
}

export function FavoritesClient({ products }: { products: StoreProduct[] }) {
  const { favorites, removeFavorite, addToCart } = useStorefrontState()
  const [selections, setSelections] = useState<Record<string, FavoriteSelection>>({})
  const [toast, setToast] = useState<{
    title: string
    description?: string | undefined
    error?: boolean
  }>()
  const favoriteProducts = products.filter((product) => favorites.includes(product.slug))

  function updateSelection(slug: string, selection: Partial<FavoriteSelection>) {
    setSelections((current) => ({
      ...current,
      [slug]: {
        sizeId: current[slug]?.sizeId ?? "",
        colorId: current[slug]?.colorId ?? "",
        ...selection,
      },
    }))
  }

  function moveToCart(product: StoreProduct) {
    const selection = selections[product.slug] ?? { sizeId: "", colorId: "" }
    const productSelection = {
      sizeId: selection.sizeId || undefined,
      colorId: selection.colorId || undefined,
      quantity: 1,
    }
    const validation = validateProductSelection(product, productSelection)

    if (!validation.ok) {
      setToast({ title: "Sélection requise", description: validation.message, error: true })
      return
    }

    addToCart(createCartLine(product, productSelection))
    removeFavorite(product.slug)
    setToast({ title: "Produit déplacé vers le panier" })
  }

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        title="Aucun favori pour l'instant"
        description="Ajoutez des produits au fil de votre navigation, sans créer de compte."
        action={
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center rounded-card bg-brand-plum px-5 text-sm font-medium text-white transition hover:bg-brand-mauve focus-visible:outline-none focus-visible:shadow-focus"
          >
            Découvrir le catalogue
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.error ? "error" : "success"}
          onClose={() => setToast(undefined)}
        />
      ) : null}
      <div className="grid gap-4">
        {favoriteProducts.map((product) => {
          const image = product.images[0]
          const selection = selections[product.slug] ?? { sizeId: "", colorId: "" }

          return (
            <article
              key={product.id}
              className="grid gap-4 rounded-card border border-brand-border bg-white p-4 sm:grid-cols-[96px_1fr] lg:grid-cols-[112px_1fr_auto]"
            >
              <Link
                href={`/produits/${product.slug}`}
                className="relative aspect-[4/5] overflow-hidden rounded-card bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
              >
                <ResilientImage
                  src={image?.src ?? "/demo/image-placeholder.svg"}
                  alt={image?.alt ?? product.name}
                  sizes="112px"
                  className="object-cover"
                />
              </Link>
              <div>
                <Link
                  href={`/produits/${product.slug}`}
                  className="text-lg font-semibold text-brand-ink transition hover:text-brand-plum"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-brand-muted">Référence {product.sku}</p>
                <p className="mt-3 text-base font-semibold text-brand-plum">
                  {formatFcfa(product.price)}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Taille</span>
                    <select
                      value={selection.sizeId}
                      onChange={(event) =>
                        updateSelection(product.slug, { sizeId: event.target.value })
                      }
                      className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                    >
                      <option value="">Choisir</option>
                      {product.sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Couleur</span>
                    <select
                      value={selection.colorId}
                      onChange={(event) =>
                        updateSelection(product.slug, { colorId: event.target.value })
                      }
                      className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                    >
                      <option value="">Choisir</option>
                      {product.colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                <Button
                  onClick={() => moveToCart(product)}
                  leftIcon={<ShoppingBag aria-hidden="true" className="h-4 w-4" />}
                >
                  Déplacer vers le panier
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => removeFavorite(product.slug)}
                  leftIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                >
                  Retirer
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
