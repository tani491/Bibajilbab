import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const rules = readFileSync(new URL("../../../../firestore.rules", import.meta.url), "utf8")

describe("Firestore authorization rules", () => {
  it("keeps deny-by-default and public reads limited to published content", () => {
    expect(rules).toContain("match /{document=**}")
    expect(rules).toContain("allow read, write: if false")
    expect(rules).toContain('resource.data.status == "published"')
  })

  it("requires adminRole claims for privileged writes", () => {
    expect(rules).toContain('request.auth.token.adminRole == "admin"')
    expect(rules).toContain('request.auth.token.adminRole == "editor"')
    expect(rules).toContain("allow create, update: if canWriteContent()")
    expect(rules).toContain("allow create, update, delete: if isAdmin()")
  })
})
