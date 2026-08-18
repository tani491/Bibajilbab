import { z } from "zod"

import {
  categorySchema,
  collectionSchema,
  faqSchema,
  homepageSectionSchema,
  mediaSchema,
  productColorSchema,
  productImageSchema,
  productSchema,
  productSizeSchema,
  productVariantSchema,
  siteSettingsSchema,
  testimonialSchema,
} from "@bibajilbab/types"

import { adminRoleSchema } from "./permissions"

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
})

const csvListSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )

const optionalCsvListSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )

const optionalMoneyStringSchema = z
  .string()
  .trim()
  .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
  .pipe(z.number().int().nonnegative().optional())

const moneyStringSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => Number.parseInt(value, 10))
  .pipe(z.number().int().nonnegative())

const optionalStringSchema = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "produit"
  )
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength).trim() : value
}

const optionalUrlStringSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
)

const nonNegativeIntegerFormSchema = z.coerce.number().int().nonnegative().default(0)

const optionalPositiveIntegerFormSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().positive().optional(),
)

const optionalRatingFormSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(1).max(5).optional(),
)

const optionalDateTimeFormSchema = z
  .string()
  .trim()
  .transform((value) => (value ? new Date(value).toISOString() : undefined))
  .optional()

export const productFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  slug: optionalStringSchema,
  sku: z.string().trim().min(1).max(80),
  shortDescription: z.string().trim().min(1).max(220),
  longDescription: optionalStringSchema,
  price: moneyStringSchema,
  oldPrice: optionalMoneyStringSchema,
  categoryId: z.string().trim().min(1),
  collectionIds: csvListSchema,
  tags: optionalCsvListSchema,
  material: z.string().trim().max(160).optional(),
  careInstructions: z.string().trim().max(500).optional(),
  badge: z.string().trim().max(40).optional(),
  featured: z.enum(["on"]).optional().transform(Boolean),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: optionalStringSchema,
  seoDescription: optionalStringSchema,
  imagesJson: z.string().trim().min(2),
  sizesJson: z.string().trim().min(2),
  colorsJson: z.string().trim().min(2),
  variantsJson: z.string().trim().min(2),
  heroEnabled: z.enum(["on"]).optional().transform(Boolean),
  heroWasEnabled: z.enum(["on"]).optional().transform(Boolean),
  heroMediaJson: z.string().trim().optional(),
})

function parseJsonArray<T>(value: string, schema: z.ZodType<T>): T[] {
  const parsed: unknown = JSON.parse(value)

  return z.array(schema).parse(parsed)
}

export function productFromFormData(formData: FormData) {
  const parsed = productFormSchema.parse(Object.fromEntries(formData))
  const now = new Date().toISOString()
  const product = productSchema.parse({
    id: parsed.id || undefined,
    name: parsed.name,
    slug: slugify(parsed.slug ?? parsed.name),
    sku: parsed.sku,
    shortDescription: parsed.shortDescription,
    longDescription: parsed.longDescription ?? parsed.shortDescription,
    price: parsed.price,
    oldPrice: parsed.oldPrice,
    currency: "XOF",
    categoryId: parsed.categoryId,
    collectionIds: parsed.collectionIds,
    tags: parsed.tags,
    images: parseJsonArray(parsed.imagesJson, productImageSchema),
    sizes: parseJsonArray(parsed.sizesJson, productSizeSchema),
    colors: parseJsonArray(parsed.colorsJson, productColorSchema),
    variants: parseJsonArray(parsed.variantsJson, productVariantSchema),
    material: parsed.material || undefined,
    careInstructions: parsed.careInstructions || undefined,
    badge: parsed.badge || undefined,
    featured: parsed.featured,
    status: parsed.status,
    seo: {
      metaTitle: truncate(parsed.seoTitle ?? parsed.name, 70),
      metaDescription: truncate(parsed.seoDescription ?? parsed.shortDescription, 160),
      noIndex: parsed.status !== "published",
    },
    createdAt: now,
    updatedAt: now,
  })

  return product
}

function parseOptionalHeroMedia(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const parsed: unknown = JSON.parse(value)
  const media = productImageSchema.parse(parsed)
  const kind =
    parsed && typeof parsed === "object" && (parsed as { kind?: unknown }).kind === "video"
      ? "video"
      : "image"

  return { ...media, kind }
}

export function productHeroFromFormData(formData: FormData) {
  const parsed = productFormSchema.parse(Object.fromEntries(formData))

  return {
    enabled: parsed.heroEnabled,
    wasEnabled: parsed.heroWasEnabled,
    media: parseOptionalHeroMedia(parsed.heroMediaJson),
  }
}

export const categoryFormSchema = categorySchema
  .omit({ createdAt: true, updatedAt: true, image: true, seo: true })
  .extend({
    id: z.string().trim().optional(),
    description: optionalStringSchema,
    imageJson: z.string().trim().optional(),
    position: nonNegativeIntegerFormSchema,
    seoTitle: z.string().trim().max(70).optional(),
    seoDescription: z.string().trim().max(160).optional(),
  })

export const collectionFormSchema = collectionSchema
  .omit({ createdAt: true, updatedAt: true, image: true, seo: true })
  .extend({
    id: z.string().trim().optional(),
    description: optionalStringSchema,
    imageJson: z.string().trim().optional(),
    startsAt: optionalDateTimeFormSchema,
    endsAt: optionalDateTimeFormSchema,
    position: nonNegativeIntegerFormSchema,
    seoTitle: z.string().trim().max(70).optional(),
    seoDescription: z.string().trim().max(160).optional(),
  })

export const mediaFormSchema = mediaSchema
  .omit({ createdAt: true, updatedAt: true, cloudinaryPublicId: true })
  .extend({
    id: z.string().trim().optional(),
    cloudinaryPublicId: optionalStringSchema,
    width: optionalPositiveIntegerFormSchema,
    height: optionalPositiveIntegerFormSchema,
    focalX: z.coerce.number().min(0).max(100).default(50),
    focalY: z.coerce.number().min(0).max(100).default(50),
    usage: z.string().trim().max(160).optional(),
  })

export const siteSettingsFormSchema = siteSettingsSchema.omit({ updatedAt: true }).extend({
  id: z.string().trim().optional(),
  announcement: z.string().trim().max(180).optional(),
  heroTitle: z.string().trim().max(120).optional(),
  heroDescription: z.string().trim().max(500).optional(),
  heroDesktopMediaId: z.string().trim().optional(),
  heroMobileMediaId: z.string().trim().optional(),
  maintenanceMode: z.enum(["on"]).optional().transform(Boolean),
  legalName: z.string().trim().max(160).optional(),
  logoUrl: optionalUrlStringSchema,
  contactEmail: optionalStringSchema,
  deliveryPolicy: optionalStringSchema,
  returnsPolicy: optionalStringSchema,
  sizeGuide: optionalStringSchema,
  footerText: optionalStringSchema,
  legalNotice: optionalStringSchema,
  termsSummary: optionalStringSchema,
  privacySummary: optionalStringSchema,
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
})

export const faqFormSchema = faqSchema.omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().trim().optional(),
  position: nonNegativeIntegerFormSchema,
})

export const testimonialFormSchema = testimonialSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().trim().optional(),
    rating: optionalRatingFormSchema,
    position: nonNegativeIntegerFormSchema,
  })

export const homepageSectionFormSchema = homepageSectionSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().trim().optional(),
    body: optionalStringSchema,
    ctaLabel: optionalStringSchema,
    ctaHref: optionalStringSchema,
    productIds: csvListSchema,
    collectionId: optionalStringSchema,
    mediaId: optionalStringSchema,
    position: nonNegativeIntegerFormSchema,
  })

export const contentPreviewQuerySchema = z.object({
  storefrontPath: optionalUrlStringSchema,
})

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1),
  delta: z.coerce.number().int(),
  reason: z.string().trim().min(3).max(240),
})

export const requestStatusSchema = z.enum([
  "draft",
  "whatsappInitiated",
  "toConfirm",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
])

export const orderRequestUpdateSchema = z.object({
  requestId: z.string().trim().min(1),
  status: requestStatusSchema,
  internalNote: z.string().trim().max(700).optional(),
})

export const adminUserInviteSchema = z.object({
  email: z.string().trim().email(),
  displayName: z.string().trim().min(1).max(120),
  role: adminRoleSchema,
})

export const adminUserRoleUpdateSchema = z.object({
  uid: z.string().trim().min(1),
  role: adminRoleSchema,
})

export const adminUserStatusUpdateSchema = z.object({
  uid: z.string().trim().min(1),
  status: z.enum(["active", "disabled"]),
})
