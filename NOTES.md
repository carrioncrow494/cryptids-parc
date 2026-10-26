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

## Choisir son aventure (15/10/2026)

- Le bouton de l'accueil « Préparer le sauvetage » devient **« Choisir son aventure »**. L'écran propose deux onglets :
  - **Aventure réelle** : QR codes à imprimer (mode `qr`), ou géolocalisation en extérieur avec placement des créatures sur la carte du parc (mode `exterieur`). Le choix « intérieur » n'apparaît plus dans le menu, mais son code est gardé (mode `interieur`).
  - **Aventure virtuelle** : le jeu vidéo (mode `virtuel`).
- **Le jeu vidéo** (`sources/jeu.js`, ajouté à la suite d'`app.js` par `assemble.py`) :
  - vue en 3D isométrique façon Dofus (three.js, caméra orthographique), formes rondes et douces, couleurs de forêt de pins au crépuscule (`COUL`). La map est un petit diorama construit à partir de la grille (`dioramaJ`) ; les objets immobiles sont fondus par couleur (`fusionnerJ`) pour alléger le rendu sur téléphone ;
  - joystick tactile : la vue est en biais, donc les 4 directions de marche sont les 4 diagonales de l'écran, et le joystick prend la plus proche (avec un peu de marge pour ne pas changer de direction au moindre tremblement). Bouton A (chercher, lire un panneau, ouvrir l'œil magique) et bouton B (s'éloigner, fermer) ; au clavier : flèches ou ZQSD, Espace et Échap ;
  - **une seule île** de 44 × 40 cases (`CARTE`), découpée en 6 régions (`ZONES`) séparées par des frontières fermées (arbres, rochers, falaises rouges au désert) ; on passe de l'une à l'autre par 9 passages marqués d'une arche en bois (tuile `p`), à la demande de Sam (15/10/2026). Le village est au centre (départ), entouré de : la forêt Sombre (nuit, rivière, pont couvert rouge façon Oregon, lampadaires, cimetière), les Hautes-Terres (lande de bruyère, grand lac, pierres levées, neiges et montagnes au nord), le bayou (eaux boueuses, cyprès, passerelles, lucioles), le désert des Mesas (sable orange, mesas, cactus, ranch) et le bois Biscornu (arbres d'automne, citrouilles, la cabane de travers de Rune, un dessin original) ;
  - la lumière glisse d'une région à l'autre (`AMB`) ; 4 lumières seulement suivent les lampadaires les plus proches, pour ménager le téléphone ; les objets immobiles sont fondus par couleur et par morceau de l'île ;
  - la grille est une suite de lettres (légende sous `TUILES`) : pour une carte de Sam, un plan dessiné suffit. Le plan actuel a été produit par un petit script puis retouché ;
  - chaque créature se cache dans sa région (`HABITAT`, choix de Sam du 15/10/2026), au meilleur endroit (`scoreJ`) : barghest et mothman dans la forêt Sombre, Nessie, le Kraken et le Yeti dans les Hautes-Terres, le monstre des marais et la faery au bayou, la gargouille et les lutins au village, le chupacabra, le thunderbird et le jackalope au désert. Positions dans `partie.jeu` (`v: 2` ; une partie de l'ancien jeu à 4 maps repart du village) ;
  - orientation Dofus / Zelda pour les 5 à 10 ans, plus Pokémon (Sam, 15/10/2026) : plus de rencontre invisible au hasard. Chaque créature se cache dans une **cachette visible** (un buisson aux couleurs de sa région, un tas de neige, des roseaux) qui frémit quand on approche, avec deux yeux qui brillent par moments. On se met devant et on appuie sur A pour fouiller, puis A encore pour ouvrir l'œil magique. Les cachettes ne sont jamais sur un chemin (on ne peut pas les traverser) ;
  - **un habitant par région** (`PNJ` : le maire Pistache, Lumignon le veilleur, Bergère Mousse, Papy Coyote, Tante Grenouille) : on lui parle avec A, il donne les indices des cryptides de sa région. Il se tourne vers l'enfant qui approche ;
  - le détecteur (5 LED) donne la distance à la créature la plus proche ; en entrant dans une région, son nom et le nombre de cryptides cachés s'affichent ; le panneau de chaque région donne les indices de ses créatures ;
  - tout près d'une cachette, la créature surgit (« ! ») ; le bouton A ouvre alors l'œil magique (RA, caméra), et la capture se fait comme dans les autres modes. Après « Continuer le sauvetage », on revient dans le jeu à la même place. La caméra et les capteurs sont demandés au moment de ce clic, car iOS l'exige ;
  - le défi de Rune a lieu dans le bois Biscornu, autour de sa cabane : elle s'enfuit deux fois dans le jeu, puis la capture se fait en RA.

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
- Créatures : `jeu-crea-<clé>.webp`, 4×4 images de 256 (apparition, attente, action, disparition ; Rune : attente, attente, disparition, réapparition). Elle sort de sa cachette au premier A, et disparaît si on fuit avec B.
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
- Hors de l'île, l'écran du jeu montre le fond sombre de l'app (dégradé lagon → abysse sur .jeu-ecran, toile WebGL transparente), le jour comme la nuit.
- 16/10 (demande de Sam) : la forêt Sombre devient **la forêt du Lac** (forêt de jour façon Canada / Écosse : sapins, bouleaux, quelques érables, eau bleue). L'île gagne 12 rangées au sud (rangées 40 à 51, colonnes 0 à 24) : un grand lac avec un ponton, et le chalet en A (C) déplacé sur sa rive. Le caractère espace dans `CARTE` veut dire « hors de l'île » : pas de sol, et le bord de terre suit la côte. Le **bois Biscornu** devient plus sombre (nuit 1.4, sol sarcelle, arbres morts et sapins) avec des lueurs bioluminescentes turquoise, violettes et roses qui respirent (`lueurJ`).
- 16/10 au soir : tuiles de sol par zone tirées des 8 terrains peints par Sam (`sources/decoupe-sols.py` → `jeu-sols.webp`, une ligne par zone : sol, sol2, chemin, pavés, eau, planches, neige ; voir `SOLS_ZONE` et `SOLS`). Les terrains ont tous la même silhouette, ils ne collent pas aux zones : on n'en garde que les matières. Végétation par zone : `sources/decoupe-nature.py` → `jeu-nature.webp` (`arbreJ`).
- **16/10 au soir : les grandes cartes (choix de Sam, taille A).** Le monde est fait de 6 îles, une par zone, posées en croix (Hautes-Terres au nord, forêt du Lac à l'ouest, désert à l'est, bayou au sud, bois Biscornu au sud-ouest après la forêt) et reliées par des ponts de planches. Le sol de chaque île est le terrain entier peint par Sam (`jeu-ile-<zone>.webp`, posé à plat par `MONDE.iles`).
  - `sources/terrains.py` pose une grille sur chaque terrain (case de 48 px, losange 0,543) et devine le vide, le bord (`x`), l'eau et les rochers peints.
  - `sources/monde.py` assemble les îles, trace les ponts, pose les bâtiments, les arbres, les habitants et les panneaux, relie par des passerelles ce que l'eau coupe, et écrit `sources/monde.js` (`MONDE.carte`, `MONDE.zones`, `MONDE.pnj`).
  - La caméra a pris la pente des terrains (`SIN_CAM` .543, `HAUT_CAM.flat` 9,15) et voit 12 cases de large au lieu de 8,4 : le héros paraît plus petit.
  - Les anciennes parties (v3) repartent du village ; les créatures sauvées le restent.
  - Pour de nouveaux terrains : les copier dans les uploads, mettre leur nom dans `TERRAINS` (terrains.py), régler si besoin la couleur de l'eau (`eau`) et des rochers (`rocher`), puis `python3 sources/monde.py <dossier>` et `python3 sources/assemble.py`.
- Zoom : on pince l'écran à deux doigts (ou la molette) pour rapprocher la caméra (`ZOOM`, de 3,2 à 8 cases de demi-largeur, 5 au départ), et le choix est gardé (localStorage `cryptids-zoom`). Le zoom de la page par Safari est bloqué pendant le jeu.
- 17/10 : la zone du lac (« foret ») utilise la carte en cube de Sam (jeu-video/lac-essais/map-lac.png dans le dossier partagé). terrains.py (CUBES) redresse l'image sur trois coins du dessus pour retrouver l'angle du jeu, découpe seulement le losange du dessus en 54 × 54 cases, et rend marchable le pont de pierre. Les rochers peints ne reçoivent plus de rocher dessiné par-dessus (îles « peint » dans MONDE.iles). Le chalet va sur la terre battue, le cromlech dans le pré à gauche, le pont vers la cabane part du coin gauche.
- 17/10 (suite) : les planches L1, L2, L3 de Sam pour le lac (jeu-video/lac-essais/planche-L*.png) sont découpées par decoupe-nature.py dans jeu-nature.webp : chalet, atelier (I), statue du kelpie (Z, 4 × 4 cases d'eau au repère « statue »), menhirs (le cromlech), les 8 arbres et 4 plantes de la forêt (foret_a*, foret_p*, la bruyère et les ajoncs sur les « , »), et les objets lac_* (O : rocher, souche, bûches, cairn ; v barque ; J banc ; panneau et lanterne du lac).
- 17/10 : plus de ponts entre les îles. Au bout des chemins, un portail (g, MONDE.portails) mène à l'île voisine ; on y choisit aussi « Retour au village » (devant la cathédrale). Sur une carte peinte, le portail va au repère vers_<île> (bout du chemin peint). On ouvre le choix en marchant dans le portail ou avec A.
- 17/10 : le lac utilise maintenant lac-carcajou-upscale.jpg (5420 × 4644, agrandie et recolorée par Sam) ; terrains.py la redresse à 3980 px de large au plus (limite des textures sur iPhone), soit 36 px par demi-case contre 24 sur les autres îles. La statue du kelpie se pose sur la case d'eau la plus loin des rives.
- 17/10 : le bateau de pêche (planche L4 de Sam, bateau_<direction> dans jeu-nature.webp) est amarré en MONDE.bateau. On monte en marchant dedans ou avec A ; on navigue sur l'eau ; on descend en poussant vers la rive, et il reste là (sauvé dans la partie). Le kraken se cache au large : à plus de 2 cases de toute rive et à 12 cases au moins de l'amarre.
- 17/10 (fin) : chalet et atelier posés d'un seul motif (côte à côte) ; 6 menhirs découpés pierre par pierre (`pierres()` dans decoupe-nature.py, L1 bis + case bas-droite de la L1) ; portails : l'arche suit le sens d'arrivée, A les ouvre à 2 cases ; un bateau sauvé hors de l'eau du lac revient à l'amarre au chargement.
- 18/10 : nouveau terrain Map_Lac_02 (même cadrage). La grille du lac a 4 colonnes de plus côté avant-droit (`plus_droite` dans CUBES : Sam a remis sa carte au carré, la bande d'herbe dépassait du losange). Éléments posés d'après jeu-video/lac-essais/carte-lac-02-annotee.png, en cases de l'île à la fin de monde.py. Pas d'arbres tordus (foret_a1, a5) ni de sorbier (a4). Eau du bateau fondue (fondre_eau).
- 18/10 (2e carte annotée) : arbres serrés dans les 3 zones blanches (bord gauche, à côté du cercle de pierres, derrière le chalet), chalet en A décalé de 2 cases, portail du village tourné d'un quart, bruyères toutes violettes et plus grosses, ajonc jaune « ; » semé un peu partout hors des chemins de sable, banc déplacé (33, 20) et tourné.
- 18/10 (3e retour) : chalet en A remis à sa place d'origine (losange de Sam), bosquet d'arbres devant la place à droite du banc, bruyères seulement sur l'herbe peinte (herbe() dans monde.py, pas sur les rochers), quelques bruyères violettes mêlées à l'ajonc « ; » un peu partout.
- 18/10 : bouton « Carte » dans le jeu (jeuCarte) : le village au centre, lac et mont Ben Glagla au nord, bois Biscornu à l'ouest, bayou Barbouille à l'est, plaines Rabougri au sud. Une région reste grisée (🔒 ???) tant qu'on n'y est pas allé (p.jeu.vus, rempli par arriverJ) ; ensuite on s'y téléporte (devant son portail vers le village). Noms changés : lande = le mont Ben Glagla, desert = les plaines Rabougri, bayou = le bayou Barbouille.
- 18/10 : une musique par région, fabriquée en code (MUSIQUES et pasMusique dans jeu.js, fondu enchaîné au changement de région ; le village garde la marche de app.js). Inspirations de Sam : lac = Kalandra / Écosse, mont = country / Post Malone, bois = darkwave, bayou = hillbilly blues, plaines = mexicain / Bad Bunny. Aperçus mp3 : jeu-video/musiques/ (window.__jeu.rendreMusique(z, s) les rend hors ligne).
- 18/10 : les habitants de Sam (planches dans jeu-video/habitants/, découpées par sources/decoupe-habitants.py dans jeu-habitants.webp, atlas habitants-atlas.js, 5e nombre 2). Placés à la fin de monde.py (MONDE.habitants) : Sam, Gaelle, Finn, Siobhán au lac ; Max devant Excalibook et Simon devant la cathédrale ; Lynda, Vivien, Nina au mont Ben Glagla. Dans jeu.js : HABITANTS (nom, taille d'après la fiche de groupe, bonjour) ; ils se tournent vers le héros (miroir) et prennent leur pose « parole » quand ils parlent. Les anciens PNJ en 3D restent au désert et au bayou.
- 18/10 : la ferme du mont Ben Glagla devient le Bonnie Ranch (U maison, V grange, r corral, h portail en rondins où l'on passe dessous) ; Ninamoto (N) quitte le village pour le mont, toujours dessiné en maison en attendant sa planche.
- 18/10 : les animaux de Sam (7 planches dans jeu-video/animaux/, sources/decoupe-animaux.py → jeu-animaux.webp, animaux-atlas.js, 5e nombre 3). Chaque image est remise dans le sens de la 1re de sa ligne (ressemblance miroir/non ; FORCE pour les têtes baissées). Placés à la fin de monde.py (MONDE.animaux) : la ferme autour du Bonnie Ranch, cerf/biche/renard/écureuil/oiseaux/loutre/castor/truites au lac, loups/ours/corbeaux au bois Biscornu, raton/opossum/serpent/alligators/grenouilles au bayou, coyotes/lézards/serpent aux plaines, oiseaux et écureuil au village. jeu.js : animauxJ (repos, inspire, geste, retour ; ils réagissent et se tournent vers le héros), TAILLE_ANIMAL, CRIS (A devant un animal).
- 18/10 : les 4 boutiques de Sam (Chupa la sopa, Ninamoto, Chez Bergamotte, Excalibook) remplacent les maisons provisoires (habitants/boutiques.png, dans jeu-habitants.webp).
- 18/10 (Sam : tout est trop petit à côté du héros de 6 ans) : le héros fait 1,2 ; adultes 1,7 à 1,9, enfants 1,1 à 1,4 (HABITANTS.haut) ; animaux agrandis (TAILLE_ANIMAL : cheval et cerf 1,9, vache 1,6, mouton 1) ; maisons, boutiques et ranch dessinés 1,3 fois plus grands (k dans batimentsJ). Animaux : plus jamais sur un chemin peint ni un rocher (sol_ok dans monde.py), les truites loin des rochers de la rive.
- 18/10 (Sam : zone d'interaction plus large autour des cachettes) : à 2 cases dans tous les sens (RAYON_CACHETTE), la créature sort toute seule (approcheJ après chaque pas, revelerJ) ; on peut marcher pendant qu'elle est sortie ; au-delà de 3 cases elle rentre. A capture (le « click » reste nécessaire pour la caméra sur iPhone), B la laisse et elle ne ressort qu'après s'être éloigné de plus de 3 cases (JEU.ignore).
- 19/10 (Sam : lag et bugs du joystick quand on change de direction) : pousser pile une diagonale contre un obstacle faisait glisser le héros à gauche ou à droite au hasard (tenu2 acceptée à 90°) ; on ne glisse plus que si le pouce penche vers la voisine (< 80°). En zigzag, l'image garde la direction du pouce (JEU.vue) au lieu de changer à chaque pas. On change de direction 7° après la limite au lieu de 15°. Un demi-tour part tout de suite (demiTourJ), sans finir le pas commencé.
