import { Instagram, Music2 } from "lucide-react"

import { parsePublicEnv } from "@bibajilbab/config"
import { buttonStyles } from "@bibajilbab/ui/server"

import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon"
import { createPageMetadata } from "@/lib/catalog"
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp"

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Contacter BibaJilbab sur WhatsApp, Instagram ou TikTok.",
  path: "/contact",
})

export default function ContactPage() {
  const publicEnv = parsePublicEnv(process.env)

  return (
    <InfoPage
      eyebrow="Contact"
      title="Parler avec BibaJilbab"
      description="Pour une commande, une disponibilité ou une question, WhatsApp reste le canal principal."
    >
      <InfoBlock title="Canaux officiels">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            className={buttonStyles({
              className: "bg-[#25D366] text-white hover:bg-[#1FB85A]",
            })}
            href={buildGeneralWhatsAppUrl()}
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a
            className={buttonStyles({ variant: "outline" })}
            href={publicEnv.brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram aria-hidden="true" className="h-5 w-5" />
            Instagram
          </a>
          <a
            className={buttonStyles({ variant: "outline" })}
            href={publicEnv.brand.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Music2 aria-hidden="true" className="h-5 w-5" />
            TikTok
          </a>
        </div>
      </InfoBlock>
      <InfoBlock title="Informations à préciser">
        <p>
          Pour accélérer la réponse, indiquez le produit, la référence, la taille, la couleur et
          votre zone de livraison.
        </p>
      </InfoBlock>
    </InfoPage>
  )
}
