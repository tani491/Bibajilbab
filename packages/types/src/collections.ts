export const firestoreCollections = {
  products: "products",
  categories: "categories",
  collections: "collections",
  siteSettings: "siteSettings",
  homepageSections: "homepageSections",
  media: "media",
  testimonials: "testimonials",
  faqs: "faqs",
  orderRequests: "orderRequests",
  inventoryMovements: "inventoryMovements",
  adminUsers: "adminUsers",
  auditLogs: "auditLogs",
  analyticsEvents: "analyticsEvents",
} as const

export type FirestoreCollectionName =
  (typeof firestoreCollections)[keyof typeof firestoreCollections]
