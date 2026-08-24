"use client"

export default function GlobalError() {
  return (
    <html lang="fr">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#FFF5F8] p-6 text-center text-slate-900">
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold">L'administration est momentanément indisponible</h1>
            <p className="mt-3 text-sm text-slate-600">Réessayez dans quelques instants.</p>
          </div>
        </main>
      </body>
    </html>
  )
}
