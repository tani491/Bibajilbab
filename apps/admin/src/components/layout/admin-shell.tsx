import { ShieldAlert } from "lucide-react"
import type { ReactNode } from "react"

import { brandConfig } from "@bibajilbab/config"
import { Badge } from "@bibajilbab/ui/server"

import type { AdminSession } from "@/lib/auth"

import { AdminNav } from "./admin-nav"
import { LogoutButton } from "./logout-button"
import { UnsavedChangesGuard } from "../admin/unsaved-changes-guard"

export function AdminShell({ session, children }: { session: AdminSession; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-brand-blush">
      <UnsavedChangesGuard />
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-brand-border bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-border p-6">
            <p className="text-xl font-semibold text-brand-ink">{brandConfig.name}</p>
            <p className="mt-1 text-sm text-brand-muted">Administration privée</p>
          </div>
          <div className="flex-1 p-4">
            <AdminNav role={session.role} variant="desktop" />
          </div>
          <div className="border-t border-brand-border p-4">
            <Badge variant={session.role === "admin" ? "plum" : "outline"}>{session.role}</Badge>
            <p className="mt-3 text-sm font-medium text-brand-ink">{session.displayName}</p>
            <p className="mt-1 truncate text-xs text-brand-muted">{session.email}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        {session.isMock ? (
          <div className="border-b border-brand-border bg-white px-3 py-3 text-sm text-brand-plum sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="font-medium">Mode développement local actif (Session simulée)</span>
            </div>
          </div>
        ) : null}
        <header className="sticky top-0 z-30 border-b border-brand-border bg-white/95 px-3 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-ink">{brandConfig.name}</p>
              <p className="text-xs text-brand-muted">Admin</p>
            </div>
            <LogoutButton />
          </div>
          <div className="mt-3">
            <AdminNav role={session.role} variant="mobile" />
          </div>
        </header>
        <main className="w-full max-w-full overflow-x-hidden p-3 sm:p-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
