"use client"

import { Heart, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { FormEvent } from "react"

import { Button, Dialog, EmptyState, Input, Textarea, Toast } from "@bibajilbab/ui"

import { ResilientImage } from "@/components/resilient-image"
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon"
import { getCartLineSubtotal } from "@/lib/cart"
import { formatFcfa } from "@/lib/money"
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp"

import { useStorefrontState } from "./store-provider"

interface CheckoutFields {
  name: string
  phone: string
  city: string
  note: string
}

type CheckoutErrors = Partial<Record<keyof CheckoutFields | "cart", string>>

export function CartClient({ siteUrl }: { siteUrl: string }) {
  const { cartLines, cartTotal, updateCartQuantity, removeFromCart, clearCart, addFavorite } =
    useStorefrontState()
  const [fields, setFields] = useState<CheckoutFields>({
    name: "",
    phone: "",
    city: "",
    note: "",
  })
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [clearOpen, setClearOpen] = useState(false)
  const [toast, setToast] = useState<{ title: string; description?: string | undefined }>()
  const hasItems = cartLines.length > 0
  const whatsappPreview = useMemo(() => {
    if (!hasItems || !fields.name || !fields.phone || !fields.city) {
      return ""
    }

    return buildOrderMessage({
      items: cartLines,
      customer: fields,
      siteUrl,
    })
  }, [cartLines, fields, hasItems, siteUrl])

  function updateField(name: keyof CheckoutFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function validate(): CheckoutErrors {
    const nextErrors: CheckoutErrors = {}

    if (!hasItems) nextErrors.cart = "Votre panier est vide."
    if (!fields.name.trim()) nextErrors.name = "Votre nom est requis."
    if (!fields.phone.trim()) nextErrors.phone = "Votre téléphone est requis."
    if (!fields.city.trim()) nextErrors.city = "Votre ville ou zone de livraison est requise."

    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    window.location.href = buildWhatsAppUrl(
      buildOrderMessage({
        items: cartLines,
        customer: {
          name: fields.name.trim(),
          phone: fields.phone.trim(),
          city: fields.city.trim(),
          note: fields.note.trim(),
        },
        siteUrl,
      }),
    )
  }

  function moveToFavorites(lineId: string, slug: string) {
    addFavorite(slug)
    removeFromCart(lineId)
    setToast({ title: "Article déplacé vers les favoris" })
  }

  if (!hasItems) {
    return (
      <EmptyState
        title="Votre panier est vide"
        description="Ajoutez une variante complète avant de préparer une demande WhatsApp."
        action={
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center rounded-card bg-brand-plum px-5 text-sm font-medium text-white transition hover:bg-brand-mauve focus-visible:outline-none focus-visible:shadow-focus"
          >
            Voir le catalogue
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        {toast ? (
          <Toast
            title={toast.title}
            description={toast.description}
            variant="success"
            onClose={() => setToast(undefined)}
          />
        ) : null}
        {cartLines.map((line) => (
          <article
            key={line.lineId}
            className="grid gap-4 rounded-card border border-brand-border bg-white p-4 sm:grid-cols-[96px_1fr]"
          >
            <Link
              href={`/produits/${line.slug}`}
              className="relative aspect-[4/5] overflow-hidden rounded-card bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
            >
              <ResilientImage
                src={line.image.src}
                alt={line.image.alt}
                sizes="112px"
                className="object-cover"
              />
            </Link>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <Link
                  href={`/produits/${line.slug}`}
                  className="text-lg font-semibold text-brand-ink transition hover:text-brand-plum"
                >
                  {line.name}
                </Link>
                <dl className="mt-3 grid gap-1 text-sm text-brand-muted sm:grid-cols-2">
                  <div>
                    <dt className="sr-only">Référence</dt>
                    <dd>Référence : {line.sku}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Taille</dt>
                    <dd>Taille : {line.selectedSize}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Couleur</dt>
                    <dd>Couleur : {line.selectedColor}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Prix unitaire</dt>
                    <dd>Prix unitaire : {formatFcfa(line.unitPrice)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="sr-only">Quantité</span>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(event) =>
                        updateCartQuantity(
                          line.lineId,
                          Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                        )
                      }
                      className="h-11 w-24 rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => moveToFavorites(line.lineId, line.slug)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-card px-3 text-sm font-medium text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    <Heart aria-hidden="true" className="h-4 w-4" />
                    Favoris
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.lineId)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-card px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
              <p className="text-lg font-semibold text-brand-ink">
                {formatFcfa(getCartLineSubtotal(line))}
              </p>
            </div>
          </article>
        ))}
        <Button variant="danger" onClick={() => setClearOpen(true)}>
          Vider le panier
        </Button>
      </section>

      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-card border border-brand-border bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-brand-ink">Finaliser sur WhatsApp</h2>
        <p className="mt-2 text-sm leading-6 text-brand-muted">
          Le total est estimatif. BibaJilbab confirme ensuite la disponibilité, la livraison et le
          montant final.
        </p>
        {errors.cart ? <p className="mt-3 text-sm text-red-700">{errors.cart}</p> : null}
        <div className="mt-5 space-y-4">
          <Input
            label="Nom"
            value={fields.name}
            onChange={(event) => updateField("name", event.target.value)}
            error={errors.name}
          />
          <Input
            label="Téléphone"
            value={fields.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            error={errors.phone}
          />
          <Input
            label="Ville ou zone de livraison"
            value={fields.city}
            onChange={(event) => updateField("city", event.target.value)}
            error={errors.city}
          />
          <Textarea
            label="Note facultative"
            value={fields.note}
            onChange={(event) => updateField("note", event.target.value)}
            rows={4}
          />
        </div>
        <div className="mt-6 border-t border-brand-border pt-5">
          <div className="flex items-center justify-between text-base font-semibold text-brand-ink">
            <span>Total estimatif</span>
            <span>{formatFcfa(cartTotal)}</span>
          </div>
          <Button
            type="submit"
            className="mt-5 w-full bg-[#25D366] text-white hover:bg-[#1FB85A]"
            leftIcon={<WhatsAppIcon className="h-5 w-5" />}
          >
            Finaliser la commande sur WhatsApp
          </Button>
        </div>
        {whatsappPreview ? (
          <details className="mt-4 text-sm text-brand-muted">
            <summary className="cursor-pointer font-medium text-brand-plum">
              Aperçu du message
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-card bg-brand-blush p-3 text-xs leading-5 text-brand-ink">
              {whatsappPreview}
            </pre>
          </details>
        ) : null}
      </form>

      <Dialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Vider le panier ?"
        description="Cette action retire tous les articles enregistrés localement."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearCart()
                setClearOpen(false)
              }}
            >
              Vider
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-muted">
          Le panier est stocké dans ce navigateur. Vous pourrez ajouter les produits à nouveau
          depuis le catalogue.
        </p>
      </Dialog>
    </div>
  )
}
