import Link from "next/link"

import { brandConfig } from "@bibajilbab/config"
import { Card, CardContent, EmptyState, buttonStyles } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import { saveContentAction } from "@/lib/admin-actions"
import {
  getSiteSettingsDocument,
  listFaqs,
  listHomepageSections,
  listTestimonials,
} from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

const contentTextFields: Array<[string, string]> = [
  ["deliveryPolicy", "Livraison"],
  ["returnsPolicy", "Retours et échanges"],
  ["sizeGuide", "Guide des tailles"],
  ["footerText", "Texte du pied de page"],
  ["legalNotice", "Mentions légales"],
  ["termsSummary", "Conditions générales"],
  ["privacySummary", "Confidentialité"],
]

function statusLabel(status: string): string {
  if (status === "published") return "Publié"
  if (status === "archived") return "Archivé"

  return "Brouillon"
}

function textValue(settings: unknown, key: string, fallback = ""): string {
  if (!settings || typeof settings !== "object") {
    return fallback
  }

  const value = (settings as Record<string, unknown>)[key]

  return typeof value === "string" ? value : fallback
}

export default async function ContentPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const [settings, sections, faqs, testimonials] = await Promise.all([
    getSiteSettingsDocument(),
    listHomepageSections(),
    listFaqs(),
    listTestimonials(),
  ])
  const contentLists = [
    {
      title: "Sections",
      rows: sections.map((item) => `${item.position}. ${item.title} - ${statusLabel(item.status)}`),
    },
    {
      title: "FAQ",
      rows: faqs.map((item) => `${item.position}. ${item.question} - ${statusLabel(item.status)}`),
    },
    {
      title: "Témoignages",
      rows: testimonials.map(
        (item) => `${item.position}. ${item.customerName} - ${statusLabel(item.status)}`,
      ),
    },
  ]

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Contenu"
        title="Mini-CMS"
        description="Textes du site, accueil, FAQ et témoignages dans une interface simplifiée."
        action={
          <Link href="/content/preview" className={buttonStyles({ variant: "outline" })}>
            Prévisualiser
          </Link>
        }
      />

      <nav className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
        {["Textes", "Accueil", "FAQ", "Avis"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="rounded-card border border-brand-border bg-white px-3 py-2 text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
          >
            {label}
          </a>
        ))}
      </nav>

      {session.role === "admin" ? (
        <Card id="textes" className="mt-8">
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Textes principaux</h2>
            <div className="mt-5">
              <ActionForm action={saveContentAction} submitLabel="Enregistrer les paramètres">
                <input type="hidden" name="contentKind" value="settings" />
                <input
                  type="hidden"
                  name="whatsappTechnical"
                  value={textValue(settings, "whatsappTechnical", brandConfig.whatsapp.technical)}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom de marque</span>
                    <input
                      name="brandName"
                      defaultValue={textValue(settings, "brandName", brandConfig.name)}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom légal</span>
                    <input
                      name="legalName"
                      defaultValue={textValue(settings, "legalName")}
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Slogan</span>
                    <input
                      name="slogan"
                      defaultValue={textValue(settings, "slogan", brandConfig.slogan)}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">WhatsApp affiché</span>
                    <input
                      name="whatsappDisplay"
                      defaultValue={textValue(
                        settings,
                        "whatsappDisplay",
                        brandConfig.whatsapp.display,
                      )}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Instagram</span>
                    <input
                      name="instagramUrl"
                      type="url"
                      defaultValue={textValue(
                        settings,
                        "instagramUrl",
                        "https://www.instagram.com/bibajilbab97/",
                      )}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">TikTok</span>
                    <input
                      name="tiktokUrl"
                      type="url"
                      defaultValue={textValue(
                        settings,
                        "tiktokUrl",
                        "https://www.tiktok.com/@habibabibajilbaba",
                      )}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Annonce</span>
                    <input
                      name="announcement"
                      defaultValue={textValue(settings, "announcement")}
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Titre SEO global</span>
                    <input
                      name="seoTitle"
                      defaultValue={textValue(settings, "seoTitle")}
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Description SEO globale</span>
                    <input
                      name="seoDescription"
                      defaultValue={textValue(settings, "seoDescription")}
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  {contentTextFields.map(([name, label]) => (
                    <label key={name} className="text-sm font-medium text-brand-ink md:col-span-2">
                      <span className="mb-2 block">{label}</span>
                      <textarea
                        name={name}
                        rows={4}
                        defaultValue={textValue(settings, name)}
                        className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                      />
                    </label>
                  ))}
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card id="accueil">
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Section d'accueil</h2>
            <div className="mt-5">
              <ActionForm action={saveContentAction} submitLabel="Enregistrer la section">
                <input type="hidden" name="contentKind" value="section" />
                <input type="hidden" name="productIds" value="" />
                <input type="hidden" name="collectionId" value="" />
                <input type="hidden" name="mediaId" value="" />
                <div className="space-y-4">
                  <select
                    name="kind"
                    defaultValue="hero"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  >
                    <option value="hero">Grand bandeau d'accueil</option>
                    <option value="featuredProducts">Produits vedettes</option>
                    <option value="collectionHighlight">Collection</option>
                    <option value="testimonials">Témoignages</option>
                    <option value="faqs">FAQ</option>
                  </select>
                  <input
                    name="title"
                    required
                    placeholder="Titre"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <input
                    name="eyebrow"
                    placeholder="Sur-titre"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <textarea
                    name="body"
                    rows={4}
                    placeholder="Texte"
                    className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                  />
                  <input
                    name="ctaLabel"
                    placeholder="Libellé CTA"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <input
                    name="ctaHref"
                    placeholder="Lien du bouton, ex : /catalogue"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <input
                    name="position"
                    type="number"
                    min="0"
                    defaultValue="0"
                    aria-label="Ordre d'affichage"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <select
                    name="status"
                    defaultValue="draft"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card id="faq">
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">FAQ</h2>
            <div className="mt-5">
              <ActionForm action={saveContentAction} submitLabel="Enregistrer la FAQ">
                <input type="hidden" name="contentKind" value="faq" />
                <div className="space-y-4">
                  <input
                    name="question"
                    required
                    placeholder="Question"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <textarea
                    name="answer"
                    required
                    rows={5}
                    placeholder="Réponse"
                    className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                  />
                  <input
                    name="position"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <select
                    name="status"
                    defaultValue="draft"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card id="avis">
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Témoignage</h2>
            <div className="mt-5">
              <ActionForm action={saveContentAction} submitLabel="Enregistrer le témoignage">
                <input type="hidden" name="contentKind" value="testimonial" />
                <div className="space-y-4">
                  <input
                    name="customerName"
                    required
                    placeholder="Nom cliente"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <textarea
                    name="content"
                    required
                    rows={5}
                    placeholder="Avis"
                    className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                  />
                  <input
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Note"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <input
                    name="position"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  />
                  <select
                    name="status"
                    defaultValue="draft"
                    className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        {contentLists.map(({ title, rows }) => (
          <Card key={title}>
            <CardContent>
              <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
              {Array.isArray(rows) && rows.length > 0 ? (
                <ul className="mt-5 space-y-3 text-sm text-brand-muted">
                  {rows.map((row) => (
                    <li key={row} className="rounded-card border border-brand-border p-3">
                      {row}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Aucun contenu" description="Aucun document à afficher." />
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminShell>
  )
}
