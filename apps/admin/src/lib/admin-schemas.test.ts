import { describe, expect, it } from "vitest"

import {
  orderRequestUpdateSchema,
  productFromFormData,
  siteSettingsFormSchema,
} from "./admin-schemas"

function productFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const values = {
    name: "Djilbab test",
    slug: "djilbab-test",
    sku: "BJ-TEST",
    shortDescription: "Description courte",
    longDescription: "Description longue validée.",
    price: "25000",
    oldPrice: "30000",
    categoryId: "djilbabs",
    collectionIds: "nouveautes",
    tags: "test, pudeur",
    material: "Tissu fluide",
    careInstructions: "Lavage doux",
    badge: "Nouveau",
    status: "published",
    seoTitle: "Djilbab test",
    seoDescription: "Produit de test BibaJilbab",
    imagesJson:
      '[{"url":"https://res.cloudinary.com/bibajilbab/image/upload/v1/test.jpg","alt":"Djilbab test","position":0}]',
    sizesJson: '[{"id":"standard","label":"Standard"}]',
    colorsJson: '[{"id":"rose-poudre","name":"Rose poudré","hex":"#E9B7C5"}]',
    variantsJson:
      '[{"id":"standard-rose","sku":"BJ-TEST-STANDARD-ROSE","sizeId":"standard","colorId":"rose-poudre","stock":3,"lowStockThreshold":1,"status":"active"}]',
    ...overrides,
  }

  Object.entries(values).forEach(([key, value]) => formData.set(key, value))

  return formData
}

describe("admin form schemas", () => {
  it("validates product creation with images, variants and publication metadata", () => {
    const product = productFromFormData(productFormData())

    expect(product.status).toBe("published")
    expect(product.seo.noIndex).toBe(false)
    expect(product.images[0]?.alt).toBe("Djilbab test")
    expect(product.variants[0]?.stock).toBe(3)
  })

  it("rejects product publication without a real image URL", () => {
    expect(() => productFromFormData(productFormData({ imagesJson: "[]" }))).toThrow()
  })

  it("validates site settings and WhatsApp request statuses", () => {
    const settings = siteSettingsFormSchema.parse({
      brandName: "BibaJilbab",
      slogan: "Pudeur",
      whatsappDisplay: "+221 77 082 53 02",
      whatsappTechnical: "221770825302",
      instagramUrl: "https://www.instagram.com/bibajilbab97/",
      tiktokUrl: "https://www.tiktok.com/@habibabibajilbaba",
      currency: "XOF",
      locale: "fr-SN",
      isPublic: true,
    })

    expect(settings.whatsappTechnical).toBe("221770825302")
    expect(
      orderRequestUpdateSchema.parse({ requestId: "req-1", status: "confirmed" }),
    ).toMatchObject({
      status: "confirmed",
    })
  })
})
