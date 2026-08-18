import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp"

import { WhatsAppIcon } from "./whatsapp-icon"

export function FloatingWhatsApp() {
  return (
    <a
      href={buildGeneralWhatsAppUrl()}
      aria-label="Contacter BibaJilbab sur WhatsApp"
      className="group fixed bottom-6 right-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full border border-[#25D366]/25 bg-white text-[#25D366] shadow-soft transition hover:bg-[#F0FFF6] focus-visible:outline-none focus-visible:shadow-focus sm:flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden min-w-max rounded-card border border-brand-border bg-white px-3 py-2 text-xs font-medium text-brand-ink shadow-soft group-hover:block group-focus-visible:block">
        WhatsApp BibaJilbab
      </span>
    </a>
  )
}
