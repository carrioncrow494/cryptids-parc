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
- **Chasse** : la carte Leaflet à brumes de la V2 a été remplacée par la carte pixel art et le détecteur (voir ci-dessous). Leaflet ne sert plus qu'aux parents pour placer les créatures.
- **Sauvegarde séparée de la V1**
  - Toutes les clés sont `cryptidsParc-…`, alors que la V1 utilise `cryptids-…`.
  - Les deux sites ont la même origine github.io : sans ce préfixe, leurs sauvegardes se mélangeraient.

## Nouveautés du 13/10/2026 (V3 de la chasse)

- **Nouvelle chasse (modes intérieur et extérieur)**
  - Une carte en **pixel art** des vrais alentours s'affiche d'abord. Elle est dessinée à partir d'OpenStreetMap (requête Overpass, `chargerOSM`) : bâtiments, routes, chemins, eau, parcs, bois, arbres, haies.
  - La palette est réduite (`PAL`) pour garder des pixels nets.
  - Le joueur est un petit enfant encapuchonné avec une lanterne. La flèche cyan autour de lui indique la boussole.
  - Les créatures sont placées au hasard à moins de **10 m** (intérieur) ou **20 m** (extérieur) du point de départ. En extérieur, celles qu'un parent a posées sur la carte du parc gardent leur place. Les positions sont dans `partie.pos`, le point de départ dans `partie.origine`.
- **Détecteur EMF**
  - 5 LED (rouge = loin → jaune → vert = tout près), avec un bip de plus en plus rapide.
  - Les paliers sont proportionnels au rayon de jeu.
- **Apparition sur la carte**
  - Près de la cachette, l'animation pixel art de la créature apparaît (`pix-<cle>.gif`) et bondit régulièrement. Plus la créature est difficile, plus elle bondit souvent (`SAUT`).
  - Il faut la toucher : l'œil magique AR s'ouvre alors et la créature se cache derrière le joueur.
- **Capture AR avec jauge**
  - On tapote la créature (ou le sceau, en visant) pour remplir la jauge. La jauge se vide doucement (`GAIN`, `DRAIN`).
  - Selon la difficulté (1 à 4 étoiles, table `DIFF`), la créature s'échappe à certains niveaux de jauge (`ESQUIVES`) ; des flèches aident à la retrouver.
- **Boss final : Sporran**
  - Quand les 12 cryptides sont dans la collection, Sporran lance son défi (écran de victoire, ou bouton « Défi de Sporran » sur l'accueil).
  - Sur la carte, il s'enfuit deux fois avant de se laisser attraper, puis la capture se fait en AR en difficulté 4 (`ar-catsith.mp4`).
  - Une fois vaincu, il est enregistré dans la clé `cryptidsParc-boss`.
- **Sans GPS** (refus, pas de signal pendant 15 s, ou intérieur) : bouton 👣. On avance en touchant la carte.
- **Interface**
  - Polices (hébergées dans le dépôt) : Creepster, la police dégoulinante, pour les gros titres et les noms des créatures ; IM Fell English SC pour tout le reste.
  - Couleur d'accent (`--citrouille`, ex-orange) : vert lumineux de la queue de Sporran `#6ef0a4`.
  - Les spirales des boutons et les silhouettes du fond sont retirées, ainsi que l'estimation de durée.
  - Volume général : le bouton ♪ ouvre un curseur.
  - Picto « livre ouvert » pour le grimoire.
- **Contenu**
  - Nouveau texte de Sporran.
  - Lutins du grimoire refaits sans halo.
  - Nouvelles figurines du Thunderbird, du Barghest et du Jackalope ; Huhuk agrandi (`ECH_FIG`).

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

- Précision du GPS : souvent 5 à 15 m sous les arbres, et bien pire à l'intérieur d'une maison (d'où le bouton 👣). Le seuil d'apparition s'adapte à la précision annoncée.
- Overpass (données de la carte) : service public gratuit, parfois lent ou saturé. Sans réponse, la carte reste en herbe et le détecteur fonctionne quand même.
- Lisibilité de la carte sombre en plein jour.
- Réseau mobile nécessaire pour charger les tuiles de la carte.
- Tuiles OpenStreetMap : usage gratuit pour un petit volume, avec la mention « © OpenStreetMap » (affichée en bas de la carte).
