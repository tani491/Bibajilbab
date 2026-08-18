import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, legalModelNotice } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Confidentialité",
  description: "Modèle de politique de confidentialité BibaJilbab à faire valider.",
  path: "/confidentialite",
})

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Modèle" title="Confidentialité" description={legalModelNotice}>
      <InfoBlock title="Données minimales">
        <p>
          Le parcours panier demande uniquement le nom, le téléphone, la ville ou zone de livraison
          et une note facultative avant l'ouverture de WhatsApp.
        </p>
      </InfoBlock>
      <InfoBlock title="Stockage local">
        <p>
          Les favoris, le panier et les produits récemment consultés sont enregistrés dans le
          navigateur via localStorage, sans compte client obligatoire.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
