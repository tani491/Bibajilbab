import { BadgeCheck, Plus, Star, Trash2 } from "lucide-react"

import { Badge, Card, CardContent, EmptyState, buttonStyles } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  deleteTestimonialAction,
  saveTestimonialAction,
  updateTestimonialPublicationAction,
} from "@/lib/admin-actions"
import { listTestimonials, type AdminTestimonialRow } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-brand-border"
          }
        />
      ))}
    </span>
  )
}

function TestimonialFields({ testimonial }: { testimonial?: AdminTestimonialRow }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Nom de la cliente</span>
        <input
          name="authorName"
          required
          defaultValue={testimonial?.authorName ?? ""}
          placeholder="Aminata D."
          className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
        />
      </label>
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Ville / quartier</span>
        <input
          name="city"
          defaultValue={testimonial?.city ?? ""}
          placeholder="Dakar, Mermoz..."
          className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
        />
      </label>
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Note</span>
        <select
          name="rating"
          defaultValue={testimonial?.rating ?? 5}
          className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Ordre</span>
        <input
          name="orderIndex"
          type="number"
          min="0"
          defaultValue={testimonial?.orderIndex ?? 0}
          className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
        />
      </label>
      <label className="text-sm font-medium text-brand-ink md:col-span-2">
        <span className="mb-2 block">Avis</span>
        <textarea
          name="content"
          required
          rows={5}
          defaultValue={testimonial?.content ?? ""}
          placeholder="Retour client à afficher sur la page d'accueil"
          className="w-full rounded-card border border-brand-border px-3 py-3 text-sm"
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 rounded-card border border-brand-border px-3 py-3 text-sm font-medium text-brand-ink">
        <input
          name="verifiedPurchase"
          type="checkbox"
          defaultChecked={testimonial?.verifiedPurchase ?? true}
          className="h-4 w-4 rounded border-brand-border text-brand-plum"
        />
        Achat vérifié
      </label>
      <label className="flex min-h-11 items-center gap-3 rounded-card border border-brand-border px-3 py-3 text-sm font-medium text-brand-ink">
        <input
          name="isPublished"
          type="checkbox"
          defaultChecked={testimonial?.isPublished ?? true}
          className="h-4 w-4 rounded border-brand-border text-brand-plum"
        />
        Publier sur le site
      </label>
    </div>
  )
}

export default async function TestimonialsPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const testimonials = await listTestimonials()

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Contenu"
        title="Témoignages"
        description="Avis clientes publiés sur la page d'accueil, avec note, ville et badge d'achat vérifié."
        action={
          <a href="#add-testimonial" className={buttonStyles({ className: "w-full sm:w-auto" })}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Ajouter un témoignage
          </a>
        }
      />

      <Card id="add-testimonial" className="mt-6">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-brand-ink">Ajouter un témoignage</h2>
          <div className="mt-5">
            <ActionForm action={saveTestimonialAction} submitLabel="Ajouter le témoignage">
              <TestimonialFields />
            </ActionForm>
          </div>
        </CardContent>
      </Card>

      <section className="mt-6 grid gap-3">
        {testimonials.length === 0 ? (
          <div className="rounded-card border border-brand-border bg-white">
            <EmptyState
              title="Aucun témoignage"
              description="Ajoutez un premier retour client réel avant d'afficher la section sur la vitrine."
            />
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-card border border-brand-border bg-white p-4 shadow-soft"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-brand-ink">
                      {testimonial.authorName}
                    </h2>
                    <Badge variant={testimonial.isPublished ? "success" : "outline"}>
                      {testimonial.isPublished ? "Actif" : "Masqué"}
                    </Badge>
                    {testimonial.verifiedPurchase ? (
                      <Badge variant="powder" className="gap-1">
                        <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                        Achat vérifié
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                    <RatingStars rating={testimonial.rating} />
                    {testimonial.city ? <span>{testimonial.city}</span> : null}
                    <span>Ordre {testimonial.orderIndex}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-brand-muted">
                    {testimonial.content}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <ActionForm
                    action={updateTestimonialPublicationAction}
                    submitLabel={testimonial.isPublished ? "Masquer" : "Publier"}
                    compact
                  >
                    <input type="hidden" name="id" value={testimonial.id} />
                    <input
                      type="hidden"
                      name="isPublished"
                      value={testimonial.isPublished ? "false" : "true"}
                    />
                  </ActionForm>
                  <ActionForm
                    action={deleteTestimonialAction}
                    submitLabel={`Supprimer ${testimonial.authorName}`}
                    danger
                    compact
                    confirmMessage={`Confirmer la suppression du témoignage de ${testimonial.authorName} ?`}
                    submitIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                  >
                    <input type="hidden" name="id" value={testimonial.id} />
                  </ActionForm>
                </div>
              </div>

              <details className="mt-4 border-t border-brand-border pt-4">
                <summary className="cursor-pointer rounded-card px-2 py-2 text-sm font-semibold text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus">
                  Modifier
                </summary>
                <div className="mt-4">
                  <ActionForm
                    action={saveTestimonialAction}
                    submitLabel="Enregistrer les modifications"
                  >
                    <TestimonialFields testimonial={testimonial} />
                  </ActionForm>
                </div>
              </details>
            </article>
          ))
        )}
      </section>
    </AdminShell>
  )
}
