import type { MetadataRoute } from "next"

import { parsePublicEnv } from "@bibajilbab/config"

export default function robots(): MetadataRoute.Robots {
  const publicEnv = parsePublicEnv(process.env)

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", publicEnv.urls.site).toString(),
    host: publicEnv.urls.site,
  }
}
