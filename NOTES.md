# Cryptids · Parc — notes pour reprendre le projet

Ce dépôt contient la **seconde version** de l'app Cryptids, une chasse aux créatures en réalité augmentée sur iPhone pour Halloween (de 5 à 40 ans).
La version 1 est dans le dépôt `carrioncrow494/chasse-monstres` et n'est pas modifiée par celui-ci.

- Version 1 : https://carrioncrow494.github.io/chasse-monstres/
- Version 2 (ce dépôt) : https://carrioncrow494.github.io/cryptids-parc/

## Ce qui change dans la V2

- **« Préparer le sauvetage » → « Dans un parc · carte »**
  - Le parent pose lui-même chaque créature sur une carte OpenStreetMap (Leaflet 1.9.4) en touchant la carte.
  - Il choisit la créature dans la bande du bas ; on peut déplacer un marqueur en le faisant glisser.
  - Boutons « Retirer », « Tout effacer » et « Ma position ».
  - Un avertissement s'affiche si deux créatures sont à moins de 15 m l'une de l'autre.
  - Positions enregistrées sur le téléphone : clé localStorage `cryptidsParc-lieux` = `{ "1": [lat, lon], … }`.
- **Nouvelle aventure en mode parc**
  - La partie se compose des créatures placées sur la carte.
  - Pas de tirage au hasard ni de cases à cocher : bloc « Cachés dans le parc ».
- **Chasse**
  - Une carte sombre affiche le joueur (point bleu et cercle de précision GPS).
  - Chaque créature restante apparaît comme une **brume** de 12 m de rayon, décalée de 2 à 7 m de la vraie cachette (`partie.brume`).
  - Les créatures déjà sauvées s'affichent sur la carte.
  - Quand le joueur arrive à moins de max(6 m, min(12 m, 0,8 × précision GPS)) d'une cachette, la carte se ferme et l'AR démarre. La créature est placée dans la direction de la cachette si la boussole est disponible.
  - Après la capture, « Continuer » ramène à la carte.
- **Sauvegarde séparée de la V1**
  - Toutes les clés sont `cryptidsParc-…`, alors que la V1 utilise `cryptids-…`.
  - Les deux sites ont la même origine github.io : sans ce préfixe, leurs sauvegardes se mélangeraient.

## Tout le reste vient de la V1 (état au 12/10/2026)

- **Contenu** : 12 traques et 13 créatures. Kumquat et Kiwi, les lutins, forment une seule traque. Sporran le Cat sìth est le guide.
- **Parcours** :
  - écran d'entrée (pour la musique), puis l'accueil avec l'animation 3 de Sporran ;
  - à chaque « Commencer l'aventure » : l'intro de Sporran (texte sans voix ; Sporran est centré sous la bulle), puis le choix des créatures.
- **Œil magique** :
  - three.js 0.169 ; chaque créature est un plan qui joue une vidéo, couleur en haut et transparence en bas (`ar-*.mp4`) ;
  - gyroscope, avec attente de la première mesure avant de placer la créature ;
  - sans capteurs de mouvement, on regarde autour de soi en glissant le doigt ;
  - toutes les créatures ont la même taille apparente et apparaissent à 3,2 m ;
  - sceau magique, cris, flèches.
- **Grimoire et figurines** : grimoire en animations 2D, relâche en vidéo, figurines 360° (`figurine-*.glb`), remerciement de Sporran.
- **Son** : musique « Tim Burton » et bruitages fabriqués par code (Web Audio).

## Modifier l'app

Les sources sont dans `sources/` : `style.css`, `corps.html` et `app.js`.

```
python3 sources/assemble.py        # régénère index.html
```

Ensuite, on publie avec git : commit puis push sur `main`. GitHub Pages est servi depuis la branche `main`, à la racine.

## Points à vérifier sur le terrain (pas testables sans iPhone)

- Précision du GPS dans le parc : souvent 5 à 15 m sous les arbres. Le seuil de déclenchement s'adapte à la précision annoncée.
- Lisibilité de la carte sombre en plein jour.
- Réseau mobile nécessaire pour charger les tuiles de la carte.
- Tuiles OpenStreetMap : usage gratuit pour un petit volume, avec la mention « © OpenStreetMap » (affichée en bas de la carte).
