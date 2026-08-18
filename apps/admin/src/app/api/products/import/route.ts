import { NextResponse } from "next/server"

import { requireAdminSession } from "@/lib/auth"

export async function POST() {
  await requireAdminSession(["admin", "editor"])

  return NextResponse.json(
    {
      error:
        "Import CSV via API directe non activé. Utilisez le formulaire sécurisé de la page Produits.",
    },
    { status: 405 },
  )
}
