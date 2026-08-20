import { z } from "zod"

export const documentIdSchema = z.string().trim().min(1).max(160)
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit etre en minuscules, sans accents.")
export const currencySchema = z.literal("XOF")
export const moneyAmountSchema = z.number().int().nonnegative()
export const publicationStatusSchema = z.enum(["draft", "published", "archived"])
export const adminRoleSchema = z.enum(["admin", "editor"])
export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

export const timestampLikeSchema = z.union([
  z.string().datetime(),
  z.date(),
  z.object({
    seconds: z.number().int(),
    nanoseconds: z.number().int().min(0).max(999999999),
  }),
])

export const seoMetadataSchema = z.object({
  metaTitle: z.string().trim().min(1).max(70),
  metaDescription: z.string().trim().min(1).max(160),
  canonicalUrl: z.string().url().optional(),
  ogImageUrl: z.string().url().optional(),
  noIndex: z.boolean().default(false),
})

export const productImageSchema = z.object({
  id: documentIdSchema.optional(),
  url: z.string().url(),
  cloudinaryPublicId: z.string().trim().min(1).optional(),
  alt: z.string().trim().min(1).max(140),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  position: z.number().int().nonnegative().default(0),
})

export const productSizeSchema = z.object({
  id: documentIdSchema,
  label: z.string().trim().min(1).max(40),
  description: z.string().trim().max(120).optional(),
})

export const productColorSchema = z.object({
  id: documentIdSchema,
  name: z.string().trim().min(1).max(60),
  hex: hexColorSchema.optional(),
})

export const productVariantSchema = z.object({
  id: documentIdSchema,
  sku: z.string().trim().min(1).max(80),
  sizeId: documentIdSchema.optional(),
  colorId: documentIdSchema.optional(),
  price: moneyAmountSchema.optional(),
  oldPrice: moneyAmountSchema.optional(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const productSchema = z
  .object({
    id: documentIdSchema.optional(),
    name: z.string().trim().min(1).max(120),
    slug: slugSchema,
    sku: z.string().trim().min(1).max(80),
    shortDescription: z.string().trim().min(1).max(220),
    longDescription: z.string().trim().min(1).max(4000),
    price: moneyAmountSchema,
    oldPrice: moneyAmountSchema.optional(),
    currency: currencySchema.default("XOF"),
    categoryId: documentIdSchema,
    collectionIds: z.array(documentIdSchema).default([]),
    tags: z.array(z.string().trim().min(1).max(40)).default([]),
    images: z.array(productImageSchema).min(1),
    sizes: z.array(productSizeSchema).default([]),
    colors: z.array(productColorSchema).default([]),
    variants: z.array(productVariantSchema).default([]),
    material: z.string().trim().max(160).optional(),
    careInstructions: z.string().trim().max(500).optional(),
    badge: z.string().trim().max(40).optional(),
    featured: z.boolean().default(false),
    status: publicationStatusSchema.default("draft"),
    seo: seoMetadataSchema,
    createdAt: timestampLikeSchema,
    updatedAt: timestampLikeSchema,
  })
  .refine(
    (product) =>
      product.oldPrice === undefined ||
      product.oldPrice <= 0 ||
      product.oldPrice > product.price,
    {
    message: "L'ancien prix doit etre superieur au prix actuel.",
    path: ["oldPrice"],
    },
  )

export const categorySchema = z.object({
  id: documentIdSchema.optional(),
  name: z.string().trim().min(1).max(90),
  slug: slugSchema,
  description: z.string().trim().max(500).optional(),
  image: productImageSchema.optional(),
  position: z.number().int().nonnegative().default(0),
  status: publicationStatusSchema.default("draft"),
  seo: seoMetadataSchema.optional(),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const collectionSchema = z.object({
  id: documentIdSchema.optional(),
  name: z.string().trim().min(1).max(90),
  slug: slugSchema,
  description: z.string().trim().max(700).optional(),
  type: z.enum(["permanent", "tabaski", "korite", "seasonal"]).default("permanent"),
  image: productImageSchema.optional(),
  startsAt: timestampLikeSchema.optional(),
  endsAt: timestampLikeSchema.optional(),
  position: z.number().int().nonnegative().default(0),
  status: publicationStatusSchema.default("draft"),
  seo: seoMetadataSchema.optional(),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const siteSettingsSchema = z.object({
  id: documentIdSchema.optional(),
  brandName: z.string().trim().min(1).default("BibaJilbab"),
  slogan: z.string().trim().min(1),
  whatsappDisplay: z.string().trim().min(1),
  whatsappTechnical: z
    .string()
    .trim()
    .regex(/^[0-9]+$/),
  instagramUrl: z.string().url(),
  tiktokUrl: z.string().url(),
  currency: currencySchema.default("XOF"),
  locale: z.literal("fr-SN").default("fr-SN"),
  isPublic: z.boolean().default(true),
  updatedAt: timestampLikeSchema,
})

export const homepageSectionSchema = z.object({
  id: documentIdSchema.optional(),
  kind: z.enum(["hero", "featuredProducts", "collectionHighlight", "testimonials", "faqs"]),
  title: z.string().trim().min(1).max(120),
  eyebrow: z.string().trim().max(80).optional(),
  body: z.string().trim().max(600).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(240).optional(),
  productIds: z.array(documentIdSchema).default([]),
  collectionId: documentIdSchema.optional(),
  mediaId: documentIdSchema.optional(),
  position: z.number().int().nonnegative(),
  status: publicationStatusSchema.default("draft"),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const mediaSchema = z.object({
  id: documentIdSchema.optional(),
  kind: z.enum(["image", "video"]),
  url: z.string().url(),
  cloudinaryPublicId: z.string().trim().min(1),
  alt: z.string().trim().min(1).max(140),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  status: publicationStatusSchema.default("draft"),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const testimonialSchema = z.object({
  id: documentIdSchema.optional(),
  customerName: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(600),
  rating: z.number().int().min(1).max(5).optional(),
  position: z.number().int().nonnegative().default(0),
  status: publicationStatusSchema.default("draft"),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const faqSchema = z.object({
  id: documentIdSchema.optional(),
  question: z.string().trim().min(1).max(180),
  answer: z.string().trim().min(1).max(1000),
  position: z.number().int().nonnegative().default(0),
  status: publicationStatusSchema.default("draft"),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const orderRequestItemSchema = z.object({
  productId: documentIdSchema,
  variantId: documentIdSchema.optional(),
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().min(1).max(80),
  selectedSize: z.string().trim().max(40).optional(),
  selectedColor: z.string().trim().max(60).optional(),
  unitPrice: moneyAmountSchema,
  quantity: z.number().int().min(1),
})

export const orderRequestSchema = z.object({
  id: documentIdSchema.optional(),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(6).max(24),
    city: z.string().trim().max(100).optional(),
    note: z.string().trim().max(700).optional(),
  }),
  items: z.array(orderRequestItemSchema).min(1),
  currency: currencySchema.default("XOF"),
  subtotal: moneyAmountSchema,
  status: z
    .enum([
      "draft",
      "whatsappInitiated",
      "toConfirm",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .default("whatsappInitiated"),
  whatsappMessage: z.string().trim().min(1),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
})

export const inventoryMovementSchema = z.object({
  id: documentIdSchema.optional(),
  productId: documentIdSchema,
  variantId: documentIdSchema,
  type: z.enum(["stockIn", "stockOut", "adjustment", "reservation", "release"]),
  quantity: z.number().int(),
  reason: z.string().trim().min(1).max(240),
  createdByAdminId: documentIdSchema,
  createdAt: timestampLikeSchema,
})

export const adminUserSchema = z.object({
  id: documentIdSchema.optional(),
  uid: z.string().trim().min(1),
  email: z.string().email(),
  displayName: z.string().trim().min(1).max(120),
  role: adminRoleSchema,
  status: z.enum(["active", "disabled"]).default("active"),
  createdAt: timestampLikeSchema,
  updatedAt: timestampLikeSchema,
  lastLoginAt: timestampLikeSchema.optional(),
})

export const auditLogSchema = z.object({
  id: documentIdSchema.optional(),
  actorAdminId: documentIdSchema,
  action: z.string().trim().min(1).max(120),
  collection: z.string().trim().min(1).max(80),
  documentId: documentIdSchema.optional(),
  before: z.record(z.unknown()).optional(),
  after: z.record(z.unknown()).optional(),
  createdAt: timestampLikeSchema,
})

export const analyticsEventSchema = z.object({
  id: documentIdSchema.optional(),
  name: z.string().trim().min(1).max(120),
  source: z.enum(["storefront", "admin", "server"]),
  sessionId: z.string().trim().max(160).optional(),
  productId: documentIdSchema.optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: timestampLikeSchema,
})

export type Currency = z.infer<typeof currencySchema>
export type PublicationStatus = z.infer<typeof publicationStatusSchema>
export type TimestampLike = z.infer<typeof timestampLikeSchema>
export type SeoMetadata = z.infer<typeof seoMetadataSchema>
export type Product = z.infer<typeof productSchema>
export type ProductImage = z.infer<typeof productImageSchema>
export type ProductSize = z.infer<typeof productSizeSchema>
export type ProductColor = z.infer<typeof productColorSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type Category = z.infer<typeof categorySchema>
export type MerchCollection = z.infer<typeof collectionSchema>
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type HomepageSection = z.infer<typeof homepageSectionSchema>
export type MediaAsset = z.infer<typeof mediaSchema>
export type Testimonial = z.infer<typeof testimonialSchema>
export type Faq = z.infer<typeof faqSchema>
export type OrderRequest = z.infer<typeof orderRequestSchema>
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type AuditLog = z.infer<typeof auditLogSchema>
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>
