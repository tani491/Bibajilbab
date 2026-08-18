export const brandConfig = {
  name: "BibaJilbab",
  slogan: "Chaque religion a sa propre morale, et la morale de l'Islam, c'est la pudeur.",
  currency: "XOF",
  locale: "fr-SN",
  whatsapp: {
    display: "+221 77 082 53 02",
    technical: "221770825302",
  },
} as const

export type BrandConfig = typeof brandConfig

export function formatXof(amount: number): string {
  return new Intl.NumberFormat(brandConfig.locale, {
    style: "currency",
    currency: brandConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
