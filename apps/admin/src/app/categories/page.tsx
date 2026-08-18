import { Badge, Card, CardContent, EmptyState } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import { saveCategoryAction, saveCollectionAction } from "@/lib/admin-actions"
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
        description="Structure du catalogue public, avec planification des collections Tabaski et Korité."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Catégorie</h2>
            <div className="mt-5">
              <ActionForm action={saveCategoryAction} submitLabel="Enregistrer la catégorie">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Position</span>
                    <input
                      name="position"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom</span>
                    <input
                      name="name"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Adresse URL</span>
                    <input
                      name="slug"
                      placeholder="ex : djilbabs"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                    />
                  </label>
                  <ImageUploadField folder="bibajilbab/categories" />
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
                    <span className="mb-2 block">Titre SEO</span>
                    <input
                      name="seoTitle"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Description SEO</span>
                    <input
                      name="seoDescription"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Collection</h2>
            <div className="mt-5">
              <ActionForm action={saveCollectionAction} submitLabel="Enregistrer la collection">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Type</span>
                    <select
                      name="type"
                      defaultValue="permanent"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    >
                      <option value="permanent">Permanent</option>
                      <option value="tabaski">Tabaski</option>
                      <option value="korite">Korité</option>
                      <option value="seasonal">Saisonnier</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom</span>
                    <input
                      name="name"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Adresse URL</span>
                    <input
                      name="slug"
                      placeholder="ex : collection-tabaski"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink md:col-span-2">
                    <span className="mb-2 block">Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Début</span>
                    <input
                      name="startsAt"
                      type="datetime-local"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Fin</span>
                    <input
                      name="endsAt"
                      type="datetime-local"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Position</span>
                    <input
                      name="position"
                      type="number"
                      min="0"
                      defaultValue="0"
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
                  <ImageUploadField label="Image de couverture" folder="bibajilbab/collections" />
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Catégories existantes</h2>
            {categories.length === 0 ? (
              <EmptyState title="Aucune catégorie" description="Aucune donnée Firestore chargée." />
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-brand-muted">
                    <tr>
                      <th className="border-b border-brand-border py-3 pr-4">Nom</th>
                      <th className="border-b border-brand-border py-3 pr-4">Adresse URL</th>
                      <th className="border-b border-brand-border py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-ink">
                          {category.name}
                        </td>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-muted">
                          {category.slug}
                        </td>
                        <td className="border-b border-brand-border py-3">
                          <Badge variant={category.status === "published" ? "success" : "outline"}>
                            {category.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-brand-muted">
                    <tr>
                      <th className="border-b border-brand-border py-3 pr-4">Nom</th>
                      <th className="border-b border-brand-border py-3 pr-4">Type</th>
                      <th className="border-b border-brand-border py-3 pr-4">Période</th>
                      <th className="border-b border-brand-border py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection) => (
                      <tr key={collection.id}>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-ink">
                          {collection.name}
                        </td>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-muted">
                          {collection.type}
                        </td>
                        <td className="border-b border-brand-border py-3 pr-4 text-brand-muted">
                          {[collection.startsAt, collection.endsAt].filter(Boolean).join(" -> ") ||
                            "non planifiée"}
                        </td>
                        <td className="border-b border-brand-border py-3">
                          <Badge
                            variant={collection.status === "published" ? "success" : "outline"}
                          >
                            {collection.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  )
}
