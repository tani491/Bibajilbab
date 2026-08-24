import "server-only"

import { getStorefrontProducts } from "@/lib/storefront-data"

export async function getAllProducts() {
  return getStorefrontProducts({ status: "published" })
}
