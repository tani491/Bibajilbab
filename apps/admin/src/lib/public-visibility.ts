export interface PublishableRecord {
  status: "draft" | "published" | "archived"
}

export function isPubliclyVisible(record: PublishableRecord): boolean {
  return record.status === "published"
}

export function filterPubliclyVisible<T extends PublishableRecord>(records: T[]): T[] {
  return records.filter(isPubliclyVisible)
}
