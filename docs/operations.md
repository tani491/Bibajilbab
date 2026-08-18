# Exploitation quotidienne

## Produits

1. Creer le produit en brouillon.
2. Renseigner nom, slug, SKU unique, prix XOF, descriptions, categorie, collections, tags.
3. Ajouter des images Cloudinary avec textes alternatifs.
4. Definir tailles, couleurs et variantes.
5. Controler le stock par variante.
6. Previsualiser.
7. Publier uniquement quand les donnees sont reelles.
8. Depublier en repassant en brouillon si une information est incertaine.
9. Archiver les produits retires du catalogue.

Les suppressions sont reservees au role `admin`.

## Hero, logo et contenus

Les contenus generaux vivent dans Admin > Mini-CMS :

- hero ;
- sections d'accueil ;
- FAQ ;
- temoignages ;
- textes livraison, retours, tailles, legal ;
- reseaux sociaux et WhatsApp ;
- SEO global.

Les parametres critiques sont reserves au role `admin`.

## Demandes WhatsApp

Statuts :

- `draft`
- `whatsappInitiated`
- `toConfirm`
- `confirmed`
- `preparing`
- `shipped`
- `delivered`
- `cancelled`

Regles :

- ne pas stocker de conversation WhatsApp privee ;
- garder seulement les informations de demande necessaires ;
- reduire le stock uniquement au passage manuel en `confirmed` ;
- annuler une demande ne restaure pas automatiquement le stock : effectuer un ajustement si besoin.

## Stock

Les ajustements de stock sont audites. Une variante ne peut pas passer sous zero. Une variante a zero stock devient inactive.

## Sauvegarde

Firestore :

- export quotidien vers un bucket Cloud Storage ;
- test de restauration mensuel ;
- retention minimale 30 jours.

Cloudinary :

- conserver les originaux ;
- eviter les suppressions definitives sans sauvegarde ;
- documenter les Public IDs utilises par les contenus critiques.

## Incident

1. Desactiver temporairement la publication du contenu concerne.
2. Verifier les audit logs.
3. Corriger ou restaurer les donnees.
4. Si le probleme vient d'un deploiement, rollback Vercel.
5. Changer les secrets si une exposition est suspectee.
