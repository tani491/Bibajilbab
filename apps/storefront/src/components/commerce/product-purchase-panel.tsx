"use client"

import { Heart, ShoppingBag } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button, Toast, buttonStyles, cn } from "@bibajilbab/ui"

import { createCartLine, validateProductSelection } from "@/lib/cart"
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon"
import type { StoreProduct } from "@/lib/catalog"
import { getProductStock } from "@/lib/catalog"
import { formatFcfa } from "@/lib/money"
import { buildProductInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp"

import { useStorefrontState } from "./store-provider"

export function ProductPurchasePanel({
  product,
  siteUrl,
}: {
  product: StoreProduct
  siteUrl: string
}) {
  const { addToCart, isFavorite, toggleFavorite, registerRecentlyViewed } = useStorefrontState()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<{
    title: string
    description?: string | undefined
  }>()
  const [selectionNotice, setSelectionNotice] = useState("")
  const favorite = isFavorite(product.slug)

  useEffect(() => {
    registerRecentlyViewed(product.slug)
  }, [product.slug, registerRecentlyViewed])

  const selection = useMemo(
    () => ({
      sizeId: selectedSize || undefined,
      colorId: selectedColor || undefined,
      quantity,
    }),
    [quantity, selectedColor, selectedSize],
  )
  const selectionValidation = validateProductSelection(product, selection)
  const selectedSizeLabel =
    product.sizes.find((size) => size.id === selectedSize)?.label ?? "À choisir"
  const selectedColorLabel =
    product.colors.find((color) => color.id === selectedColor)?.name ?? "À choisir"
  const directWhatsAppHref = selectionValidation.ok
    ? buildWhatsAppUrl(
        buildProductInquiryMessage({
          product,
          selectedSize: selectedSizeLabel,
          selectedColor: selectedColorLabel,
          quantity,
          siteUrl,
        }),
      )
    : undefined

  function handleAddToCart() {
    const validation = validateProductSelection(product, selection)

    if (!validation.ok) {
      setSelectionNotice(validation.message ?? "Sélectionnez une variante disponible.")
      return
    }

    setSelectionNotice("")
    addToCart(createCartLine(product, selection))
    setMessage({
      title: "Produit ajouté au panier",
      description: "Vous pourrez finaliser la demande sur WhatsApp depuis le panier.",
    })
  }

  return (
    <section className="rounded-card border border-brand-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-muted">Référence {product.sku}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-brand-ink">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-semibold text-brand-plum">{formatFcfa(product.price)}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => toggleFavorite(product.slug)}
          leftIcon={
            <Heart
              aria-hidden="true"
              className={cn("h-5 w-5", favorite ? "fill-brand-plum" : null)}
            />
          }
        >
          {favorite ? "Favori" : "Favori"}
        </Button>
      </div>

      <div className="mt-5 rounded-card bg-brand-blush p-4 text-sm text-brand-muted">
        Stock indicatif : {getProductStock(product)} article(s). La disponibilité finale est
        confirmée sur WhatsApp.
      </div>

      <div id="selection" className="mt-6 grid gap-4">
        {product.sizes.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-brand-ink">Taille</legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size.id)
                    setSelectionNotice("")
                  }}
                  className={cn(
                    "min-h-11 rounded-card border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:shadow-focus",
                    selectedSize === size.id
                      ? "border-brand-plum bg-brand-plum text-white ring-2 ring-brand-plum ring-offset-2 ring-offset-white"
                      : "border-brand-border bg-white text-brand-ink hover:border-brand-plum",
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {product.colors.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-brand-ink">
              Couleur : {selectedColorLabel}
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color.id)
                    setSelectionNotice("")
                  }}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-card border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:shadow-focus",
                    selectedColor === color.id
                      ? "border-brand-plum bg-brand-blush text-brand-plum ring-2 ring-brand-plum ring-offset-2 ring-offset-white"
                      : "border-brand-border bg-white text-brand-ink hover:border-brand-plum",
                  )}
                >
                  <span
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-brand-border"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <label className="text-sm font-semibold text-brand-ink">
          <span className="mb-2 block">Quantité</span>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => {
              setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
              setSelectionNotice("")
            }}
            className="h-11 w-28 rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
          />
        </label>

        {selectionNotice ? (
          <p
            role="status"
            className="rounded-card border border-brand-border bg-brand-blush p-3 text-sm leading-6 text-brand-plum"
          >
            {selectionNotice}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          onClick={handleAddToCart}
          leftIcon={<ShoppingBag aria-hidden="true" className="h-5 w-5" />}
        >
          Ajouter au panier
        </Button>
        <a
          href={directWhatsAppHref ?? "#selection"}
          onClick={(event) => {
            if (!directWhatsAppHref) {
              event.preventDefault()
              setSelectionNotice(
                selectionValidation.message ?? "Sélectionnez une variante disponible.",
              )
            }
          }}
          className={buttonStyles({
            className: "bg-[#25D366] text-white hover:bg-[#1FB85A]",
          })}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Commander WhatsApp
        </a>
      </div>

      <a
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-plum transition hover:text-brand-mauve focus-visible:outline-none focus-visible:shadow-focus"
        href={buildWhatsAppUrl(
          `Bonjour BibaJilbab, je souhaite obtenir des informations sur ${product.name} (${product.sku}).`,
        )}
      >
        Demande d'information
      </a>

      {message ? (
        <Toast
          className="mt-5"
          title={message.title}
          description={message.description}
          variant="success"
          onClose={() => setMessage(undefined)}
        />
      ) : null}
    </section>
  )
}
