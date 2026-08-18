export type CsvCell = string | number | boolean | null | undefined
export type CsvRow = Record<string, CsvCell>

function escapeCsvCell(value: CsvCell): string {
  const normalized = value === null || value === undefined ? "" : String(value)

  if (/[",\n\r]/u.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

export function toCsv(rows: CsvRow[], headers: string[]): string {
  const headerLine = headers.map(escapeCsvCell).join(",")
  const body = rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(","))

  return [headerLine, ...body].join("\n")
}

export function parseSimpleCsv(input: string, maxRows = 200): CsvRow[] {
  const lines = input
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return []
  }

  if (lines.length - 1 > maxRows) {
    throw new Error(`Import limité à ${maxRows} lignes.`)
  }

  const headers = lines[0]?.split(",").map((header) => header.trim()) ?? []

  if (headers.length === 0 || headers.some((header) => header.length === 0)) {
    throw new Error("Le CSV doit contenir une ligne d'en-têtes valide.")
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim())
    const row: CsvRow = {}

    headers.forEach((header, index) => {
      row[header] = values[index] ?? ""
    })

    return row
  })
}
