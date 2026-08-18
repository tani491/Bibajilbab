import { parsePublicEnv } from "@bibajilbab/config"
import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { CartClient } from "@/components/commerce/cart-client"
import { createPageMetadata } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Panier",
  description: "Panier BibaJilbab avec finalisation de demande de commande sur WhatsApp.",
  path: "/panier",
})

export default function CartPage() {
  const publicEnv = parsePublicEnv(process.env)

  return (
    <main className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Panier"
          title="Préparer la demande WhatsApp"
          description="Aucun paiement en ligne : le panier compose un message complet à envoyer à BibaJilbab."
        />
        <div className="mt-8">
          <CartClient siteUrl={publicEnv.urls.site} />
        </div>
      </Container>
    </main>
  )
}
