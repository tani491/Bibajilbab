# Guide Cloudinary

## Variables

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` : public, utilisable dans le navigateur.
- `CLOUDINARY_API_KEY` : serveur uniquement.
- `CLOUDINARY_API_SECRET` : serveur uniquement.
- `CLOUDINARY_UPLOAD_FOLDER=bibajilbab`

## Uploads admin

L'administration utilise une route serveur protegee :

- session Firebase Admin obligatoire ;
- role `admin` ou `editor` ;
- verification d'origine CSRF ;
- rate limit ;
- types MIME acceptes : AVIF, JPG, PNG, WebP ;
- taille maximale : 5 Mo par image ;
- maximum 10 images par envoi ;
- audit log apres upload.

La route de signature `/api/cloudinary/signature` reste disponible pour un flux signe, mais l'interface admin utilise `/api/cloudinary/upload` afin de controler MIME et taille cote serveur.

## Reglages recommandes Cloudinary

- Creer un dossier `bibajilbab`.
- Interdire les formats non-images pour les presets utilises.
- Definir une limite de taille proche de 5 Mo.
- Utiliser des transformations responsives en production.
- Garder les originaux pour restauration.
- Ne jamais exposer `CLOUDINARY_API_SECRET`.

## Gestion quotidienne

1. Uploader les images depuis Admin > Medias.
2. Renseigner un texte alternatif descriptif.
3. Declarer l'usage : `hero`, `produit`, `categorie`, `collection`.
4. Utiliser le Public ID dans les produits ou contenus.
5. Remplacer une image en creant un nouveau media, puis mettre a jour les documents qui l'utilisent.
