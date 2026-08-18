import { describe, expect, it } from "vitest"

import {
  adminImageMaxBytes,
  validateAdminImageFile,
  validateCloudinaryFolderName,
} from "./validation"

describe("admin Cloudinary upload validation", () => {
  it("accepts supported images under the size limit", () => {
    expect(
      validateAdminImageFile({
        name: "hero.webp",
        size: 120_000,
        type: "image/webp",
      }),
    ).toBeNull()
  })

  it("rejects unsupported MIME types and oversized files", () => {
    expect(
      validateAdminImageFile({
        name: "script.svg",
        size: 120_000,
        type: "image/svg+xml",
      }),
    ).toContain("Format")
    expect(
      validateAdminImageFile({
        name: "large.jpg",
        size: adminImageMaxBytes + 1,
        type: "image/jpeg",
      }),
    ).toContain("5 Mo")
  })

  it("rejects unsafe Cloudinary folder names", () => {
    expect(validateCloudinaryFolderName("bibajilbab/produits")).toBeNull()
    expect(validateCloudinaryFolderName("../private")).toContain("invalide")
    expect(validateCloudinaryFolderName("bibajilbab//produits")).toContain("invalide")
  })
})
