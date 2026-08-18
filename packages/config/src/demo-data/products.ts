import { formatXof } from "../brand"

export interface DemoProduct {
  id: string
  slug: string
  name: string
  category: string
  collection: string
  price: number
  oldPrice?: number
  badge: string
  colors: string[]
  sizes: string[]
  image: {
    src: string
    alt: string
    width: number
    height: number
  }
  isDemo: true
}

export const demoProducts = [
  {
    id: "demo-djilbab-premium",
    slug: "demo-djilbab-premium",
    name: "Djilbab premium",
    category: "Djilbabs",
    collection: "Essentiels",
    price: 25000,
    oldPrice: 30000,
    badge: "Demo",
    colors: ["Rose poudre", "Violet doux"],
    sizes: ["S", "M", "L"],
    image: {
      src: "/demo/djilbab.svg",
      alt: "Illustration de demonstration d'un djilbab premium",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
  {
    id: "demo-khimar-medine",
    slug: "demo-khimar-medine",
    name: "Khimar soie de medine",
    category: "Khimars",
    collection: "Nouveautes",
    price: 15000,
    oldPrice: 18000,
    badge: "Demo",
    colors: ["Poudre", "Prune"],
    sizes: ["Standard"],
    image: {
      src: "/demo/khimar.svg",
      alt: "Illustration de demonstration d'un khimar",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
  {
    id: "demo-tunique-elegante",
    slug: "demo-tunique-elegante",
    name: "Tunique elegante",
    category: "Tuniques",
    collection: "Essentiels",
    price: 18000,
    badge: "Demo",
    colors: ["Blanc", "Rose clair"],
    sizes: ["M", "L"],
    image: {
      src: "/demo/tunique.svg",
      alt: "Illustration de demonstration d'une tunique",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
  {
    id: "demo-tenue-priere",
    slug: "demo-tenue-priere",
    name: "Tenue de priere",
    category: "Vetements de priere",
    collection: "Priere",
    price: 22000,
    badge: "Demo",
    colors: ["Rose clair", "Violet profond"],
    sizes: ["Standard"],
    image: {
      src: "/demo/priere.svg",
      alt: "Illustration de demonstration d'une tenue de priere",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
  {
    id: "demo-collection-tabaski",
    slug: "demo-collection-tabaski",
    name: "Ensemble Tabaski",
    category: "Collections",
    collection: "Tabaski",
    price: 35000,
    badge: "Tabaski demo",
    colors: ["Rose poudre", "Blanc"],
    sizes: ["S", "M", "L"],
    image: {
      src: "/demo/tabaski.svg",
      alt: "Illustration de demonstration de la collection Tabaski",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
  {
    id: "demo-collection-korite",
    slug: "demo-collection-korite",
    name: "Ensemble Korite",
    category: "Collections",
    collection: "Korite",
    price: 33000,
    badge: "Korite demo",
    colors: ["Violet doux", "Blanc"],
    sizes: ["M", "L"],
    image: {
      src: "/demo/korite.svg",
      alt: "Illustration de demonstration de la collection Korite",
      width: 960,
      height: 1200,
    },
    isDemo: true,
  },
] satisfies DemoProduct[]

export function formatDemoPrice(amount: number): string {
  return formatXof(amount)
}
