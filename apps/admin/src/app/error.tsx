"use client"

import { Button } from "@bibajilbab/ui"
import { ErrorState } from "@bibajilbab/ui/server"

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blush p-6">
      <div className="max-w-lg rounded-card border border-brand-border bg-white p-6">
        <ErrorState
          title="Erreur administrative"
          description={error.message || "Une erreur privée s'est produite."}
        />
        <div className="mt-5 flex justify-center">
          <Button type="button" onClick={reset}>
            Réessayer
          </Button>
        </div>
      </div>
    </main>
  )
}
