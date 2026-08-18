# Checklist avant mise en production

## Technique

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm audit:deps`

## Donnees

- Produits reels charges.
- Images Cloudinary reelles.
- Textes alternatifs renseignes.
- Prix XOF verifies.
- Stock par variante verifie.
- Brouillons invisibles publiquement.
- Produits publies visibles publiquement.
- Slugs valides et sans accents.
- Redirections de slugs preparees si migration.

## Services

- Firebase Auth configure.
- Firestore rules deployees.
- Firestore indexes deployes.
- Firebase Authorized Domains renseignes.
- Cloudinary configure.
- Premier administrateur cree.
- Compte editeur teste.
- Vercel storefront lie au domaine `bibajilbab.com`.
- Vercel admin lie au domaine `admin.bibajilbab.com`.

## Verification metier

- WhatsApp ouvre le bon numero `221770825302`.
- Message WhatsApp contient produits, variantes, quantites et total estimatif.
- Aucun paiement en ligne affiche.
- Administration absente de la navigation boutique.
- Demandes WhatsApp ne stockent pas de conversation privee.

## Go / No-Go

Ne pas ouvrir au public si :

- secrets manquants ;
- admin non testee avec un vrai compte Firebase ;
- Firestore rules non deployees ;
- produits demo encore visibles comme contenus definitifs ;
- audit dependances signale une vulnerabilite exploitable non acceptee.
