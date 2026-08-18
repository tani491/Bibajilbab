# BibaJilbab

Socle finalise du catalogue e-commerce BibaJilbab.

Le projet contient deux applications Next.js distinctes et des packages partages. Les commandes finales seront envoyees sur WhatsApp. Aucun paiement en ligne n'est integre.

## Architecture

- `apps/storefront` : boutique publique, port local `3000`, domaine prevu `https://bibajilbab.com`
- `apps/admin` : administration privee, port local `3001`, domaine prevu `https://admin.bibajilbab.com`
- `packages/ui` : composants UI partages
- `packages/types` : schemas Zod et types TypeScript partages
- `packages/config` : marque, URLs, env, erreurs, CORS, donnees locales de demonstration et preset Tailwind

L'administration n'apparait pas dans la navigation ou le footer de la boutique. Le sous-domaine n'est pas une securite : l'administration est separee, protegee par Firebase Authentication, des roles `admin` / `editor`, des controles serveur et des regles Firestore en refus par defaut.

## Prerequis

- Node.js `>=20.18.0`
- pnpm `11.19.0` ou compatible
- Optionnel : Firebase CLI pour les emulateurs, ou le script `pnpm dev:firebase`

## Developpement local

1. Installer les dependances :

```bash 
pnpm install
```

2. Creer les variables locales :

```bash
copy .env.example .env.local
```

3. Lancer les deux apps :

```bash
pnpm dev
```

4. Ou lancer une seule app :

```bash
pnpm dev:storefront
pnpm dev:admin
```

Ports locaux :

- Boutique : `http://localhost:3000`
- Administration : `http://localhost:3001`
- Firebase Auth Emulator : `127.0.0.1:9099`
- Firestore Emulator : `127.0.0.1:8080`
- Firebase Emulator UI : `http://127.0.0.1:4000`

## Variables locales

Les valeurs publiques peuvent etre vides en developpement si le mode demo est actif.

Variables importantes :

- `APP_ENV=development`
- `NEXT_PUBLIC_APP_ENV=development`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000`
- `NEXT_PUBLIC_ADMIN_URL=http://localhost:3001`
- `NEXT_PUBLIC_ENABLE_DEMO_DATA=true`
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`

Secrets a ne jamais committer :

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FIRST_ADMIN_EMAIL`

Le fichier `.gitignore` exclut `.env`, `.env.local`, `.env.*.local`, `.vercel`, les cles JSON Firebase et les tokens Vercel.

## Donnees de demonstration

En `development` et `test`, si Firebase ou Cloudinary ne sont pas configures, la boutique peut afficher des donnees locales explicitement marquees comme demonstration. Elles vivent dans `packages/config/src/demo-data`.

Le mode demo est force a `false` en production, meme si `NEXT_PUBLIC_ENABLE_DEMO_DATA=true` est defini par erreur.

## Firebase local

Lancer les emulateurs :

```bash
pnpm dev:firebase
```

Variables locales prevues :

- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`
- `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`
- `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
- `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`
- `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`

Les emulateurs ne sont jamais connectes en production. Les doubles connexions pendant le hot reload sont evitees par un garde global.

## Cloudinary local

Sans Cloudinary, les images locales dans `apps/storefront/public/demo` et l'image de remplacement `image-placeholder.svg` sont utilisees en developpement.

Avec Cloudinary configure :

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est public
- `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` restent serveur uniquement
- les uploads admin passent par une route serveur protegee
- les signatures d'upload restent disponibles cote serveur pour un flux signe ulterieur

## Scripts

```bash
pnpm dev              # storefront + admin
pnpm dev:storefront   # boutique sur 3000
pnpm dev:admin        # admin sur 3001
pnpm dev:firebase     # emulateurs Firebase Auth + Firestore
pnpm format           # Prettier write
pnpm format:check     # Prettier check
pnpm lint             # ESLint monorepo
pnpm typecheck        # TypeScript strict
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm audit:deps       # audit dependances pnpm
pnpm build            # build storefront + admin
pnpm build:storefront # build boutique
pnpm build:admin      # build admin
pnpm start            # next start pour les deux apps apres build
pnpm start:storefront # boutique buildée sur 3000
pnpm start:admin      # admin buildée sur 3001
pnpm admin:create-first # creation du premier compte admin Firebase
```

## Build de production local

```bash
pnpm build
pnpm start:storefront
pnpm start:admin
```

Verifier ensuite :

- `http://localhost:3000`
- `http://localhost:3001`

Les builds production utilisent `NODE_ENV=production` via Next.js. Ne pas forcer `NODE_ENV` manuellement avec une valeur non supportee.

## Production

Deux projets Vercel separes sont prevus.

### Projet storefront

- Root Directory : `apps/storefront`
- Domaine : `bibajilbab.com`
- Install Command : `cd ../.. && pnpm install --frozen-lockfile`
- Build Command : `cd ../.. && pnpm build:storefront`
- Output Directory : `.next`

### Projet admin

- Root Directory : `apps/admin`
- Domaine : `admin.bibajilbab.com`
- Install Command : `cd ../.. && pnpm install --frozen-lockfile`
- Build Command : `cd ../.. && pnpm build:admin`
- Output Directory : `.next`

Les fichiers `apps/storefront/vercel.json` et `apps/admin/vercel.json` documentent ces commandes.

## Variables Vercel

Production storefront et admin :

- `APP_ENV=production`
- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://bibajilbab.com`
- `NEXT_PUBLIC_STOREFRONT_URL=https://bibajilbab.com`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.bibajilbab.com`
- `NEXT_PUBLIC_WHATSAPP_NUMBER=221770825302`
- `NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/bibajilbab97/`
- `NEXT_PUBLIC_TIKTOK_URL=https://www.tiktok.com/@habibabibajilbaba`
- `NEXT_PUBLIC_ENABLE_DEMO_DATA=false`
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER=bibajilbab`

Ne jamais prefixer `CLOUDINARY_API_SECRET` ou les variables Firebase Admin avec `NEXT_PUBLIC_`.

## Firebase Authorized Domains

Prevoir dans Firebase Authentication :

- `localhost`
- le domaine Vercel de preview si utilise
- `bibajilbab.com`
- `admin.bibajilbab.com`

## Regles de securite

- Firestore refuse tout par defaut.
- Lecture publique seulement pour les contenus publies ou les settings publics.
- Ecriture reservee aux roles autorises : `editor` pour la gestion quotidienne, `admin` pour les actions sensibles.
- Aucune mutation admin ne doit se fier au sous-domaine seul.
- Aucun CORS global permissif n'est active. Les utilitaires CORS centralisent les origines autorisees.
- Les mutations admin et APIs sensibles verifient l'origine de requete.
- Les uploads images admin controlent MIME, taille et dossier Cloudinary cote serveur.

## Documentation d'exploitation

- `docs/firebase.md` : configuration Firebase, roles, App Check, sauvegarde.
- `docs/cloudinary.md` : variables, uploads, limites et usages media.
- `docs/vercel.md` : projets, variables, preview, production et rollback.
- `docs/firestore-schema.md` : collections et regles de donnees.
- `docs/security-checklist.md` : controles securite avant ouverture.
- `docs/accessibility-checklist.md` : verification WCAG AA.
- `docs/production-checklist.md` : go / no-go production.
- `docs/operations.md` : exploitation quotidienne et incident.
- `docs/client-inputs.md` : informations restant a collecter.

## Depannage

- Page blanche locale : verifier `pnpm install`, relancer `pnpm dev`, puis regarder les messages de configuration affiches.
- Firebase absent : laisser le mode demo actif en local ou lancer `pnpm dev:firebase`.
- Cloudinary absent : les images locales de demonstration doivent rester visibles.
- Build Vercel monorepo : verifier que le Root Directory correspond a l'app et que les commandes `cd ../.. && pnpm build:*` sont utilisees.
- Erreur de cle privee Firebase : conserver les retours a la ligne encodes avec `\n` dans `FIREBASE_ADMIN_PRIVATE_KEY`.
- Variables tirees depuis Vercel : utiliser `.env.local` et ne jamais committer les fichiers `.local`.
