import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Livraison",
  description: "Informations de livraison BibaJilbab à confirmer sur WhatsApp.",
  path: "/livraison",
})

export default function DeliveryPage() {
  return (
    <InfoPage
      eyebrow="Livraison"
      title="Livraison à confirmer"
      description="Les frais, délais et zones sont validés au moment de la discussion WhatsApp."
    >
      <InfoBlock title="Fonctionnement prévu">
        <p>
          Après l'envoi du panier, BibaJilbab vérifie la disponibilité des articles, votre zone de
          livraison et les frais applicables avant de confirmer le montant final.
        </p>
      </InfoBlock>
      <InfoBlock title="À renseigner dans la prochaine phase">
        <p>
          Les zones couvertes, tarifs indicatifs et délais moyens devront être complétés avec les
          informations opérationnelles réelles.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
