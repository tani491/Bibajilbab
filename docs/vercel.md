# Guide Vercel

Deux projets Vercel separes sont prevus.

## Projet boutique

- Nom recommande : `bibajilbab-storefront`
- Root Directory : `apps/storefront`
- Domaine production : `bibajilbab.com`
- Install Command : `cd ../.. && pnpm install --frozen-lockfile`
- Build Command : `cd ../.. && pnpm build:storefront`
- Output Directory : `.next`

## Projet administration

- Nom recommande : `bibajilbab-admin`
- Root Directory : `apps/admin`
- Domaine production : `admin.bibajilbab.com`
- Install Command : `cd ../.. && pnpm install --frozen-lockfile`
- Build Command : `cd ../.. && pnpm build:admin`
- Output Directory : `.next`

## Variables Vercel

Configurer les memes variables dans les deux projets, sauf si une variable n'est utile qu'a l'admin.

Production :

- `APP_ENV=production`
- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://bibajilbab.com`
- `NEXT_PUBLIC_STOREFRONT_URL=https://bibajilbab.com`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.bibajilbab.com`
- `NEXT_PUBLIC_WHATSAPP_NUMBER=221770825302`
- `NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/bibajilbab97/`
- `NEXT_PUBLIC_TIKTOK_URL=https://www.tiktok.com/@habibabibajilbaba`
- `NEXT_PUBLIC_ENABLE_DEMO_DATA=false`
- `NEXT_PUBLIC_ENABLE_DEMO_ADMIN=false`
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` si App Check est active.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `ADMIN_MOCK_AUTH=false`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER=bibajilbab`

Secrets a marquer sensibles dans Vercel :

- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CLOUDINARY_API_SECRET`
- tokens CI eventuels.

## Preview

Les previews Vercel doivent utiliser des donnees de test ou un projet Firebase de staging. Ne pas exposer les secrets production a toutes les branches sans raison.

## Production

Avant production :

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm audit:deps
```

Puis deployer via Git integration Vercel ou CLI.

## Rollback

Depuis Vercel :

1. Ouvrir le projet concerne.
2. Aller dans Deployments.
3. Choisir le dernier deploiement sain.
4. Utiliser Promote to Production ou Rollback.

Avec CLI :

```bash
vercel rollback
```

ou :

```bash
vercel promote <deployment-url-or-id>
```

## Domaines et Firebase

Ajouter dans Firebase Authentication :

- `bibajilbab.com`
- `admin.bibajilbab.com`
- domaines preview Vercel utilises pour tester la connexion.

Ne pas deployer tant que les variables Firebase, Cloudinary et domaines autorises ne sont pas renseignes.
