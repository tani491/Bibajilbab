import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, legalModelNotice } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Retours et échanges",
  description: "Modèle de politique de retours et échanges BibaJilbab à faire valider.",
  path: "/retours-et-echanges",
})

export default function ReturnsPage() {
  return (
    <InfoPage eyebrow="Modèle" title="Retours et échanges" description={legalModelNotice}>
      <InfoBlock title="Principe de départ">
        <p>
          Les conditions de retour ou d'échange doivent être confirmées avec BibaJilbab avant toute
          commande finale, notamment selon l'état du produit, le délai et la disponibilité d'une
          autre taille ou couleur.
        </p>
      </InfoBlock>
      <InfoBlock title="À valider">
        <p>
          Ce modèle doit être adapté aux pratiques réelles de la boutique et validé avant
          publication définitive.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
