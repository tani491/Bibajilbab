import { NextResponse } from "next/server"

import { listOrderRequests } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { toCsv } from "@/lib/csv"

export async function GET() {
  const session = await requireAdminSession(["admin", "editor"])
  const requests = await listOrderRequests()
  const rows = requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    customerName: request.customerName,
    phone: request.phone,
    city: request.city,
    subtotal: request.subtotal,
    status: request.status,
  }))
  const csv = toCsv(rows, [
    "id",
    "createdAt",
    "customerName",
    "phone",
    "city",
    "subtotal",
    "status",
  ])

  await writeAuditLog({
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    action: "orderRequests.exportCsv",
    collection: "orderRequests",
    metadata: { rows: requests.length },
  })

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bibajilbab-whatsapp-requests.csv"',
      "Cache-Control": "no-store",
    },
  })
}
