import { describe, expect, it } from "vitest"

import { productSchema } from "./schemas"

describe("productSchema", () => {
  it("validates a published product with variants and XOF prices", () => {
    const product = productSchema.parse({
      name: "Khimar soie de medine",
      slug: "khimar-soie-de-medine",
      sku: "BJ-KHM-001",
      shortDescription: "Khimar fluide et opaque pour le quotidien.",
      longDescription: "Un khimar ample, confortable et pense pour une tenue pudique.",
      price: 15000,
      oldPrice: 18000,
      categoryId: "khimars",
      collectionIds: ["nouveautes"],
      tags: ["khimar", "pudeur"],
      images: [
        {
          url: "https://res.cloudinary.com/bibajilbab/image/upload/v1/khimar.jpg",
          alt: "Khimar rose poudré sur cintre",
        },
      ],
      sizes: [{ id: "standard", label: "Standard" }],
      colors: [{ id: "rose-poudre", name: "Rose poudre", hex: "#E9B7C5" }],
      variants: [
        {
          id: "standard-rose-poudre",
          sku: "BJ-KHM-001-RP",
          sizeId: "standard",
          colorId: "rose-poudre",
          stock: 8,
        },
      ],
      material: "Soie de medine",
      careInstructions: "Lavage doux recommande.",
      badge: "Nouveaute",
      featured: true,
      status: "published",
      seo: {
        metaTitle: "Khimar soie de medine | BibaJilbab",
        metaDescription: "Khimar fluide, opaque et confortable disponible chez BibaJilbab.",
      },
      createdAt: "2026-08-16T00:00:00.000Z",
      updatedAt: "2026-08-16T00:00:00.000Z",
    })

    expect(product.currency).toBe("XOF")
    expect(product.variants[0]?.lowStockThreshold).toBe(0)
  })

  it("rejects an old price lower than the current price", () => {
    const result = productSchema.safeParse({
      name: "Djilbab simple",
      slug: "djilbab-simple",
      sku: "BJ-DJB-001",
      shortDescription: "Djilbab ample.",
      longDescription: "Djilbab ample pour la priere et le quotidien.",
      price: 20000,
      oldPrice: 15000,
      categoryId: "djilbabs",
      images: [
        {
          url: "https://res.cloudinary.com/bibajilbab/image/upload/v1/djilbab.jpg",
          alt: "Djilbab noir",
        },
      ],
      seo: {
        metaTitle: "Djilbab simple | BibaJilbab",
        metaDescription: "Djilbab ample et confortable chez BibaJilbab.",
      },
      createdAt: "2026-08-16T00:00:00.000Z",
      updatedAt: "2026-08-16T00:00:00.000Z",
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid promotion prices", () => {
    const product = productSchema.safeParse({
      name: "Promotion invalide",
      slug: "promotion-invalide",
      sku: "BJ-PROMO",
      shortDescription: "Ancien prix invalide",
      longDescription: "Le prix barré doit être supérieur au prix actuel.",
      price: 25000,
      oldPrice: 20000,
      currency: "XOF",
      categoryId: "djilbabs",
      collectionIds: [],
      tags: [],
      images: [
        {
          url: "https://res.cloudinary.com/bibajilbab/image/upload/v1/promotion.jpg",
          alt: "Produit test",
          position: 0,
        },
      ],
      sizes: [],
      colors: [],
      variants: [],
      featured: false,
      status: "draft",
      seo: {
        metaTitle: "Promotion invalide",
        metaDescription: "Ancien prix invalide",
        noIndex: true,
      },
      createdAt: "2026-08-16T00:00:00.000Z",
      updatedAt: "2026-08-16T00:00:00.000Z",
    })

    expect(product.success).toBe(false)
  })
})
