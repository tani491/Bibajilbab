import { z } from "zod"

import {
  categorySchema,
  collectionSchema,
  faqSchema,
  homepageSectionSchema,
  mediaSchema,
  productColorSchema,
  productImageSchema,
  productImageUrlSchema,
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
  .preprocess((value) => (value === undefined ? "" : value), z.string().trim())
  .transform((value) => {
    const amount = value ? Number.parseInt(value, 10) : 0

    return amount > 0 ? amount : undefined
  })
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

const ratingFormSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(1).max(5).default(5),
)

const optionalDateTimeFormSchema = z
  .string()
  .trim()
  .transform((value) => (value ? new Date(value).toISOString() : undefined))
  .optional()

const optionalSwitchSchema = z
  .preprocess((value) => (value === "" ? undefined : value), z.enum(["on"]).optional())
  .transform(Boolean)

export const productAvailabilityStatusSchema = z.enum(["inStock", "outOfStock", "promotion"])

export const productFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  slug: optionalStringSchema,
  sku: optionalStringSchema,
  shortDescription: z.string().trim().min(1).max(220),
  longDescription: optionalStringSchema,
  price: moneyStringSchema,
  oldPrice: optionalMoneyStringSchema,
  categoryId: optionalStringSchema,
  collectionIds: csvListSchema,
  tags: optionalCsvListSchema,
  material: z.string().trim().max(160).optional(),
  careInstructions: z.string().trim().max(500).optional(),
  badge: z.string().trim().max(40).optional(),
  featured: optionalSwitchSchema,
  status: z.enum(["draft", "published", "archived"]).default("published"),
  availabilityStatus: productAvailabilityStatusSchema.default("inStock"),
  seoTitle: optionalStringSchema,
  seoDescription: optionalStringSchema,
  imagesJson: z.string().trim().min(2),
  sizesJson: z.string().trim().min(2),
  colorsJson: z.string().trim().min(2),
  variantsJson: z.string().trim().min(2),
  heroEnabled: optionalSwitchSchema,
  heroWasEnabled: optionalSwitchSchema,
  heroMediaJson: z.string().trim().optional(),
})

function parseJsonArray<TSchema extends z.ZodTypeAny>(
  value: string,
  schema: TSchema,
): z.output<TSchema>[] {
  const parsed: unknown = JSON.parse(value)

  return z.array(schema).parse(parsed)
}

function productImageUrlFromInput(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  if (value && typeof value === "object") {
    const image = value as { secure_url?: unknown; src?: unknown; url?: unknown }

    return typeof image.url === "string"
      ? image.url
      : typeof image.secure_url === "string"
        ? image.secure_url
        : image.src
  }

  return value
}

function parseProductImages(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    const images = z
      .array(z.unknown())
      .parse(parsed)
      .map(productImageUrlFromInput)
      .map((image) => productImageUrlSchema.parse(image))

    if (images.length === 0) {
      throw new Error(
        "Ajoutez au moins une image valide au produit avant d'enregistrer.",
      )
    }

    return images
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new Error(
        "Ajoutez au moins une image valide au produit : URL HTTPS, Cloudinary/Firebase, data:image ou blob.",
      )
    }

    throw error
  }
}

function skuFromSlug(slug: string): string {
  return `BJ-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 56)}`.replace(
    /-+$/u,
    "",
  )
}

function variantSku(baseSku: string, sizeId: string | undefined, colorId: string | undefined) {
  return [baseSku, sizeId, colorId].filter(Boolean).join("-").toUpperCase()
}

function normalizeProductVariants({
  variants,
  baseSku,
  availabilityStatus,
}: {
  variants: z.output<typeof productVariantSchema>[]
  baseSku: string
  availabilityStatus: z.infer<typeof productAvailabilityStatusSchema>
}) {
  const visible = availabilityStatus !== "outOfStock"
  const sourceVariants =
    variants.length > 0
      ? variants
      : [
          {
            id: "standard",
            sku: baseSku,
            stock: visible ? 1 : 0,
            lowStockThreshold: 0,
            status: visible ? "active" : "inactive",
          } satisfies z.infer<typeof productVariantSchema>,
        ]

  return sourceVariants.map((variant) => ({
    ...variant,
    sku: variant.sku?.trim() || variantSku(baseSku, variant.sizeId, variant.colorId),
    stock: visible ? Math.max(variant.stock, 1) : 0,
    lowStockThreshold: variant.lowStockThreshold ?? 0,
    status: visible ? "active" : "inactive",
  }))
}

export function productFromFormData(formData: FormData) {
  const parsed = productFormSchema.parse(Object.fromEntries(formData))
  const now = new Date().toISOString()
  const slug = slugify(parsed.slug ?? parsed.name)
  const sku = parsed.sku ?? skuFromSlug(slug)
  const variants = normalizeProductVariants({
    variants: parseJsonArray(parsed.variantsJson, productVariantSchema),
    baseSku: sku,
    availabilityStatus: parsed.availabilityStatus,
  })
  const product = productSchema.parse({
    id: parsed.id || undefined,
    name: parsed.name,
    slug,
    sku,
    shortDescription: parsed.shortDescription,
    longDescription: parsed.longDescription ?? parsed.shortDescription,
    price: parsed.price,
    oldPrice: undefined,
    currency: "XOF",
    categoryId: parsed.categoryId ?? "non-classe",
    collectionIds: parsed.collectionIds,
    tags: parsed.tags,
    images: parseProductImages(parsed.imagesJson),
    sizes: parseJsonArray(parsed.sizesJson, productSizeSchema),
    colors: parseJsonArray(parsed.colorsJson, productColorSchema),
    variants,
    material: parsed.material || undefined,
    careInstructions: parsed.careInstructions || undefined,
    badge: parsed.availabilityStatus === "promotion" ? "Promotion" : undefined,
    featured: parsed.featured,
    inStock: parsed.availabilityStatus !== "outOfStock",
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
  imageJson: z.string().trim().optional(),
  announcement: optionalStringSchema,
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
    city: optionalStringSchema,
    rating: ratingFormSchema,
    verifiedPurchase: optionalSwitchSchema,
    isPublished: optionalSwitchSchema,
    orderIndex: nonNegativeIntegerFormSchema,
  })

export const testimonialPublicationSchema = z.object({
  id: z.string().trim().min(1),
  isPublished: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
})

export const testimonialDeleteSchema = z.object({
  id: z.string().trim().min(1),
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
