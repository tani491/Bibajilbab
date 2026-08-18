import { brandConfig } from "@bibajilbab/config"

import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, legalModelNotice } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Mentions légales",
  description: "Modèle de mentions légales BibaJilbab à faire valider.",
  path: "/mentions-legales",
})

export default function LegalNoticePage() {
  return (
    <InfoPage eyebrow="Modèle" title="Mentions légales" description={legalModelNotice}>
      <InfoBlock title="Éditeur">
        <p>
          {brandConfig.name} - informations légales complètes à renseigner avant mise en production.
        </p>
      </InfoBlock>
      <InfoBlock title="Contact">
        <p>
          WhatsApp : {brandConfig.whatsapp.display}. Les autres informations devront être validées.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
