# Checklist de securite

## Secrets

- Aucun secret dans le depot.
- `.env.local` non committe.
- `FIREBASE_ADMIN_PRIVATE_KEY` serveur uniquement.
- `CLOUDINARY_API_SECRET` serveur uniquement.
- Aucune variable sensible en `NEXT_PUBLIC_`.

## Authentification

- Firebase Email/Password active.
- Pas d'inscription publique.
- Premier admin cree avec `pnpm admin:create-first`.
- Mode admin simule desactive hors local : `ADMIN_MOCK_AUTH=false` et `NEXT_PUBLIC_ENABLE_DEMO_ADMIN=false` en production.
- Custom claims `adminRole=admin|editor`.
- Protection du dernier administrateur actif.
- Logout disponible.

## Autorisation

- Mutations serveur avec `requireAdminSession`.
- Role `editor` limite.
- Parametres et utilisateurs reserves a `admin`.
- Firestore refuse tout par defaut.
- Lecture publique seulement pour les contenus publies.

## Web

- CSP active.
- `X-Frame-Options=DENY`.
- `X-Content-Type-Options=nosniff`.
- `Referrer-Policy=strict-origin-when-cross-origin`.
- `Permissions-Policy` restrictive.
- HSTS prepare.
- Admin en `noindex`.
- CSRF par verification d'origine sur mutations admin et APIs sensibles.
- Rate limit connexion et uploads.
- Upload images : MIME et taille controles.
- JSON-LD echappe pour eviter la fermeture de balise script.

## Reste a faire avant ouverture

- Activer App Check apres creation de la cle Firebase.
- Configurer monitoring et alertes Vercel/Firebase.
- Executer `pnpm audit:deps` et traiter les vulnerabilites exploitables.
- Faire une revue humaine des regles Firestore sur le projet Firebase reel.
