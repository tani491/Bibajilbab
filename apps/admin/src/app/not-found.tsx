import Link from "next/link"

import { EmptyState, buttonStyles } from "@bibajilbab/ui/server"

export default function AdminNotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blush p-6">
      <div className="max-w-lg rounded-card border border-brand-border bg-white p-6">
        <EmptyState title="Page introuvable" description="Cette section admin n'existe pas." />
        <div className="mt-5 flex justify-center">
          <Link href="/" className={buttonStyles()}>
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  )
}
