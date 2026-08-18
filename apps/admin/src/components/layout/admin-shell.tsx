import { LayoutDashboard, Package, ShieldAlert, ShoppingBag, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { brandConfig } from "@bibajilbab/config"
import { Badge, cn } from "@bibajilbab/ui/server"

import type { AdminSession } from "@/lib/auth"
import { canAccessSection, type AdminSection } from "@/lib/permissions"

import { LogoutButton } from "./logout-button"
import { UnsavedChangesGuard } from "../admin/unsaved-changes-guard"

const navItems: Array<{
  href: string
  label: string
  section: AdminSection
  icon: typeof LayoutDashboard
}> = [
  { href: "/", label: "Tableau de bord", section: "dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Produits", section: "products", icon: Package },
  { href: "/requests", label: "Demandes WhatsApp", section: "requests", icon: ShoppingBag },
  {
    href: "/settings",
    label: "Paramètres de la boutique",
    section: "settings",
    icon: SlidersHorizontal,
  },
]

export function AdminShell({ session, children }: { session: AdminSession; children: ReactNode }) {
  const visibleItems = navItems.filter((item) => canAccessSection(session.role, item.section))

  return (
    <div className="min-h-screen bg-brand-blush">
      <UnsavedChangesGuard />
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-brand-border bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-border p-6">
            <p className="text-xl font-semibold text-brand-ink">{brandConfig.name}</p>
            <p className="mt-1 text-sm text-brand-muted">Administration privée</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navigation admin">
            {visibleItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-card px-3 text-sm font-medium text-brand-muted transition hover:bg-brand-blush hover:text-brand-plum focus-visible:outline-none focus-visible:shadow-focus",
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
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
          <div className="border-b border-brand-border bg-white px-4 py-3 text-sm text-brand-plum sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="font-medium">Mode développement local actif (Session simulée)</span>
            </div>
          </div>
        ) : null}
        <header className="sticky top-0 z-30 border-b border-brand-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-ink">{brandConfig.name}</p>
              <p className="text-xs text-brand-muted">Admin</p>
            </div>
            <LogoutButton />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 shrink-0 rounded-card border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
