import { brandConfig } from "@bibajilbab/config"

import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "À propos",
  description: "Présentation de BibaJilbab, boutique de vêtements pudiques au Sénégal.",
  path: "/a-propos",
})

export default function AboutPage() {
  return (
    <InfoPage eyebrow="À propos" title={brandConfig.name} description={brandConfig.slogan}>
      <InfoBlock title="Notre intention">
        <p>
          BibaJilbab propose un catalogue de djilbabs, khimars, tuniques et tenues de prière avec
          une approche sobre, féminine et respectueuse de la pudeur.
        </p>
      </InfoBlock>
      <InfoBlock title="Commande accompagnée">
        <p>
          Le site ne remplace pas l'échange humain : chaque panier est envoyé sur WhatsApp afin de
          confirmer les tailles, couleurs, disponibilités, frais de livraison et montant final.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
