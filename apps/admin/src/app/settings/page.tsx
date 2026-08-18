import { CheckCircle2, XCircle } from "lucide-react"

import { brandConfig, parsePublicEnv } from "@bibajilbab/config"
import { Card, CardContent } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { PasswordResetCard } from "@/components/admin/password-reset-card"
import { AdminShell } from "@/components/layout/admin-shell"
import { saveContentAction } from "@/lib/admin-actions"
import { getSiteSettingsDocument } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"
import { getCloudinaryServerStatus } from "@/lib/cloudinary/server"
import { getFirebaseAdminStatus } from "@/lib/firebase/admin"

export const dynamic = "force-dynamic"

function textValue(settings: unknown, key: string, fallback = ""): string {
  if (!settings || typeof settings !== "object") {
    return fallback
  }

  const value = (settings as Record<string, unknown>)[key]

  return typeof value === "string" ? value : fallback
}

const settingsTextFields: Array<[string, string, number]> = [
  ["deliveryPolicy", "Informations de livraison", 5],
  ["returnsPolicy", "Retours et échanges", 4],
  ["sizeGuide", "Guide des tailles", 4],
  ["footerText", "Texte du pied de page", 3],
  ["legalNotice", "Mentions légales", 4],
  ["termsSummary", "Conditions générales", 4],
  ["privacySummary", "Confidentialité", 4],
]

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  const Icon = ok ? CheckCircle2 : XCircle

  return (
    <div className="flex items-start gap-3 rounded-card border border-brand-border p-4">
      <Icon
        aria-hidden="true"
        className={ok ? "mt-0.5 h-5 w-5 text-green-700" : "mt-0.5 h-5 w-5 text-red-700"}
      />
      <div>
        <p className="font-medium text-brand-ink">{label}</p>
        <p className="mt-1 text-sm leading-6 text-brand-muted">{detail}</p>
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  const session = await requireAdminSession(["admin"])
  const settings = await getSiteSettingsDocument()
  const publicEnv = parsePublicEnv(process.env)
  const firebaseStatus = getFirebaseAdminStatus()
  const cloudinaryStatus = getCloudinaryServerStatus()

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Paramètres"
        title="Informations boutique"
        description="Coordonnées, réseaux sociaux, livraison et accès administrateur."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Coordonnées visibles</h2>
            <div className="mt-5">
              <ActionForm action={saveContentAction} submitLabel="Enregistrer les informations">
                <input type="hidden" name="contentKind" value="settings" />
                <input
                  type="hidden"
                  name="whatsappTechnical"
                  value={brandConfig.whatsapp.technical}
                />
                <input type="hidden" name="currency" value="XOF" />
                <input type="hidden" name="locale" value="fr-SN" />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom de la boutique</span>
                    <input
                      name="brandName"
                      defaultValue={textValue(settings, "brandName", brandConfig.name)}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Logo</span>
                    <input
                      name="logoUrl"
                      type="url"
                      defaultValue={textValue(settings, "logoUrl")}
                      placeholder="https://..."
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
                    <span className="mb-2 block">E-mail de contact</span>
                    <input
                      name="contactEmail"
                      type="email"
                      defaultValue={textValue(settings, "contactEmail")}
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
                        publicEnv.brand.instagramUrl,
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
                      defaultValue={textValue(settings, "tiktokUrl", publicEnv.brand.tiktokUrl)}
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Annonce boutique</span>
                    <input
                      name="announcement"
                      defaultValue={textValue(settings, "announcement")}
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  {settingsTextFields.map(([name, label, rows]) => (
                    <label key={name} className="text-sm font-medium text-brand-ink md:col-span-2">
                      <span className="mb-2 block">{label}</span>
                      <textarea
                        name={name}
                        rows={rows}
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

        <div className="space-y-6">
          <PasswordResetCard email={session.email} isMock={session.isMock ?? false} />

          <details className="rounded-card border border-brand-border bg-white p-5">
            <summary className="cursor-pointer text-lg font-semibold text-brand-ink">
              État avancé
            </summary>
            <div className="mt-5 space-y-4">
              <StatusRow
                label="Connexion sécurisée"
                ok={publicEnv.firebase.configured}
                detail={
                  publicEnv.firebase.configured
                    ? "La connexion e-mail et mot de passe est disponible."
                    : "La configuration de connexion est incomplète."
                }
              />
              <StatusRow
                label="Accès serveur"
                ok={firebaseStatus.available}
                detail={
                  firebaseStatus.available
                    ? "Les sessions, rôles et enregistrements sont disponibles."
                    : "Configuration serveur manquante."
                }
              />
              <StatusRow
                label="Téléversement d'images"
                ok={cloudinaryStatus.available}
                detail={
                  cloudinaryStatus.available
                    ? "Les téléversements serveur sont disponibles."
                    : "Configuration image manquante."
                }
              />
            </div>
          </details>
        </div>
      </section>
    </AdminShell>
  )
}
