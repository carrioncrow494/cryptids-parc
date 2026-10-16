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
  - Couleur d'accent (`--citrouille`, ex-orange) : vert lumineux `#00ffcc`.
  - Les spirales des boutons et les silhouettes du fond sont retirées, ainsi que l'estimation de durée.
  - Volume général : le bouton ♪ ouvre un curseur.
  - Picto « livre ouvert » pour le grimoire.
- **Contenu**
  - Nouveau texte de Sporran.
  - Lutins du grimoire refaits sans halo.
  - Nouvelles figurines du Thunderbird, du Barghest et du Jackalope ; Huhuk agrandi (`ECH_FIG`).

## Choisir son aventure (15/10/2026)

- Le bouton de l'accueil « Préparer le sauvetage » devient **« Choisir son aventure »**. L'écran propose deux onglets :
  - **Aventure réelle** : QR codes à imprimer (mode `qr`), ou géolocalisation en extérieur avec placement des créatures sur la carte du parc (mode `exterieur`). Le choix « intérieur » n'apparaît plus dans le menu, mais son code est gardé (mode `interieur`).
  - **Aventure virtuelle** : le jeu vidéo (mode `virtuel`).
- **Le jeu vidéo** (`sources/jeu.js`, ajouté à la suite d'`app.js` par `assemble.py`) :
  - vue en 3D isométrique façon Dofus (three.js, caméra orthographique), formes rondes et douces, couleurs de forêt de pins au crépuscule (`COUL`). La map est un petit diorama construit à partir de la grille (`dioramaJ`) ; les objets immobiles sont fondus par couleur (`fusionnerJ`) pour alléger le rendu sur téléphone ;
  - joystick tactile : la vue est en biais, donc les 4 directions de marche sont les 4 diagonales de l'écran, et le joystick prend la plus proche (avec un peu de marge pour ne pas changer de direction au moindre tremblement). Bouton A (chercher, lire un panneau, ouvrir l'œil magique) et bouton B (s'éloigner, fermer) ; au clavier : flèches ou ZQSD, Espace et Échap ;
  - **une seule île** de 44 × 40 cases (`CARTE`), découpée en 6 régions (`ZONES`) séparées par des frontières fermées (arbres, rochers, falaises rouges au désert) ; on passe de l'une à l'autre par 9 passages marqués d'une arche en bois (tuile `p`), à la demande de Sam (15/10/2026). Le village est au centre (départ), entouré de : la forêt Sombre (nuit, rivière, pont couvert rouge façon Oregon, lampadaires, cimetière), les Hautes-Terres (lande de bruyère, grand lac, pierres levées, neiges et montagnes au nord), le bayou (eaux boueuses, cyprès, passerelles, lucioles), le désert des Mesas (sable orange, mesas, cactus, ranch) et le bois Biscornu (arbres d'automne, citrouilles, la cabane de travers de Sporran, un dessin original) ;
  - la lumière glisse d'une région à l'autre (`AMB`) ; 4 lumières seulement suivent les lampadaires les plus proches, pour ménager le téléphone ; les objets immobiles sont fondus par couleur et par morceau de l'île ;
  - la grille est une suite de lettres (légende sous `TUILES`) : pour une carte de Sam, un plan dessiné suffit. Le plan actuel a été produit par un petit script puis retouché ;
  - chaque créature se cache dans sa région (`HABITAT`, choix de Sam du 15/10/2026), au meilleur endroit (`scoreJ`) : barghest et mothman dans la forêt Sombre, Nessie, le Kraken et le Yeti dans les Hautes-Terres, le monstre des marais et la faery au bayou, la gargouille et les lutins au village, le chupacabra, le thunderbird et le jackalope au désert. Positions dans `partie.jeu` (`v: 2` ; une partie de l'ancien jeu à 4 maps repart du village) ;
  - orientation Dofus / Zelda pour les 5 à 10 ans, plus Pokémon (Sam, 15/10/2026) : plus de rencontre invisible au hasard. Chaque créature se cache dans une **cachette visible** (un buisson aux couleurs de sa région, un tas de neige, des roseaux) qui frémit quand on approche, avec deux yeux qui brillent par moments. On se met devant et on appuie sur A pour fouiller, puis A encore pour ouvrir l'œil magique. Les cachettes ne sont jamais sur un chemin (on ne peut pas les traverser) ;
  - **un habitant par région** (`PNJ` : le maire Pistache, Lumignon le veilleur, Bergère Mousse, Papy Coyote, Tante Grenouille) : on lui parle avec A, il donne les indices des cryptides de sa région. Il se tourne vers l'enfant qui approche ;
  - le détecteur (5 LED) donne la distance à la créature la plus proche ; en entrant dans une région, son nom et le nombre de cryptides cachés s'affichent ; le panneau de chaque région donne les indices de ses créatures ;
  - tout près d'une cachette, la créature surgit (« ! ») ; le bouton A ouvre alors l'œil magique (RA, caméra), et la capture se fait comme dans les autres modes. Après « Continuer le sauvetage », on revient dans le jeu à la même place. La caméra et les capteurs sont demandés au moment de ce clic, car iOS l'exige ;
  - le défi de Sporran a lieu dans le bois Biscornu, autour de sa cabane : il s'enfuit deux fois dans le jeu, puis la capture se fait en RA.

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

### Images dessinées du jeu (15/10/2026)
- `jeu-heros.webp` : 6 colonnes (4 pas de marche, 2 images d'attente) × 4 lignes (bas, droite, haut, gauche). Depuis le 16/10, c'est le héros flat (voir plus bas) ; l'ancien héros dessiné est dans l'historique git.
- `jeu-detecteur.webp` : le détecteur éteint (à gauche) et allumé (à droite) ; les voyants sont découpés dans l'image allumée (`VOYANTS` dans jeu.js).
- Fabriqués depuis les planches de Sam sur fond vert avec `sources/decoupe.py` et `sources/detecteur.py` (chemins des images à adapter).
- `IMG_JEU` dans jeu.js : vide dans index.html. Pour test.html, on le remplace par l'adresse raw de la branche, pour ne pas ajouter d'images sur main.

### Jeu en flat design (16/10/2026)
- Le décor 3D en volumes est remplacé par les planches flat de Sam (`dioramaFlat` dans jeu.js). L'ancienne île (`dioramaVolumes`) revient seulement si les images ne se chargent pas.
- `jeu-sol.webp` : les 12 tuiles de sol, déroulées en carrés (4×3). Chaque case de la grille prend une tuile selon sa lettre et sa région (`sol` dans `dioramaFlat`, `SOL_ZONE`).
- `jeu-decor.webp` : tous les objets (nature, objets du village, marais/désert/cimetière, bâtiments, maisons, cachettes). Leur place est dans `sources/decor-atlas.js` (`ATLAS_DECOR`), leur hauteur dans `TAILLE_DECOR`. Chaque objet est une image debout face à la caméra ; les bâtiments couvrent tout leur bloc de cases. Un objet qui cache le héros devient transparent (`estomperJ`).
- La caméra est inclinée comme les dessins : le losange d'une tuile est 0,675 fois moins haut que large (`HAUT_CAM.flat`, `SIN_CAM`).
- Héros : `jeu-heros.webp` (marche et attente, 4 directions sans miroir) et `jeu-heros-actions.webp` (fouiller vers la gauche, vers la droite, surprise, joie ; images de 320×360). On fouille à chaque A, surprise quand un cryptide sort, joie au retour après une capture.
- Créatures : `jeu-crea-<clé>.webp`, 4×4 images de 256 (apparition, attente, action, disparition ; Sporran : attente, attente, disparition, réapparition). Elle sort de sa cachette au premier A, et disparaît si on fuit avec B.
- La nuit (forêt, cabane, bayou), tout le décor se teinte de bleu et les lampadaires brillent ; les cachettes restent claires.
- Fabriqués avec `sources/decoupe-flat.py` (héros), `sources/decoupe-creatures.py`, `sources/decoupe-decor.py` (outils communs dans `sources/planches.py` : fond vert ou magenta, un dessin = une tache, même s'il déborde de sa case).
- Les habitants sont encore en volumes, en attendant leurs planches.
- Nouveaux lieux (validés par Sam le 16/10) : X Excalibook, Q Chez Bergamotte, N Ninamoto, Y supérette, j jeux du parc (village, agrandi de 2 rangées vers le sud : la lisière et son passage sont en rangée 28, le bois Biscornu commence en rangée 29) ; W Chupa la sopa (désert, près de la route) ; F ferme (Hautes-Terres) ; C chalet en A (forêt). En attendant leurs planches, ils prennent une maison existante (`NOUVEAUX` dans `batimentsJ`). Plans des zones pour peindre le sol : `python3 sources/plans-zones.py <dossier>`.
- 16/10 fin d'après-midi : Nessie, Bloop et Gadoo (`AQUATIQUES`) se cachent dans l'eau, sur une case juste au bord d'une rive où l'on marche (`casesEau`) ; la cachette est un nénuphar (ou des roseaux au bayou). Correction : les images du décor étaient posées trop haut (le « pied » était à l'envers), d'où des bâtiments décalés derrière leurs cases. Détecteur agrandi (104 × 110).
- 16/10 après-midi (retours de Sam) : joystick moins sensible (zone morte de 17 %, on garde la direction tant que le pouce n'a pas tourné de plus de 60°, pas de 240 ms) ; créatures sur un cycle de 5,2 s (attente 450 ms par image, action 400 ms, arrivée et départ 1 s) avec un léger souffle entre les images ; on ne passe plus derrière un bâtiment là où son image cacherait le héros (`sousBatiment`, les chemins restent ouverts).
- Animations en douceur : chaque image se fond dans la suivante à la fin de son temps (`fonduImages`), la caméra rattrape le héros, les pas s'enchaînent sans temps mort, la créature sort avec un petit rebond et s'efface en partant. Tailles : héros 1,2 case (`TAILLE_HEROS`), créatures selon chacune (`TAILLE_CREA`), arbres et maisons agrandis pour rester plus grands que le héros.

### Choisir son aventure (16/10/2026)
- Deux choix seulement. **Aventure réelle** : explique les QR codes, bouton pour télécharger `qr-codes-cryptids.pdf`, puis « Commencer l'aventure réelle » (intro, choix des cryptides, QR codes à cacher). **Aventure virtuelle** : reprend la partie en cours, sinon passe directement au choix du nombre de cryptides (sans l'intro), puis le jeu vidéo.
- La géolocalisation est retirée de l'écran pour l'instant (demande de Sam) : `mode()` ramène les anciens réglages `exterieur`/`interieur` aux QR codes. Le code de la carte pixel art et du GPS reste en place pour plus tard.
