import { Trash2 } from "lucide-react"

import { Card, CardContent, EmptyState } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  deleteCategoryAction,
  deleteCollectionAction,
  saveCategoryAction,
  saveCollectionAction,
} from "@/lib/admin-actions"
import { listCategories, listCollections } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const [categories, collections] = await Promise.all([listCategories(), listCollections()])

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Catalogue"
        title="Catégories et collections"
        description="Organisez les familles produits et les sélections affichées sur la boutique."
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Nouvelle catégorie</h2>
            <div className="mt-5">
              <ActionForm action={saveCategoryAction} submitLabel="Enregistrer la catégorie">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom de la catégorie</span>
                    <input
                      name="name"
                      required
                      placeholder="Jilbab, Khimar, Tunique..."
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Description courte</span>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                    />
                  </label>
                  <ImageUploadField folder="bibajilbab/categories" />
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Nouvelle collection</h2>
            <div className="mt-5">
              <ActionForm action={saveCollectionAction} submitLabel="Enregistrer la collection">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom de la collection</span>
                    <input
                      name="name"
                      required
                      placeholder="Nouvelle Collection, Tabaski, Vente Flash..."
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Description courte</span>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                    />
                  </label>
                  <ImageUploadField label="Photo de couverture" folder="bibajilbab/collections" />
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Catégories existantes</h2>
            {categories.length === 0 ? (
              <EmptyState title="Aucune catégorie" description="Aucune donnée Firestore chargée." />
            ) : (
              <div className="mt-5 grid gap-3">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="flex flex-col gap-3 rounded-card border border-brand-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-brand-ink">{category.name}</p>
                      {category.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-brand-muted">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <ActionForm
                      action={deleteCategoryAction}
                      submitLabel="Supprimer"
                      danger
                      compact
                      submitIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                      confirmMessage={`Supprimer la catégorie ${category.name} ?`}
                    >
                      <input type="hidden" name="id" value={category.id} />
                    </ActionForm>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Collections existantes</h2>
            {collections.length === 0 ? (
              <EmptyState
                title="Aucune collection"
                description="Aucune donnée Firestore chargée."
              />
            ) : (
              <div className="mt-5 grid gap-3">
                {collections.map((collection) => (
                  <article
                    key={collection.id}
                    className="flex flex-col gap-3 rounded-card border border-brand-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-brand-ink">{collection.name}</p>
                      {collection.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-brand-muted">
                          {collection.description}
                        </p>
                      ) : null}
                    </div>
                    <ActionForm
                      action={deleteCollectionAction}
                      submitLabel="Supprimer"
                      danger
                      compact
                      submitIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                      confirmMessage={`Supprimer la collection ${collection.name} ?`}
                    >
                      <input type="hidden" name="id" value={collection.id} />
                    </ActionForm>
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
