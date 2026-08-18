import { brandConfig } from "@bibajilbab/config"

import { faqs, getProductStock, type StoreProduct } from "@/lib/catalog"
import { formatFcfa } from "@/lib/money"

function safeJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  )
}

export function OrganizationStructuredData({ siteUrl }: { siteUrl: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: brandConfig.name,
        url: siteUrl,
        slogan: brandConfig.slogan,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: brandConfig.whatsapp.display,
          availableLanguage: ["fr"],
        },
      }}
    />
  )
}

export function WebsiteStructuredData({ siteUrl }: { siteUrl: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: brandConfig.name,
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl.replace(/\/$/u, "")}/recherche?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}

export function ProductStructuredData({
  product,
  siteUrl,
}: {
  product: StoreProduct
  siteUrl: string
}) {
  const image = product.images[0]
  const stock = getProductStock(product)

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        sku: product.sku,
        image: image ? [new URL(image.src, siteUrl).toString()] : undefined,
        description: product.shortDescription,
        brand: {
          "@type": "Brand",
          name: brandConfig.name,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "XOF",
          price: product.price,
          availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          inventoryLevel: {
            "@type": "QuantitativeValue",
            value: stock,
          },
          url: new URL(`/produits/${product.slug}`, siteUrl).toString(),
          seller: {
            "@type": "Organization",
            name: brandConfig.name,
          },
        },
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Prix affiché",
            value: formatFcfa(product.price),
          },
          {
            "@type": "PropertyValue",
            name: "Commande",
            value: "Demande de commande sur WhatsApp, sans paiement en ligne.",
          },
        ],
      }}
    />
  )
}

export function FaqStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  )
}

export function BreadcrumbStructuredData({
  items,
  siteUrl,
}: {
  items: Array<{ href: string; label: string }>
  siteUrl: string
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: new URL(item.href, siteUrl).toString(),
        })),
      }}
    />
  )
}
