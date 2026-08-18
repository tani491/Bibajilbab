import { expect, test } from "@playwright/test"

const adminUrl = process.env.ADMIN_E2E_URL ?? "http://localhost:3001"

test("admin login page is private and has no signup path", async ({ page }) => {
  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" })

  await expect(page.getByRole("heading", { name: "BibaJilbab" })).toBeVisible()
  await expect(page.getByText("Aucun formulaire d'inscription public")).toBeVisible()
  await expect(page.getByText("Chargement...")).toBeHidden({ timeout: 30_000 })
  await expect(page.getByLabel("E-mail")).toBeVisible()
  await expect(page.getByLabel("Mot de passe")).toBeVisible()
  await expect(page.getByRole("link", { name: "Mot de passe oublié" })).toBeVisible()

  await expect(page.locator("main")).toHaveCSS("background-color", "rgb(255, 245, 248)")
  await expect(page.getByRole("button", { name: /Connexion/u })).toHaveCSS("border-radius", "8px")
})

test("protected admin routes redirect anonymous users to login", async ({ page }) => {
  await page.goto(`${adminUrl}/users`, { waitUntil: "domcontentloaded" })

  await expect(page).toHaveURL(/\/login\?next=(%2F|\/)users/u)
  await expect(page.getByText("Administration privée")).toBeVisible()
})
