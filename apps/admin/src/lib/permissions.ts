import { z } from "zod"

export const adminRoleSchema = z.enum(["admin", "editor"])
export type AdminRole = z.infer<typeof adminRoleSchema>

export const adminSectionSchema = z.enum([
  "dashboard",
  "products",
  "media",
  "categories",
  "content",
  "requests",
  "inventory",
  "users",
  "settings",
])
export type AdminSection = z.infer<typeof adminSectionSchema>

const editorSections = new Set<AdminSection>([
  "dashboard",
  "products",
  "media",
  "categories",
  "content",
  "requests",
  "inventory",
])

export function isAdminRole(value: unknown): value is AdminRole {
  return adminRoleSchema.safeParse(value).success
}

export function canAccessSection(role: AdminRole, section: AdminSection): boolean {
  if (role === "admin") {
    return true
  }

  return editorSections.has(section)
}

export function canManageCriticalSettings(role: AdminRole): boolean {
  return role === "admin"
}

export function canManageUsers(role: AdminRole): boolean {
  return role === "admin"
}

export function canMutateContent(role: AdminRole): boolean {
  return role === "admin" || role === "editor"
}

export function assertSectionAccess(role: AdminRole, section: AdminSection): void {
  if (!canAccessSection(role, section)) {
    throw new Error("Accès refusé pour ce rôle.")
  }
}

export function wouldRemoveLastActiveAdmin({
  targetUid,
  currentRole,
  nextRole,
  nextStatus,
  activeAdminUids,
}: {
  targetUid: string
  currentRole: AdminRole
  nextRole?: AdminRole
  nextStatus?: "active" | "disabled"
  activeAdminUids: string[]
}): boolean {
  const targetIsActiveAdmin = currentRole === "admin" && activeAdminUids.includes(targetUid)
  const remainingAdmins = activeAdminUids.filter((uid) => uid !== targetUid)
  const roleWouldBeRemoved = nextRole !== undefined && nextRole !== "admin"
  const accountWouldBeDisabled = nextStatus === "disabled"

  return (
    targetIsActiveAdmin &&
    remainingAdmins.length === 0 &&
    (roleWouldBeRemoved || accountWouldBeDisabled)
  )
}
