import "server-only"

import { FieldValue } from "firebase-admin/firestore"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "@/lib/firebase/admin"

import type { AdminRole } from "./permissions"

export interface AuditInput {
  actorUid: string
  actorEmail?: string | undefined
  actorRole?: AdminRole | undefined
  action: string
  collection: string
  documentId?: string | undefined
  metadata?: Record<string, unknown> | undefined
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  if (!getFirebaseAdminStatus().available) {
    return
  }

  const db = getFirebaseAdminFirestore()

  await db.collection("auditLogs").add({
    actorAdminId: input.actorUid,
    actorEmail: input.actorEmail ?? null,
    actorRole: input.actorRole ?? null,
    action: input.action,
    collection: input.collection,
    documentId: input.documentId ?? null,
    metadata: input.metadata ?? {},
    createdAt: FieldValue.serverTimestamp(),
  })
}
