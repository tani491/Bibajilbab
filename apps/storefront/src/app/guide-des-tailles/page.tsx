import { InfoBlock, InfoPage } from "@/components/layout/info-page"
import { createPageMetadata, sizeGuideRows } from "@/lib/catalog"

export const metadata = createPageMetadata({
  title: "Guide des tailles",
  description: "Guide de tailles BibaJilbab à valider avec les mesures réelles des modèles.",
  path: "/guide-des-tailles",
})

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Guide"
      title="Guide des tailles"
      description="Base de guide à valider avec les mesures réelles de chaque modèle."
    >
      <InfoBlock title="Repères actuels">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-brand-ink">
              <tr>
                <th className="border-b border-brand-border py-3 pr-4">Taille</th>
                <th className="border-b border-brand-border py-3 pr-4">Coupe</th>
                <th className="border-b border-brand-border py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {sizeGuideRows.map((row) => (
                <tr key={row.size}>
                  <td className="border-b border-brand-border py-3 pr-4 font-medium text-brand-ink">
                    {row.size}
                  </td>
                  <td className="border-b border-brand-border py-3 pr-4">{row.fit}</td>
                  <td className="border-b border-brand-border py-3">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoBlock>
    </InfoPage>
  )
}
