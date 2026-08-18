import { brandConfig } from "@bibajilbab/config"

import type { CartLine } from "./cart"
import { getCartLineSubtotal, getCartTotal } from "./cart"
import type { StoreProduct } from "./catalog"
import { formatFcfa } from "./money"

export const whatsappBaseUrl = `https://wa.me/${brandConfig.whatsapp.technical}`

export interface WhatsAppCustomer {
  name: string
  phone: string
  city: string
  note?: string
}

export function buildWhatsAppUrl(message: string): string {
  return `${whatsappBaseUrl}?text=${encodeURIComponent(message)}`
}

export function buildGeneralWhatsAppMessage(): string {
  return "Bonjour BibaJilbab, je souhaiterais obtenir des informations sur vos produits."
}

export function buildGeneralWhatsAppUrl(): string {
  return buildWhatsAppUrl(buildGeneralWhatsAppMessage())
}

function productUrl(siteUrl: string, slug: string): string {
  return new URL(`/produits/${slug}`, siteUrl).toString()
}

export function buildOrderMessage({
  items,
  customer,
  siteUrl,
}: {
  items: CartLine[]
  customer: WhatsAppCustomer
  siteUrl: string
}): string {
  const lines = items.flatMap((item, index) => [
    `${index + 1}. ${item.name}`,
    `   Référence : ${item.sku}`,
    `   Taille : ${item.selectedSize}`,
    `   Couleur : ${item.selectedColor}`,
    `   Quantité : ${item.quantity}`,
    `   Prix unitaire : ${formatFcfa(item.unitPrice)}`,
    `   Sous-total : ${formatFcfa(getCartLineSubtotal(item))}`,
    `   Lien : ${productUrl(siteUrl, item.slug)}`,
    "",
  ])

  return [
    "Bonjour BibaJilbab, je souhaite commander :",
    "",
    ...lines,
    `Total estimatif : ${formatFcfa(getCartTotal(items))}`,
    "",
    `Nom : ${customer.name}`,
    `Téléphone : ${customer.phone}`,
    `Ville/zone : ${customer.city}`,
    `Note : ${customer.note?.trim() || "Aucune"}`,
    "",
    "Merci de me confirmer la disponibilité, les frais de livraison et le montant final.",
  ].join("\n")
}

export function buildProductInquiryMessage({
  product,
  selectedSize,
  selectedColor,
  quantity,
  siteUrl,
}: {
  product: StoreProduct
  selectedSize: string
  selectedColor: string
  quantity: number
  siteUrl: string
}): string {
  return [
    "Bonjour BibaJilbab, je souhaite commander :",
    "",
    `1. ${product.name}`,
    `   Référence : ${product.sku}`,
    `   Taille : ${selectedSize}`,
    `   Couleur : ${selectedColor}`,
    `   Quantité : ${quantity}`,
    `   Prix unitaire : ${formatFcfa(product.price)}`,
    `   Sous-total : ${formatFcfa(product.price * quantity)}`,
    `   Lien : ${productUrl(siteUrl, product.slug)}`,
    "",
    `Total estimatif : ${formatFcfa(product.price * quantity)}`,
    "",
    "Nom :",
    "Téléphone :",
    "Ville/zone :",
    "Note :",
    "",
    "Merci de me confirmer la disponibilité, les frais de livraison et le montant final.",
  ].join("\n")
}
