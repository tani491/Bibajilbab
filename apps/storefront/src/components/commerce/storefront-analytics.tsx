"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { captureStorefrontAttribution, trackStorefrontEvent } from "@/lib/analytics"

function productIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/produits\/([^/]+)/u)

  return match?.[1]
}

export function StorefrontAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    captureStorefrontAttribution()

    const productId = productIdFromPath(pathname)
    const query = window.location.search

    trackStorefrontEvent(
      productId ? "product_view" : "page_view",
      {
        path: pathname,
        url: `${pathname}${query}`,
        title: document.title,
      },
      productId,
    )
  }, [pathname])

  return null
}
