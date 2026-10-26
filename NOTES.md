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
- **Boss final : Rune**
  - Quand les 12 cryptides sont dans la collection, Rune lance son défi (écran de victoire, ou bouton « Défi de Rune » sur l'accueil).
  - Sur la carte, elle s'enfuit deux fois avant de se laisser attraper, puis la capture se fait en AR en difficulté 4 (`ar-catsith.mp4`).
  - Une fois vaincue, elle est enregistrée dans la clé `cryptidsParc-boss`.
- **Sans GPS** (refus, pas de signal pendant 15 s, ou intérieur) : bouton 👣. On avance en touchant la carte.
- **Interface**
  - Polices (hébergées dans le dépôt) : Creepster, la police dégoulinante, pour les gros titres et les noms des créatures ; IM Fell English SC pour tout le reste.
  - Couleur d'accent (`--citrouille`, ex-orange) : vert lumineux `#00ffcc`.
  - Les spirales des boutons et les silhouettes du fond sont retirées, ainsi que l'estimation de durée.
  - Volume général : le bouton ♪ ouvre un curseur.
  - Picto « livre ouvert » pour le grimoire.
- **Contenu**
  - Nouveau texte de Rune.
  - Lutins du grimoire refaits sans halo.
  - Nouvelles figurines du Thunderbird, du Barghest et du Jackalope ; Huhuk agrandi (`ECH_FIG`).

## Habitats des créatures (mode extérieur)

- Une fois la carte OSM chargée, chaque créature tirée au hasard est déplacée dans l'habitat que décrit son indice (table `HABITAT`, fonction `habiter`) : Michmuche sous un lampadaire (`highway=street_lamp`), Ness et Bloop au bord de l'eau, Huhuk dans les grands espaces, Whitby sous les arbres, Loupiote et Migou sur les chemins, les lutins dans les buissons, Bucky dans l'herbe, Ardoise et Moca près des maisons, Gadoo près de l'eau ou sous les arbres.
- Les indices du grimoire (14/10/2026) ont été réécrits pour des enfants de 10 ans, et pour marcher en ville comme à la campagne.
- Le terrain est lu dans une grille d'une case par mètre (`PXC.grille`), prise sur la carte pixel art déjà dessinée. Une créature n'est jamais posée dans l'eau, dans un bâtiment, sur une route ou un parking (`INTERDIT`).
- **Sans traverser de rue** : les créatures restent dans la zone qu'on rejoint à pied depuis le point de départ sans traverser de route, d'eau ni de bâtiment (`zoneSure`, parcours de la grille case par case). Si le GPS place le joueur sur la chaussée, la zone part du trottoir le plus proche. Rune (boss) suit la même règle quand il s'enfuit.
- Si aucune case ne correspond, la créature va sur n'importe quelle case accessible. Sans carte OSM (réseau, Overpass), on garde le tirage au hasard.
- Les créatures posées par un parent ne bougent pas. Le mode intérieur n'est pas concerné.

## Style de la carte (14/10/2026)

- Nouveau style inspiré des images de référence de Sam : herbe vive, contours sombres, arbres ronds et bosselés éclairés en haut à gauche, bâtiments de trois quarts (toit coloré à rangées de tuiles, façade avec fenêtres éclairées, ombre portée), rive rocheuse autour de l'eau, rues sombres avec trottoirs et pointillés, lampadaires, touffes d'herbe et fleurs.
- 4 pixels par mètre (6 en intérieur) au lieu de 2 (3), avec un zoom deux fois plus petit : même échelle à l'écran, plus de détails.
- Toutes les couleurs sont dans `PAL` (la carte est ramenée à cette palette). Les familles de toits sont dans `TOITS`. Les arbres semés ne tombent plus sur les toits, les routes ni l'eau.

## Assets dessinés par Sam (14/10/2026)

- Les images générées par Sam sont préparées par `python3 sources/assets.py <dossier des images>` (nécessite Pillow, numpy, scipy). Le script détoure les planches (faux damier ou fond noir), découpe les cases, rend les textures sans couture et met tout à 6 pixels par mètre dans `carte/` : `tex-*.png` (sols, chemins de terre, gravier, asphalte, eau, quatre toits), `fac-*.png` (façades), `spr-*.png` (arbres, maisons, immeubles, mobilier, eau, Halloween) et `sprites.json`. Le script repère chaque image d'origine par le début de son nom de fichier tel qu'il a été envoyé (par exemple `07f291bc` pour la planche d'arbres).
- La carte est d'abord dessinée par le code (`dessinerCarteCode`) : elle sert à lire le terrain pour les habitats, et d'image de secours. Quand les assets sont chargés (`chargerAssets`), `dessinerAvecAssets` la redessine avec les textures et les sprites.
- Bâtiments : église, école et supermarché d'après les étiquettes OSM ; une maison pour les petits bâtiments à peu près rectangulaires (moins de 20 m) ; un immeuble ou un commerce jusqu'à 40 m ; sinon toit et façade en textures. Une citrouille devant presque une maison sur deux.
- Mobilier OSM dessiné : bancs, poubelles, boîtes aux lettres, bornes à incendie, arrêts de bus, feux, stops, vélos, cabines, fontaines, statues, lampadaires.
- 6 pixels par mètre (12 en intérieur), sans zoom : même échelle à l'écran qu'avant.

## Tout le reste vient de la V1 (état au 12/10/2026)

- **Contenu** : 12 traques et 13 créatures. Kumquat et Kiwi, les lutins, forment une seule traque. Rune, la Cat sìth, est la guide.
- **Parcours** :
  - écran d'entrée (pour la musique), puis l'accueil avec l'animation 3 de Rune ;
  - à chaque « Commencer l'aventure » : l'intro de Rune (texte sans voix ; Rune est centrée sous la bulle), puis le choix des créatures.
- **Œil magique** :
  - three.js 0.169 ; chaque créature est un plan qui joue une vidéo, couleur en haut et transparence en bas (`ar-*.mp4`) ;
  - gyroscope, avec attente de la première mesure avant de placer la créature ;
  - sans capteurs de mouvement, on regarde autour de soi en glissant le doigt ;
  - toutes les créatures ont la même taille apparente et apparaissent à 3,2 m ;
  - sceau magique, cris, flèches.
- **Grimoire et figurines** : grimoire en animations 2D, relâche en vidéo, figurines 360° (`figurine-*.glb`), remerciement de Rune.
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
