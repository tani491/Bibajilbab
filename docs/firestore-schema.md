# Schema Firestore BibaJilbab

Ce document decrit les collections prevues pour la phase 1. Les types applicatifs et les validations Zod vivent dans `packages/types/src/schemas.ts`.

## Collections publiques en lecture

Les lectures publiques sont limitees par `firestore.rules` aux documents publies ou explicitement publics.

- `products` : catalogue produit, variantes, stock par variante, images Cloudinary et metadonnees SEO.
- `categories` : familles produit comme Djilbabs, Khimars, Tuniques et Vetements de priere.
- `collections` : collections permanentes ou saisonnieres, dont Tabaski et Korite.
- `siteSettings` : informations publiques de marque, WhatsApp et reseaux sociaux.
- `homepageSections` : sections publiables de la future page d'accueil.
- `media` : medias geres depuis Cloudinary.
- `testimonials` : avis publies.
- `faqs` : questions frequentes publiees.

## Collections privees

Ces collections sont reservees aux administrateurs. Les ecritures client publiques sont refusees.

- `orderRequests` : intentions de commande preparees pour WhatsApp, sans paiement en ligne.
- `inventoryMovements` : journal des mouvements de stock.
- `adminUsers` : profils et roles des administrateurs.
- `auditLogs` : traces des actions sensibles.
- `analyticsEvents` : evenements collectes cote serveur ou admin.

## Produit

Un document `products/{productId}` contient :

- `name`, `slug`, `sku`
- `shortDescription`, `longDescription`
- `price`, `oldPrice`, `currency: "XOF"`
- `categoryId`, `collectionIds`, `tags`
- `images[]` avec `url`, `cloudinaryPublicId`, `alt`, dimensions et ordre
- `sizes[]`, `colors[]`, `variants[]`
- `variants[].stock` pour le stock par variante
- `material`, `careInstructions`, `badge`, `featured`
- `status: "draft" | "published" | "archived"`
- `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImageUrl`
- `createdAt`, `updatedAt`

Le SKU unique sera garanti au niveau applicatif et, si necessaire, par une collection d'index dediee lors de la phase back-office.
