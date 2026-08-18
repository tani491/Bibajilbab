# Guide Firebase

## Services utilises

- Firebase Authentication : connexion e-mail/mot de passe pour l'administration.
- Cloud Firestore : catalogue, contenus, demandes WhatsApp, stock, audit.
- Firebase Admin SDK : verification serveur des sessions, custom claims et mutations protegees.
- Firebase Emulator Suite : developpement local Auth + Firestore.

## Variables

Variables publiques Web App :

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` si App Check est active.

Variables serveur :

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Ne jamais prefixer les variables Admin avec `NEXT_PUBLIC_`.

## Authentication

1. Activer Email/Password dans Firebase Authentication.
2. Ajouter les domaines autorises :
   - `localhost`
   - domaine preview Vercel si utilise
   - `bibajilbab.com`
   - `admin.bibajilbab.com`
3. Ne pas activer d'inscription publique dans l'interface.
4. Creer le premier administrateur avec `pnpm admin:create-first`.

## Premier administrateur

Renseigner :

```bash
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_DISPLAY_NAME=BibaJilbab Admin
```

Puis lancer :

```bash
pnpm admin:create-first
```

Le script cree ou reutilise l'utilisateur Firebase, pose `adminRole=admin`, ecrit `adminUsers/{uid}` et affiche un lien de reinitialisation. Transmettre ce lien par un canal prive.

## Roles

- `admin` : acces complet, utilisateurs, parametres critiques, suppression.
- `editor` : produits, medias, categories, contenus, demandes, inventaire.

Les roles sont controles cote serveur et dans `firestore.rules`.

## Firestore

Deployer les regles et index :

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Les regles refusent tout par defaut. Les lectures publiques sont limitees aux documents publies ou aux settings publics.

## App Check

App Check est compatible avec le projet mais necessite une cle reCAPTCHA Enterprise ou reCAPTCHA v3 creee dans Firebase. Tant que `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` est vide, App Check n'est pas active dans le code client.

Avant activation production :

1. Creer la cle App Check pour `bibajilbab.com` et `admin.bibajilbab.com`.
2. Ajouter `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`.
3. Installer et brancher le SDK App Check dans les clients Firebase.
4. Activer d'abord le mode observation Firebase, puis enforcement apres verification.

## Sauvegarde et restauration

Export Firestore :

```bash
gcloud firestore export gs://<bucket-backup>/bibajilbab/$(date +%Y-%m-%d)
```

Import Firestore :

```bash
gcloud firestore import gs://<bucket-backup>/bibajilbab/<date>
```

Plan recommande : sauvegarde quotidienne, conservation 30 jours, test de restauration mensuel sur un projet Firebase de test.
