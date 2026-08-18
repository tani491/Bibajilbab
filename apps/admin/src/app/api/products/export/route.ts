import { NextResponse } from "next/server"

import { listProducts } from "@/lib/admin-data"
import { requireAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { toCsv } from "@/lib/csv"

export async function GET() {
  const session = await requireAdminSession(["admin", "editor"])
  const products = await listProducts()
  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    status: product.status,
    price: product.price,
    stock: product.stock,
    updatedAt: product.updatedAt,
  }))
  const csv = toCsv(rows, ["id", "name", "slug", "sku", "status", "price", "stock", "updatedAt"])

  await writeAuditLog({
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    action: "products.exportCsv",
    collection: "products",
    metadata: { rows: products.length },
  })

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bibajilbab-products.csv"',
      "Cache-Control": "no-store",
    },
  })
}
