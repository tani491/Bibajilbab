import type { Metadata, Viewport } from "next"

import "./globals.css"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"

const publicEnv = parsePublicEnv(process.env)

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.urls.admin),
  title: {
    default: `Administration | ${brandConfig.name}`,
    template: `%s | Administration ${brandConfig.name}`,
  },
  description: "Administration privee BibaJilbab, preparee pour Firebase Authentication.",
  robots: {
    index: false,
    follow: false,
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
      <body>{children}</body>
    </html>
  )
}
