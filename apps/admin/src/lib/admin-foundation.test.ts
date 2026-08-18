import { beforeEach, describe, expect, it } from "vitest"

import { parseSimpleCsv, toCsv } from "./csv"
import { applyStockAdjustment, isLowStock } from "./inventory"
import { canAccessSection, canManageUsers, wouldRemoveLastActiveAdmin } from "./permissions"
import { filterPubliclyVisible } from "./public-visibility"
import { checkRateLimit, resetRateLimit } from "./rate-limit"

describe("admin foundations", () => {
  beforeEach(() => {
    resetRateLimit()
  })

  it("enforces admin and editor section access", () => {
    expect(canAccessSection("admin", "users")).toBe(true)
    expect(canAccessSection("editor", "products")).toBe(true)
    expect(canAccessSection("editor", "content")).toBe(true)
    expect(canAccessSection("editor", "users")).toBe(false)
    expect(canAccessSection("editor", "settings")).toBe(false)
    expect(canManageUsers("editor")).toBe(false)
  })

  it("detects changes that would remove the last active admin", () => {
    expect(
      wouldRemoveLastActiveAdmin({
        targetUid: "admin-1",
        currentRole: "admin",
        nextRole: "editor",
        activeAdminUids: ["admin-1"],
      }),
    ).toBe(true)
    expect(
      wouldRemoveLastActiveAdmin({
        targetUid: "admin-1",
        currentRole: "admin",
        nextStatus: "disabled",
        activeAdminUids: ["admin-1", "admin-2"],
      }),
    ).toBe(false)
  })

  it("rate-limits repeated login or signature attempts", () => {
    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000, now: 1 }).allowed).toBe(
      true,
    )
    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000, now: 2 }).allowed).toBe(
      true,
    )
    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000, now: 3 })).toMatchObject(
      {
        allowed: false,
        remaining: 0,
      },
    )
  })

  it("keeps draft and archived records out of public visibility", () => {
    const visible = filterPubliclyVisible([
      { id: "draft", status: "draft" as const },
      { id: "published", status: "published" as const },
      { id: "archived", status: "archived" as const },
    ])

    expect(visible).toEqual([{ id: "published", status: "published" }])
  })

  it("blocks negative stock and flags low stock", () => {
    expect(() =>
      applyStockAdjustment({
        variant: { id: "standard", stock: 1, lowStockThreshold: 2, status: "active" },
        delta: -2,
      }),
    ).toThrow("négatif")
    expect(
      applyStockAdjustment({
        variant: { id: "standard", stock: 1, lowStockThreshold: 2, status: "active" },
        delta: -1,
      }),
    ).toMatchObject({ stock: 0, status: "inactive" })
    expect(isLowStock({ stock: 2, lowStockThreshold: 3 })).toBe(true)
  })

  it("escapes CSV exports and limits simple imports", () => {
    expect(toCsv([{ name: "Khimar, prune", note: 'Ligne "test"' }], ["name", "note"])).toBe(
      'name,note\n"Khimar, prune","Ligne ""test"""',
    )
    expect(parseSimpleCsv("name,slug\nKhimar,khimar", 1)).toEqual([
      { name: "Khimar", slug: "khimar" },
    ])
    expect(() => parseSimpleCsv("name\nA\nB", 1)).toThrow("limité")
  })
})
