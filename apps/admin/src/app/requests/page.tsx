import { MessageCircle } from "lucide-react"

import { Badge, Card, CardContent, EmptyState, buttonStyles } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import { updateOrderRequestAction } from "@/lib/admin-actions"
import { listOrderRequests } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

const requestStatuses = [
  ["draft", "Brouillon"],
  ["whatsappInitiated", "WhatsApp initié"],
  ["toConfirm", "À confirmer"],
  ["confirmed", "Confirmée"],
  ["preparing", "Préparation"],
  ["shipped", "Expédiée"],
  ["delivered", "Livrée"],
  ["cancelled", "Annulée"],
] as const

export default async function RequestsPage() {
  const session = await requireAdminSession(["admin", "editor"])
  const requests = await listOrderRequests()

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Demandes"
        title="Demandes WhatsApp"
        description="Suivi interne des demandes. Les conversations WhatsApp privées ne sont ni lues ni stockées."
        action={
          <a href="/api/requests/export" className={buttonStyles({ variant: "outline" })}>
            Export CSV
          </a>
        }
      />

      <section className="mt-8 overflow-hidden rounded-card border border-brand-border bg-white">
        {requests.length === 0 ? (
          <EmptyState title="Aucune demande" description="Aucune demande WhatsApp à afficher." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-brand-blush text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Montant estimatif</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Mise à jour</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-brand-border align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-brand-ink">{request.customerName}</p>
                      <p className="mt-1 text-xs text-brand-muted">{request.createdAt}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-muted">{request.phone}</td>
                    <td className="px-4 py-4 text-brand-muted">{request.city ?? "Non précisée"}</td>
                    <td className="px-4 py-4 text-brand-muted">{request.subtotal} XOF</td>
                    <td className="px-4 py-4">
                      <Badge variant={request.status === "confirmed" ? "success" : "outline"}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <ActionForm action={updateOrderRequestAction} submitLabel="Mettre à jour">
                        <input type="hidden" name="requestId" value={request.id} />
                        <div className="grid gap-3">
                          <select
                            name="status"
                            defaultValue={request.status}
                            className="h-10 rounded-card border border-brand-border px-3 text-sm"
                          >
                            {requestStatuses.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            name="internalNote"
                            rows={3}
                            placeholder="Note interne sans conversation privée"
                            className="rounded-card border border-brand-border px-3 py-2 text-sm"
                          />
                        </div>
                      </ActionForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card className="mt-8">
        <CardContent>
          <div className="flex items-start gap-3">
            <MessageCircle aria-hidden="true" className="mt-0.5 h-5 w-5 text-brand-plum" />
            <p className="text-sm leading-6 text-brand-muted">
              Le stock est réduit uniquement lors du passage manuel en statut confirmé. Aucun
              paiement en ligne ni lecture de messages WhatsApp n'est intégré.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  )
}
