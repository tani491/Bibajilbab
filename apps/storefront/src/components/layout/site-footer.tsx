import { Instagram, Music2 } from "lucide-react"
import Link from "next/link"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"
import { Container, buttonStyles } from "@bibajilbab/ui/server"

import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp"

import { WhatsAppIcon } from "./whatsapp-icon"

const footerLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/guide-des-tailles", label: "Guide des tailles" },
  { href: "/livraison", label: "Livraison" },
  { href: "/retours-et-echanges", label: "Retours et échanges" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/conditions-generales", label: "Conditions générales" },
  { href: "/mentions-legales", label: "Mentions légales" },
]

export function SiteFooter() {
  const publicEnv = parsePublicEnv(process.env)

  return (
    <footer className="border-t border-brand-border bg-white py-12">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <p className="text-xl font-semibold text-brand-ink">{brandConfig.name}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-brand-muted">{brandConfig.slogan}</p>
          <a
            className={buttonStyles({
              className: "mt-6 bg-[#25D366] text-white hover:bg-[#1FB85A]",
            })}
            href={buildGeneralWhatsAppUrl()}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Écrire sur WhatsApp
          </a>
        </div>
        <nav className="grid gap-3 text-sm text-brand-muted sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand-plum">
              {link.label}
            </Link>
          ))}
        </nav>
        <div>
          <p className="text-sm font-semibold text-brand-ink">Suivre BibaJilbab</p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={publicEnv.brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram BibaJilbab"
              className="flex h-11 w-11 items-center justify-center rounded-card border border-brand-border text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Instagram aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href={publicEnv.brand.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok BibaJilbab"
              className="flex h-11 w-11 items-center justify-center rounded-card border border-brand-border text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Music2 aria-hidden="true" className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-5 text-sm text-brand-muted">{brandConfig.whatsapp.display}</p>
          <p className="mt-2 text-xs leading-5 text-brand-muted">
            Aucun paiement en ligne. WhatsApp envoie une demande de commande à confirmer.
          </p>
        </div>
      </Container>
    </footer>
  )
}
