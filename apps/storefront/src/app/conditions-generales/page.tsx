import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, legalModelNotice } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Conditions générales",
  description: "Modèle de conditions générales BibaJilbab à faire valider.",
  path: "/conditions-generales",
})

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Modèle" title="Conditions générales" description={legalModelNotice}>
      <InfoBlock title="Catalogue et demandes">
        <p>
          Le site présente un catalogue et prépare des demandes de commande sur WhatsApp. Un clic
          WhatsApp ne constitue pas une vente confirmée.
        </p>
      </InfoBlock>
      <InfoBlock title="Confirmation finale">
        <p>
          La disponibilité, les frais de livraison, les modalités et le montant final sont confirmés
          directement avec BibaJilbab.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
