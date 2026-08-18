import { describe, expect, it } from "vitest"

import { addCartLine, createCartLine, getCartTotal, validateProductSelection } from "./cart"
import { products, type StoreProduct } from "./catalog"
import { filterProducts, parseCatalogFilters, sortProducts } from "./filters"
import {
  favoritesStorageKey,
  isStringArray,
  readJsonStorage,
  writeJsonStorage,
  type StorageLike,
} from "./local-storage"
import { formatFcfa } from "./money"
import { buildOrderMessage, buildWhatsAppUrl } from "./whatsapp"

class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}

function productBySlug(slug: string): StoreProduct {
  const product = products.find((item) => item.slug === slug)

  if (!product) {
    throw new Error(`Produit de test introuvable: ${slug}`)
  }

  return product
}

describe("storefront commerce foundations", () => {
  it("formats XOF amounts as FCFA labels", () => {
    expect(formatFcfa(25000)).toMatch(/^25\s?000 FCFA$/u)
  })

  it("blocks cart additions when a required variant is missing", () => {
    const product = productBySlug("djilbab-premium-poudre")

    expect(validateProductSelection(product, { quantity: 1 })).toMatchObject({
      ok: false,
    })
  })

  it("creates cart lines and calculates totals", () => {
    const product = productBySlug("djilbab-premium-poudre")
    const line = createCartLine(product, {
      sizeId: "m",
      colorId: "rose-poudre",
      quantity: 2,
    })
    const cart = addCartLine([], line)

    expect(line.slug).toBe(product.slug)
    expect(line.selectedSize).toBe("M")
    expect(line.selectedColor).toBe("Rose poudré")
    expect(getCartTotal(cart)).toBe(50000)
  })

  it("persists favorites through a storage adapter", () => {
    const storage = new MemoryStorage()

    expect(writeJsonStorage(storage, favoritesStorageKey, ["khimar-medine-prune"])).toBe(true)
    expect(readJsonStorage(storage, favoritesStorageKey, [], isStringArray)).toEqual([
      "khimar-medine-prune",
    ])
  })

  it("filters and sorts catalogue results", () => {
    const filters = parseCatalogFilters({
      q: "khimar",
      color: "violet-profond",
      sort: "price-asc",
    })
    const filtered = filterProducts(products, filters)
    const sorted = sortProducts(filtered, filters.sort)

    expect(sorted).toHaveLength(1)
    expect(sorted[0]?.slug).toBe("khimar-medine-prune")
  })

  it("builds and encodes a complete WhatsApp cart message", () => {
    const product = productBySlug("tenue-priere-rose")
    const line = createCartLine(product, {
      sizeId: "standard",
      colorId: "rose-clair",
      quantity: 1,
    })
    const message = buildOrderMessage({
      items: [line],
      customer: {
        name: "Awa",
        phone: "770000000",
        city: "Dakar",
        note: "Livraison après appel",
      },
      siteUrl: "https://bibajilbab.com",
    })
    const url = buildWhatsAppUrl(message)
    const encodedMessage = url.split("?text=")[1]

    expect(message).toContain("Bonjour BibaJilbab, je souhaite commander :")
    expect(message).toContain("Référence : BJ-PR-RSE-STANDARD-ROSE-CLAIR")
    expect(message).toContain("Lien : https://bibajilbab.com/produits/tenue-priere-rose")
    expect(url).toMatch(/^https:\/\/wa\.me\/221770825302\?text=/u)
    expect(encodedMessage ? decodeURIComponent(encodedMessage) : "").toBe(message)
  })
})
