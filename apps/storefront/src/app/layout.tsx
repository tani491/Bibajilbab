import type { Metadata, Viewport } from "next"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"

import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/commerce/structured-data"
import { StoreProvider } from "@/components/commerce/store-provider"
import { StorefrontAnalytics } from "@/components/commerce/storefront-analytics"
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getStorefrontAnnouncement, getStorefrontCategories } from "@/lib/storefront-data"
import { announcement as defaultAnnouncement } from "@/lib/catalog"

import "./globals.css"

const publicEnv = parsePublicEnv(process.env)
const siteDescription =
  "Boutique BibaJilbab au Senegal: djilbabs, khimars, tuniques et vetements de priere a Dakar, avec commande finale sur WhatsApp."
const ogImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "BibaJilbab Senegal - boutique modest fashion a Dakar",
}

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.urls.site),
  title: {
    default: "BibaJilbab | Boutique Modest Fashion & Jilbabs au Senegal",
    template: `%s | ${brandConfig.name}`,
  },
  description: siteDescription,
  keywords: [
    "BibaJilbab",
    "jilbab Senegal",
    "djilbab Dakar",
    "khimar Senegal",
    "modest fashion Dakar",
    "vetements de priere Senegal",
    "Tabaski",
    "Korite",
    "boutique musulmane Dakar",
  ],
  authors: [{ name: brandConfig.name, url: publicEnv.urls.site }],
  creator: brandConfig.name,
  publisher: brandConfig.name,
  alternates: {
    canonical: publicEnv.urls.site,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    alternateLocale: ["fr_FR", "en_US"],
    url: publicEnv.urls.site,
    siteName: brandConfig.name,
    title: "BibaJilbab | Boutique Modest Fashion & Jilbabs au Senegal",
    description: siteDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "BibaJilbab | Boutique Modest Fashion & Jilbabs au Senegal",
    description: siteDescription,
    images: [ogImage.url],
  },
  other: {
    "geo.region": "SN-DK",
    "geo.placename": "Dakar",
    "geo.position": "14.7167;-17.4677",
    ICBM: "14.7167, -17.4677",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF5F8",
}

export const revalidate = 0

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [announcement, categories] = await Promise.all([
    getStorefrontAnnouncement(),
    getStorefrontCategories(),
  ])

  return (
    <html lang="fr">
      <body>
        <OrganizationStructuredData siteUrl={publicEnv.urls.site} />
        <WebsiteStructuredData siteUrl={publicEnv.urls.site} />
        <StoreProvider>
          <StorefrontAnalytics />
          <SiteHeader announcement={announcement ?? defaultAnnouncement} categories={categories} />
          {children}
          <SiteFooter />
          <FloatingWhatsApp />
        </StoreProvider>
      </body>
    </html>
  )
}
