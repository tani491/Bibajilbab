import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { FavoritesClient } from "@/components/commerce/favorites-client"
import { createPageMetadata } from "@/lib/catalog"
import { getStorefrontProducts } from "@/lib/storefront-data"

export const metadata = createPageMetadata({
  title: "Favoris",
  description: "Produits BibaJilbab enregistrés localement dans vos favoris.",
  path: "/favoris",
})

export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  return (
    <main className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Favoris"
          title="Vos articles enregistrés"
          description="Les favoris sont conservés dans ce navigateur, sans compte client obligatoire."
        />
        <div className="mt-8">
          <FavoritesClient products={await getStorefrontProducts({ status: "published" })} />
        </div>
      </Container>
    </main>
  )
}
