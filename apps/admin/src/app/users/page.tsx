import { Badge, Card, CardContent, EmptyState } from "@bibajilbab/ui/server"

import { ActionForm } from "@/components/admin/action-feedback"
import { PageHeader } from "@/components/admin/page-header"
import { AdminShell } from "@/components/layout/admin-shell"
import {
  inviteAdminUserAction,
  updateAdminUserRoleAction,
  updateAdminUserStatusAction,
} from "@/lib/admin-actions"
import { listAdminUsers } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await requireAdminSession(["admin"])
  const users = await listAdminUsers()

  return (
    <AdminShell session={session}>
      <PageHeader
        eyebrow="Sécurité"
        title="Utilisateurs admin"
        description="Invitations, rôles, désactivation et protection contre la perte du dernier administrateur actif."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Inviter un compte</h2>
            <div className="mt-5">
              <ActionForm action={inviteAdminUserAction} submitLabel="Créer et générer le lien">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">E-mail</span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Nom affiché</span>
                    <input
                      name="displayName"
                      required
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-ink">
                    <span className="mb-2 block">Rôle</span>
                    <select
                      name="role"
                      defaultValue="editor"
                      className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
                    >
                      <option value="editor">Éditeur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
              </ActionForm>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-brand-ink">Comptes</h2>
            {users.length === 0 ? (
              <EmptyState
                title="Aucun utilisateur"
                description="Aucun compte administrateur chargé."
              />
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="text-brand-muted">
                    <tr>
                      <th className="border-b border-brand-border py-3 pr-4">Compte</th>
                      <th className="border-b border-brand-border py-3 pr-4">Rôle</th>
                      <th className="border-b border-brand-border py-3 pr-4">Statut</th>
                      <th className="border-b border-brand-border py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="align-top">
                        <td className="border-b border-brand-border py-4 pr-4">
                          <p className="font-semibold text-brand-ink">{user.displayName}</p>
                          <p className="mt-1 text-xs text-brand-muted">{user.email}</p>
                          <p className="mt-1 text-xs text-brand-muted">{user.uid}</p>
                        </td>
                        <td className="border-b border-brand-border py-4 pr-4">
                          <Badge variant={user.role === "admin" ? "plum" : "outline"}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="border-b border-brand-border py-4 pr-4">
                          <Badge variant={user.status === "active" ? "success" : "warning"}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="space-y-4 border-b border-brand-border py-4">
                          <ActionForm
                            action={updateAdminUserRoleAction}
                            submitLabel="Changer le rôle"
                          >
                            <input type="hidden" name="uid" value={user.uid} />
                            <select
                              name="role"
                              defaultValue={user.role}
                              className="h-10 w-full rounded-card border border-brand-border px-3 text-sm"
                            >
                              <option value="editor">Éditeur</option>
                              <option value="admin">Admin</option>
                            </select>
                          </ActionForm>
                          <ActionForm
                            action={updateAdminUserStatusAction}
                            submitLabel="Changer le statut"
                          >
                            <input type="hidden" name="uid" value={user.uid} />
                            <select
                              name="status"
                              defaultValue={user.status}
                              className="h-10 w-full rounded-card border border-brand-border px-3 text-sm"
                            >
                              <option value="active">Actif</option>
                              <option value="disabled">Désactivé</option>
                            </select>
                          </ActionForm>
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
