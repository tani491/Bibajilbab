import Image from "next/image"

import { Badge, Card, CardContent, EmptyState } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { CloudinaryUploadPanel } from "@/components/admin/cloudinary-upload-panel"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import { saveMediaAction } from "@/lib/admin-actions"
import { listMedia } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function MediaPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const media = await listMedia()

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Bibliothèque"
        title="Médias"
        description="Galerie d'images pour la page d'accueil, les catégories, les collections et les contenus."
      />

      <section className="mt-8">
        <CloudinaryUploadPanel />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Ajouter une image à la galerie</h2>
            <div className="mt-5">
              <ActionForm action={saveMediaAction} submitLabel="Enregistrer l'image">
                <div className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="kind" value="image" />
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Lien de l'image</span>
                    <input
                      name="url"
                      type="url"
                      placeholder="https://..."
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Description courte</span>
                    <input
                      name="alt"
                      placeholder="Ex : Djilbab rose poudré porté de face"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Statut</span>
                    <select
                      name="status"
                      defaultValue="draft"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Utilisation</span>
                    <select
                      name="usage"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    >
                      <option value="">À choisir plus tard</option>
                      <option value="Bannière d'accueil">Bannière d'accueil</option>
                      <option value="Page contenu">Page contenu</option>
                      <option value="Catégorie">Catégorie</option>
                      <option value="Collection">Collection</option>
                      <option value="Produit">Produit</option>
                    </select>
                  </label>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Médiathèque</h2>
            {media.length === 0 ? (
              <EmptyState
                title="Aucun média"
                description="Ajoutez les premières images de la boutique."
              />
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {media.map((item) => (
                  <article key={item.id} className="rounded-card border border-brand-border p-3">
                    {item.url ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-brand-blush">
                        <Image
                          src={item.url}
                          alt={item.alt}
                          fill
                          sizes="280px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-brand-ink">{item.alt}</p>
                      <Badge variant={item.status === "published" ? "success" : "outline"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate text-xs text-brand-muted">
                      {item.usage ?? "Aucune utilisation choisie"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  )
}
