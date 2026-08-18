import type { Metadata, Viewport } from "next"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"

import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/commerce/structured-data"
import { StoreProvider } from "@/components/commerce/store-provider"
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

import "./globals.css"

const publicEnv = parsePublicEnv(process.env)

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.urls.site),
  title: {
    default: brandConfig.name,
    template: `%s | ${brandConfig.name}`,
  },
  description: "Catalogue e-commerce BibaJilbab au Senegal, avec commandes finales sur WhatsApp.",
  alternates: {
    canonical: publicEnv.urls.site,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF5F8",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <OrganizationStructuredData siteUrl={publicEnv.urls.site} />
        <WebsiteStructuredData siteUrl={publicEnv.urls.site} />
        <StoreProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <FloatingWhatsApp />
        </StoreProvider>
      </body>
    </html>
  )
}
