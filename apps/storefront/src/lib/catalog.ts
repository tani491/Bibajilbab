import type { Metadata } from "next"

import { brandConfig } from "@bibajilbab/config"

export type ProductStatus = "draft" | "published" | "archived"
export type SortOption = "newest" | "popular" | "price-asc" | "price-desc"
export type AvailabilityFilter = "all" | "available"

export interface StoreCategory {
  slug: string
  name: string
  description: string
  imageSrc: string
  imageAlt: string
}

export interface StoreCollection {
  slug: string
  name: string
  description: string
  type: "permanent" | "seasonal" | "tabaski" | "korite"
  imageSrc: string
  imageAlt: string
}

export interface StoreProductImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface StoreProductSize {
  id: string
  label: string
  description?: string
}

export interface StoreProductColor {
  id: string
  name: string
  hex: string
}

export interface StoreProductVariant {
  id: string
  sku: string
  sizeId?: string
  colorId?: string
  stock: number
}

export interface StoreProduct {
  id: string
  slug: string
  name: string
  sku: string
  categorySlug: string
  collectionSlugs: string[]
  tags: string[]
  shortDescription: string
  longDescription: string
  price: number
  currency: "XOF"
  badge?: string
  featured: boolean
  previewRank: number
  status: ProductStatus
  material: string
  careInstructions: string
  images: StoreProductImage[]
  sizes: StoreProductSize[]
  colors: StoreProductColor[]
  variants: StoreProductVariant[]
  createdAt: string
  updatedAt: string
  seo: {
    title: string
    description: string
  }
}

const updatedAt = "2026-08-16T00:00:00.000Z"

export const announcement = {
  text: "Catalogue d'aperçu BibaJilbab. Les disponibilités finales sont confirmées sur WhatsApp.",
  href: "/catalogue",
}

export const categories: StoreCategory[] = [
  {
    slug: "djilbabs",
    name: "Djilbabs",
    description: "Silhouettes couvrantes, élégantes et pensées pour le quotidien.",
    imageSrc: "",
    imageAlt: "Illustration d'un djilbab rose poudré",
  },
  {
    slug: "khimars",
    name: "Khimars",
    description: "Voiles amples et fluides pour une pudeur confortable.",
    imageSrc: "",
    imageAlt: "Illustration d'un khimar prune",
  },
  {
    slug: "tuniques",
    name: "Tuniques",
    description: "Pièces longues et faciles à associer avec vos essentiels.",
    imageSrc: "",
    imageAlt: "Illustration d'une tunique claire",
  },
  {
    slug: "priere",
    name: "Prière",
    description: "Tenues sobres et pratiques pour les moments de recueillement.",
    imageSrc: "",
    imageAlt: "Illustration d'une tenue de prière",
  },
]

export const collections: StoreCollection[] = [
  {
    slug: "nouveautes",
    name: "Nouveautés",
    description: "Les derniers modèles à renseigner par BibaJilbab.",
    type: "permanent",
    imageSrc: "",
    imageAlt: "Illustration de nouveautés modest fashion",
  },
  {
    slug: "essentiels",
    name: "Essentiels",
    description: "Les coupes faciles à porter toute l'année.",
    type: "permanent",
    imageSrc: "",
    imageAlt: "Illustration de pièces essentielles",
  },
  {
    slug: "tabaski",
    name: "Tabaski",
    description: "Une sélection habillée pour les célébrations de Tabaski.",
    type: "tabaski",
    imageSrc: "",
    imageAlt: "Illustration d'une collection Tabaski",
  },
  {
    slug: "korite",
    name: "Korité",
    description: "Des ensembles élégants pour célébrer Korité avec pudeur.",
    type: "korite",
    imageSrc: "",
    imageAlt: "Illustration d'une collection Korité",
  },
]

const sizes = {
  standard: [{ id: "standard", label: "Standard", description: "Coupe unique ample" }],
  multi: [
    { id: "s", label: "S", description: "Petite taille" },
    { id: "m", label: "M", description: "Taille moyenne" },
    { id: "l", label: "L", description: "Grande taille" },
  ],
} satisfies Record<string, StoreProductSize[]>

const mediumLargeSizes = sizes.multi.slice(1)

const colors = {
  powder: { id: "rose-poudre", name: "Rose poudré", hex: "#E9B7C5" },
  blush: { id: "rose-clair", name: "Rose clair", hex: "#FFF5F8" },
  plum: { id: "violet-profond", name: "Violet profond", hex: "#5B2A6E" },
  mauve: { id: "violet-doux", name: "Violet doux", hex: "#8C5A9E" },
  white: { id: "blanc", name: "Blanc", hex: "#FFFFFF" },
} satisfies Record<string, StoreProductColor>

function variants(
  productSku: string,
  productSizes: StoreProductSize[],
  productColors: StoreProductColor[],
): StoreProductVariant[] {
  return productSizes.flatMap((size, sizeIndex) =>
    productColors.map((color, colorIndex) => ({
      id: `${size.id}-${color.id}`,
      sku: `${productSku}-${size.label}-${color.name}`
        .toUpperCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
      sizeId: size.id,
      colorId: color.id,
      stock: sizeIndex === 0 && colorIndex === 0 ? 4 : 2,
    })),
  )
}

export const products: StoreProduct[] = [
  {
    id: "djilbab-premium-poudre",
    slug: "djilbab-premium-poudre",
    name: "Djilbab premium poudre",
    sku: "BJ-DJ-PDR",
    categorySlug: "djilbabs",
    collectionSlugs: ["nouveautes", "essentiels"],
    tags: ["djilbab", "quotidien", "ample"],
    shortDescription: "Djilbab fluide avec une coupe couvrante et une finition soignée.",
    longDescription:
      "Une pièce pensée pour accompagner les journées actives avec une silhouette ample, une matière douce et un tombé élégant.",
    price: 25000,
    currency: "XOF",
    badge: "Aperçu",
    featured: true,
    previewRank: 1,
    status: "published",
    material: "Tissu fluide à confirmer selon arrivage.",
    careInstructions: "Lavage doux recommandé. Repassage léger sur l'envers.",
    images: [
      {
        src: "/demo/djilbab.svg",
        alt: "Aperçu illustré du djilbab premium poudre",
        width: 960,
        height: 1200,
      },
    ],
    sizes: sizes.multi,
    colors: [colors.powder, colors.mauve],
    variants: variants("BJ-DJ-PDR", sizes.multi, [colors.powder, colors.mauve]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Djilbab premium poudre",
      description: "Aperçu d'un djilbab premium BibaJilbab avec commande finale sur WhatsApp.",
    },
  },
  {
    id: "khimar-medine-prune",
    slug: "khimar-medine-prune",
    name: "Khimar Médine prune",
    sku: "BJ-KH-PRN",
    categorySlug: "khimars",
    collectionSlugs: ["nouveautes"],
    tags: ["khimar", "voile", "fluide"],
    shortDescription: "Khimar ample à l'allure douce, pour un porté confortable.",
    longDescription:
      "Un khimar léger qui couvre naturellement les épaules, avec une belle fluidité et des teintes faciles à assortir.",
    price: 15000,
    currency: "XOF",
    badge: "Aperçu",
    featured: true,
    previewRank: 2,
    status: "published",
    material: "Voile fluide à confirmer selon arrivage.",
    careInstructions: "Lavage à froid conseillé. Séchage à l'air libre.",
    images: [
      {
        src: "/demo/khimar.svg",
        alt: "Aperçu illustré du khimar Médine prune",
        width: 960,
        height: 1200,
      },
    ],
    sizes: sizes.standard,
    colors: [colors.plum, colors.powder],
    variants: variants("BJ-KH-PRN", sizes.standard, [colors.plum, colors.powder]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Khimar Médine prune",
      description: "Aperçu d'un khimar BibaJilbab avec demande de commande sur WhatsApp.",
    },
  },
  {
    id: "tunique-elegante-blanche",
    slug: "tunique-elegante-blanche",
    name: "Tunique élégante blanche",
    sku: "BJ-TU-BLC",
    categorySlug: "tuniques",
    collectionSlugs: ["essentiels"],
    tags: ["tunique", "blanc", "quotidien"],
    shortDescription: "Tunique longue à superposer, sobre et polyvalente.",
    longDescription:
      "Une tunique épurée, pensée pour composer des tenues modestes avec une coupe longue et une finition discrète.",
    price: 18000,
    currency: "XOF",
    featured: false,
    previewRank: 4,
    status: "published",
    material: "Tissu opaque à confirmer selon arrivage.",
    careInstructions: "Lavage doux avec couleurs similaires.",
    images: [
      {
        src: "/demo/tunique.svg",
        alt: "Aperçu illustré d'une tunique blanche",
        width: 960,
        height: 1200,
      },
    ],
    sizes: mediumLargeSizes,
    colors: [colors.white, colors.blush],
    variants: variants("BJ-TU-BLC", mediumLargeSizes, [colors.white, colors.blush]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Tunique élégante blanche",
      description: "Aperçu d'une tunique longue BibaJilbab, commande finale via WhatsApp.",
    },
  },
  {
    id: "tenue-priere-rose",
    slug: "tenue-priere-rose",
    name: "Tenue de prière rose",
    sku: "BJ-PR-RSE",
    categorySlug: "priere",
    collectionSlugs: ["essentiels"],
    tags: ["prière", "tenue", "confort"],
    shortDescription: "Tenue pratique, couvrante et simple à enfiler.",
    longDescription:
      "Un ensemble sobre pour les temps de prière, avec une coupe ample et une sensation de confort au quotidien.",
    price: 22000,
    currency: "XOF",
    featured: true,
    previewRank: 3,
    status: "published",
    material: "Tissu doux à confirmer selon arrivage.",
    careInstructions: "Lavage doux recommandé, séchage naturel.",
    images: [
      {
        src: "/demo/priere.svg",
        alt: "Aperçu illustré d'une tenue de prière rose",
        width: 960,
        height: 1200,
      },
    ],
    sizes: sizes.standard,
    colors: [colors.blush, colors.plum],
    variants: variants("BJ-PR-RSE", sizes.standard, [colors.blush, colors.plum]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Tenue de prière rose",
      description: "Aperçu d'une tenue de prière BibaJilbab avec demande sur WhatsApp.",
    },
  },
  {
    id: "ensemble-tabaski-poudre",
    slug: "ensemble-tabaski-poudre",
    name: "Ensemble Tabaski poudre",
    sku: "BJ-TAB-PDR",
    categorySlug: "djilbabs",
    collectionSlugs: ["tabaski"],
    tags: ["tabaski", "célébration", "ensemble"],
    shortDescription: "Ensemble habillé pour les moments de célébration.",
    longDescription:
      "Une proposition élégante pour Tabaski, avec une silhouette respectueuse de la pudeur et une présence plus cérémonielle.",
    price: 35000,
    currency: "XOF",
    badge: "Collection",
    featured: false,
    previewRank: 5,
    status: "published",
    material: "Matière habillée à confirmer selon arrivage.",
    careInstructions: "Entretien délicat conseillé.",
    images: [
      {
        src: "/demo/tabaski.svg",
        alt: "Aperçu illustré d'un ensemble Tabaski",
        width: 960,
        height: 1200,
      },
    ],
    sizes: sizes.multi,
    colors: [colors.powder, colors.white],
    variants: variants("BJ-TAB-PDR", sizes.multi, [colors.powder, colors.white]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Ensemble Tabaski poudre",
      description: "Aperçu de la collection Tabaski BibaJilbab, sans paiement en ligne.",
    },
  },
  {
    id: "ensemble-korite-mauve",
    slug: "ensemble-korite-mauve",
    name: "Ensemble Korité mauve",
    sku: "BJ-KOR-MVE",
    categorySlug: "khimars",
    collectionSlugs: ["korite"],
    tags: ["korité", "célébration", "mauve"],
    shortDescription: "Ensemble doux et élégant pour les célébrations de Korité.",
    longDescription:
      "Une silhouette raffinée dans les tons mauves, pensée pour une célébration sobre, féminine et pudique.",
    price: 33000,
    currency: "XOF",
    badge: "Collection",
    featured: false,
    previewRank: 6,
    status: "published",
    material: "Matière fluide à confirmer selon arrivage.",
    careInstructions: "Lavage délicat. Éviter le séchage direct au soleil.",
    images: [
      {
        src: "/demo/korite.svg",
        alt: "Aperçu illustré d'un ensemble Korité mauve",
        width: 960,
        height: 1200,
      },
    ],
    sizes: mediumLargeSizes,
    colors: [colors.mauve, colors.white],
    variants: variants("BJ-KOR-MVE", mediumLargeSizes, [colors.mauve, colors.white]),
    createdAt: updatedAt,
    updatedAt,
    seo: {
      title: "Ensemble Korité mauve",
      description: "Aperçu de la collection Korité BibaJilbab avec commande via WhatsApp.",
    },
  },
]

export const testimonials = [
  {
    id: "testimonial-preview-1",
    customerName: "Cliente BibaJilbab",
    content: "Témoignage à remplacer par un avis réel validé par BibaJilbab.",
  },
  {
    id: "testimonial-preview-2",
    customerName: "Cliente BibaJilbab",
    content:
      "Espace prévu pour afficher des retours clients authentiques, sans avis inventé en production.",
  },
]

export const faqs = [
  {
    question: "Comment passer commande ?",
    answer:
      "Ajoutez les articles au panier, renseignez votre nom, téléphone et zone de livraison, puis envoyez la demande sur WhatsApp.",
  },
  {
    question: "Le paiement se fait-il sur le site ?",
    answer:
      "Non. Le site prépare une demande de commande sur WhatsApp. La disponibilité, la livraison et le montant final sont confirmés ensuite.",
  },
  {
    question: "Les disponibilités sont-elles garanties ?",
    answer:
      "Le stock affiché sert d'indication catalogue. BibaJilbab confirme toujours la disponibilité finale sur WhatsApp.",
  },
]

export const sizeGuideRows = [
  { size: "S", fit: "Petite taille", note: "À ajuster avec les mesures réelles des modèles." },
  { size: "M", fit: "Taille moyenne", note: "À ajuster avec les mesures réelles des modèles." },
  { size: "L", fit: "Grande taille", note: "À ajuster avec les mesures réelles des modèles." },
  { size: "Standard", fit: "Coupe unique ample", note: "Souvent utilisée pour khimars et tenues." },
]

export const legalModelNotice =
  "Ce contenu est un modèle de départ à faire relire et valider par un professionnel compétent. Il ne constitue pas un conseil juridique définitif."

export function getPublishedProducts(): StoreProduct[] {
  return products.filter((product) => product.status === "published")
}

export function getProductBySlug(slug: string): StoreProduct | undefined {
  return getPublishedProducts().find((product) => product.slug === slug)
}

export function getCategoryBySlug(slug: string): StoreCategory | undefined {
  return categories.find((category) => category.slug === slug)
}

export function getCollectionBySlug(slug: string): StoreCollection | undefined {
  return collections.find((collection) => collection.slug === slug)
}

export function getProductsByCategory(categorySlug: string): StoreProduct[] {
  return getPublishedProducts().filter((product) => product.categorySlug === categorySlug)
}

export function getProductsByCollection(collectionSlug: string): StoreProduct[] {
  return getPublishedProducts().filter((product) =>
    product.collectionSlugs.includes(collectionSlug),
  )
}

export function getRelatedProducts(product: StoreProduct, limit = 4): StoreProduct[] {
  return getPublishedProducts()
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.categorySlug === product.categorySlug ||
          candidate.collectionSlugs.some((slug) => product.collectionSlugs.includes(slug))),
    )
    .slice(0, limit)
}

export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name ?? slug
}

export function getCollectionName(slug: string): string {
  return getCollectionBySlug(slug)?.name ?? slug
}

export function getProductStock(product: StoreProduct): number {
  return product.variants.reduce((total, variant) => total + variant.stock, 0)
}

export function productHasAvailableStock(product: StoreProduct): boolean {
  return getProductStock(product) > 0
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${brandConfig.name}`,
      description,
      url: path,
      siteName: brandConfig.name,
      locale: "fr_SN",
      type: "website",
    },
  }
}
