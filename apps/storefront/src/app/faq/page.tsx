import { FaqStructuredData } from "@/components/commerce/structured-data"
import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, faqs } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "FAQ",
  description: "Questions fréquentes sur les commandes BibaJilbab.",
  path: "/faq",
})

export default function FaqPage() {
  return (
    <>
      <FaqStructuredData />
      <InfoPage
        eyebrow="FAQ"
        title="Questions fréquentes"
        description="Réponses pratiques avant d'envoyer une demande de commande sur WhatsApp."
      >
        {faqs.map((faq) => (
          <InfoBlock key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </InfoBlock>
        ))}
      </InfoPage>
    </>
  )
}
