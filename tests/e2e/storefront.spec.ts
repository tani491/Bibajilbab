import { expect, test } from "@playwright/test"

const baseUrl = "http://localhost:3000"

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl)
  await page.evaluate(() => window.localStorage.clear())
})

test("persists favorites locally", async ({ page }) => {
  await page.goto(`${baseUrl}/catalogue`)
  await page
    .getByLabel(/Ajouter .* aux favoris/u)
    .first()
    .click()
  await expect(page.getByLabel(/Favoris, 1 article/u)).toBeVisible()

  await page.reload()
  await expect(page.getByLabel(/Favoris, 1 article/u)).toBeVisible()

  await page.goto(`${baseUrl}/favoris`)
  await expect(page.getByRole("link", { name: /Djilbab premium poudre/u })).toBeVisible()
})

test("moves a product from product page to cart and prepares WhatsApp request", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/produits/djilbab-premium-poudre`)
  await page.getByRole("button", { name: "M", exact: true }).click()
  await page.getByRole("button", { name: "Rose poudré", exact: true }).click()
  await page.getByRole("button", { name: /Ajouter au panier/u }).click()
  await expect(page.getByText("Produit ajouté au panier")).toBeVisible()

  await page.goto(`${baseUrl}/panier`)
  await expect(page.getByRole("link", { name: /Djilbab premium poudre/u })).toBeVisible()
  await page.getByLabel("Nom").fill("Awa")
  await page.getByLabel("Téléphone").fill("770000000")
  await page.getByLabel("Ville ou zone de livraison").fill("Dakar")
  await page.getByLabel("Note facultative").fill("Après appel")

  await page.route("https://wa.me/**", (route) => route.abort())
  const requestPromise = page.waitForRequest(/https:\/\/wa\.me\/221770825302/u)
  await page.getByRole("button", { name: /Finaliser la commande sur WhatsApp/u }).click()
  const request = await requestPromise
  const text = new URL(request.url()).searchParams.get("text") ?? ""

  expect(text).toContain("Bonjour BibaJilbab, je souhaite commander")
  expect(text).toContain("Djilbab premium poudre")
  expect(text).toContain("Total estimatif")
  expect(text).toContain("Dakar")
})
