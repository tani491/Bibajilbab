import { Heart, Instagram, Music2, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"
import {
  Badge,
  Card,
  CardContent,
  Container,
  SectionHeading,
  buttonStyles,
} from "@bibajilbab/ui/server"

import { ProductGrid } from "@/components/commerce/product-grid"
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon"
import { categories, collections, testimonials } from "@/lib/catalog"
import { getStorefrontHero, getStorefrontProducts } from "@/lib/storefront-data"
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp"

const trustItems = [
  {
    title: "Commande accompagnée",
    description: "Chaque demande est confirmée sur WhatsApp avant toute validation finale.",
    icon: WhatsAppIcon,
  },
  {
    title: "Catalogue sans paiement en ligne",
    description: "Le site prépare les articles, le paiement n'est pas intégré à cette phase.",
    icon: ShieldCheck,
  },
  {
    title: "Livraison à confirmer",
    description: "Les frais et zones de livraison sont validés directement avec BibaJilbab.",
    icon: Truck,
  },
]

function isVideoMediaUrl(url: string | undefined): boolean {
  if (!url) {
    return false
  }

  return /\.(mp4|webm|mov)(?:$|[?#])/i.test(url) || /\/video\/upload(?:\/|$)/i.test(url)
}

export const dynamic = "force-dynamic"

export default async function StorefrontHomePage() {
  const publicEnv = parsePublicEnv(process.env)
  const products = await getStorefrontProducts({ status: "published" })
  const hero = await getStorefrontHero()
  const fallbackImage = products[0]?.images[0]
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4)
  const previewPopularProducts = [...products]
    .sort((a, b) => a.previewRank - b.previewRank)
    .slice(0, 4)
  const tabaskiOrKorite = collections.filter((collection) =>
    ["tabaski", "korite"].includes(collection.slug),
  )
  const heroVideoUrl =
    hero?.videoUrl || (isVideoMediaUrl(hero?.imageUrl) ? hero?.imageUrl : undefined)

  return (
    <main>
      <section className="relative isolate min-h-[680px] overflow-hidden bg-brand-blush">
        <div className="absolute inset-0 overflow-hidden">
          {heroVideoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover object-[62%_center]"
              src={heroVideoUrl}
            />
          ) : hero?.imageUrl || fallbackImage ? (
            <Image
              src={hero?.imageUrl || fallbackImage?.src || ""}
              alt={hero?.imageAlt || fallbackImage?.alt || "Collection BibaJilbab"}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[62%_center]"
            />
          ) : (
            <div className="h-full w-full bg-brand-blush" aria-hidden="true" />
          )}
        </div>
        <div className="absolute inset-0 bg-white/88 lg:w-[52%] lg:bg-white/85" />
        <Container className="relative z-10 flex min-h-[680px] items-center justify-center py-16 lg:justify-start lg:py-16">
          <div className="max-w-xl text-center lg:text-left">
            <Badge variant="outline" className="bg-white/90">
              BibaJilbab Sénégal
            </Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-brand-ink sm:text-5xl lg:text-6xl">
              L'élégance dans la pudeur
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-brand-muted sm:text-lg sm:leading-8 lg:mx-0">
              Découvrez nos djilbabs, khimars, tuniques et tenues de prière conçus pour accompagner votre quotidien et vos célébrations.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-8">
              <Link className={buttonStyles({ size: "lg" })} href="/catalogue">
                <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                Découvrir la collection
              </Link>
              <a
                className={buttonStyles({
                  size: "lg",
                  className: "bg-[#25D366] text-white hover:bg-[#1FB85A]",
                })}
                href={buildGeneralWhatsAppUrl()}
              >
                <WhatsAppIcon className="h-5 w-5" />
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Catégories"
            title="Choisir selon votre besoin"
            description="Une navigation simple pour rejoindre rapidement les familles principales du catalogue."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-card border border-brand-border bg-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:shadow-focus"
              >
                <div className="relative aspect-[4/5] bg-brand-blush">
                  {category.imageSrc ? (
                    <Image
                      src={category.imageSrc}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-brand-ink">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-brand-border bg-brand-blush py-16">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Nouveautés"
              title="Sélection à découvrir"
              description="Produits d'aperçu en attendant la connexion Firestore et les photos réelles."
            />
            <Link
              className={buttonStyles({ variant: "outline", className: "bg-white" })}
              href="/collections/nouveautes"
            >
              Voir les nouveautés
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={featuredProducts} />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Mise en avant"
            title="Produits populaires à piloter"
            description="La section est prête pour des produits populaires à piloter avec de vraies données. Les éléments affichés ici sont des aperçus locaux."
          />
          <div className="mt-8">
            <ProductGrid products={previewPopularProducts} />
          </div>
        </Container>
      </section>

      <section className="bg-brand-blush py-16">
        <Container className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge variant="plum">Collection du moment</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-brand-ink">Essentiels du quotidien</h2>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              Une base simple pour valoriser une collection : image, texte, sélection produit et
              bouton WhatsApp pourront ensuite être gérés avec de vraies données.
            </p>
            <Link className={buttonStyles({ className: "mt-6" })} href="/collections/essentiels">
              Explorer les essentiels
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {tabaskiOrKorite.map((collection) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group overflow-hidden rounded-card border border-brand-border bg-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:shadow-focus"
              >
                <div className="relative aspect-[4/5] bg-brand-blush">
                  {collection.imageSrc ? (
                    <Image
                      src={collection.imageSrc}
                      alt={collection.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-brand-ink">{collection.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title}>
                  <CardContent>
                    <div className="flex h-11 w-11 items-center justify-center rounded-card bg-brand-blush text-brand-plum">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-brand-ink">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-brand-border bg-brand-blush py-16">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="À propos"
              title={brandConfig.name}
              description={brandConfig.slogan}
            />
            <Link
              className={buttonStyles({ variant: "outline", className: "mt-6 bg-white" })}
              href="/a-propos"
            >
              Lire la présentation
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent>
                  <Heart aria-hidden="true" className="h-5 w-5 text-brand-plum" />
                  <p className="mt-4 text-sm leading-6 text-brand-muted">{testimonial.content}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-ink">
                    {testimonial.customerName}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Une question ou une demande précise ?"
              description="Envoyez un message à BibaJilbab sur WhatsApp, ou suivez les nouveautés sur Instagram et TikTok."
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className={buttonStyles({
                size: "lg",
                className: "bg-[#25D366] text-white hover:bg-[#1FB85A]",
              })}
              href={buildGeneralWhatsAppUrl()}
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </a>
            <a
              className={buttonStyles({ variant: "outline", size: "lg" })}
              href={publicEnv.brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram aria-hidden="true" className="h-5 w-5" />
              Instagram
            </a>
            <a
              className={buttonStyles({ variant: "outline", size: "lg" })}
              href={publicEnv.brand.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Music2 aria-hidden="true" className="h-5 w-5" />
              TikTok
            </a>
          </div>
        </Container>
      </section>
    </main>
  )
}
