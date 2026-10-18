
/* ===================== Aventure virtuelle : jeu vidéo en 3D isométrique (vue de dessus en biais, façon Dofus) ===================== */
// Une seule grande île, découpée en régions (ZONES) séparées par des frontières (arbres, rochers, falaises) ; on passe de l'une à l'autre
// par quelques passages marqués d'une arche (p). La carte est une grille de lettres : une lettre = une case (voir TUILES).
// Le décor en 3D est construit à partir de la grille (dioramaJ). Pour changer la carte, un plan dessiné à la main suffit : on le recopie en lettres.
const TUILES = {
  ".": { libre: true }, ",": { libre: true }, ";": { libre: true }, "=": { libre: true }, ":": { libre: true }, "*": { libre: true }, "b": { libre: true },
  "B": { libre: true }, "n": { libre: true }, "P": { libre: true }, "p": { libre: true },
  "T": {}, "~": {}, "#": {}, "f": {}, "R": {}, "H": {}, "D": {}, "L": {}, "S": {}, "o": {},
  "E": {}, "G": {}, "K": {}, "k": {}, "M": {}, "A": {}, "c": {}, "t": {}, "u": {},
  "X": {}, "Q": {}, "N": {}, "Y": {}, "W": {}, "F": {}, "C": {}, "j": {}, "x": {},
  "I": {}, "Z": {}, "z": {}, "O": {}, "v": {}, "J": {}, "g": {}
};   // . sol  , hautes herbes (bruyère, fougères, roseaux)  = chemin  : sable  * fleurs  b passerelle  B pont couvert  n neige  P départ  p passage (arche)
     // T arbre  ~ eau  # rocher  f barrière  R toit  H mur  D porte  L lampadaire  S panneau  o pierre levée
     // E cathédrale  G sa porte  K cabane biscornue  k sa porte  M mesa  A montagne  c cactus  t tombe  u citrouille
     // (espace) hors de l'île   x bord peint de l'île (on n'y marche pas)
     // X Excalibook  Q Chez Bergamotte  N Ninamoto  Y supérette  W Chupa la sopa  F ferme  C chalet en A  j jeu du parc
     // g portail (au bout des chemins : il mène à l'île voisine, ou au village ; voir MONDE.portails)
     // le lac : I atelier d'art  Z z les deux kelpies (celui de gauche regarde à droite)  O petit objet (rocher, souche, bûches, cairn)  v bateau de pêche (son amarre)  J banc
const CARTE = MONDE.carte;   // fabriquée par sources/monde.py : 6 îles peintes reliées par des ponts
const LARG = CARTE[0].length, HAUT = CARTE.length;
// Les régions de l'île : la première qui contient la case gagne. Chaque créature a la sienne (HABITAT).
const ZONES = {
  cabane: { nom: "Le bois Biscornu", panneau: "Le bois Biscornu. Dans la cabane de travers vit… Sporran !" },
  foret: { nom: "Le lac Carcajou", panneau: "Le lac Carcajou : le grand lac et ses deux kelpies de pierre, le chalet et le cercle de pierres." },
  bayou: { nom: "Le bayou", panneau: "Le bayou : passerelles, cyprès et eaux boueuses." },
  village: { nom: "Le vieux village", panneau: "Le vieux village et sa cathédrale. Un pont part vers chaque région." },
  lande: { nom: "Les Hautes-Terres", panneau: "Les Hautes-Terres : la lande, le lac et la ferme." },
  desert: { nom: "Le désert des Mesas", panneau: "Le désert des Mesas : cactus, rochers rouges et le vieux ranch." }
};
const CODE_ZONE = { V: "village", F: "foret", K: "cabane", D: "desert", L: "lande", B: "bayou" };   // MONDE.zones : la région de chaque case
const zoneJ = (x, y) => CODE_ZONE[(MONDE.zones[y] || "")[x]] || "village";
const HABITAT = { barghest: "lande", mothman: "lande", nessie: "foret", kraken: "foret", yeti: "lande", swamp: "bayou", faery: "bayou",
  gargouille: "village", lutins: "village", chupacabra: "desert", thunderbird: "desert", jackalope: "desert", catsith: "cabane" };
const DIRS = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] };
const DUREE_PAS = 240;   // ms pour avancer d'une case
let JEU = null;

// ---------- la grille ----------
const tuileJ = (x, y) => (CARTE[y] || "")[x] || "T";
const libreSol = (x, y) => !!(TUILES[tuileJ(x, y)] || {}).libre && !sousBatiment(x, y);   // la case elle-même (pour le plan de l'île)
// Les bâtiments dessinés : une image par bloc de cases. Une petite maison est dessinée un peu plus grande que son bloc (pour qu'on passe sa porte) :
// les cases qu'elle recouvre sont bloquées aussi, pour qu'on ne marche jamais à travers un mur.
let BATIS = null, SOUS_BATI = null;
function batimentsJ() {
  if (BATIS) return BATIS; BATIS = [];
  const bloc = (lettres, choix) => blocsJ(lettres).forEach((b, i) => {
    const w = b.x1 - b.x0 + 1, d = b.y1 - b.y0 + 1, nom = choix(b, i), base = (w + d) / Math.SQRT2;
    BATIS.push({ b, nom, w, d, large: Math.max(nom.startsWith("maison") ? 3.3 : 0, base * (nom === "pont" ? 1.15 : 1.08)), base });
  });
  bloc("EG", () => "cathedrale"); bloc("Z", () => "kelpie_d"); bloc("z", () => "kelpie_g"); bloc("Kk", () => "cabane"); bloc("B", () => "pont");
  bloc("RHD", (b, i) => zoneJ(b.x0, b.y0) === "desert" ? "saloon" : "maison" + (1 + i % 4));
  // les nouveaux lieux : leur dessin s'il est arrivé, sinon une maison en attendant
  const NOUVEAUX = { X: "excalibook", Q: "bergamotte", N: "ninamoto", Y: "superette", W: "chupa", F: "ferme", C: "chalet", I: "atelier" };
  Object.entries(NOUVEAUX).forEach(([l, nom], i) => bloc(l, () => typeof ATLAS_DECOR !== "undefined" && ATLAS_DECOR[nom] ? nom : "maison" + (1 + i % 4)));
  return BATIS;
}
function sousBatiment(x, y) {
  if (!SOUS_BATI) {
    SOUS_BATI = new Set();
    batimentsJ().forEach(({ b, nom, w, d, large, base }) => { if (nom === "pont") return;
      const k = large / base, cx = (b.x0 + b.x1) / 2, cz = (b.y0 + b.y1) / 2, ex = w * k / 2 - .25, ez = d * k / 2 - .25;
      for (let yy = Math.ceil(cz - ez); yy <= Math.floor(cz + ez); yy++) for (let xx = Math.ceil(cx - ex); xx <= Math.floor(cx + ex); xx++) SOUS_BATI.add(xx + "," + yy);
      // derrière le bâtiment, là où son image cacherait tout le héros : on ne passe pas non plus (sinon on a l'air de marcher dans les murs)
      const [, , pw, ph] = ATLAS_DECOR[nom], H = large * ph / pw, sxb = (cx - cz) / Math.SQRT2, bas = (cx + cz) / Math.SQRT2 * SIN_CAM + large * .486 * SIN_CAM, haut = bas - H;
      for (let yy = b.y0 - 6; yy <= b.y1; yy++) for (let xx = b.x0 - 6; xx <= b.x1; xx++) {
        if (xx + yy >= b.x0 + b.y0 + Math.min(w, d) - 1 || "=pPbB".includes(tuileJ(xx, yy))) continue;   // les chemins restent ouverts
        const hx = (xx - yy) / Math.SQRT2, hy = (xx + yy) / Math.SQRT2 * SIN_CAM;
        if (Math.abs(hx - sxb) < large * .3 && hy - 1.05 > haut + H * .12 && hy < bas) SOUS_BATI.add(xx + "," + yy);
      } });
  }
  return SOUS_BATI.has(x + "," + y);
}
const libreJ = (x, y) => libreSol(x, y) && !occupeJ(x, y);           // et personne dessus (habitant, cachette)
// Un habitant par région : on lui parle avec A, il donne les indices des cryptides cachés chez lui.
const PNJ = [
  { x: MONDE.pnj.village[0], y: MONDE.pnj.village[1], zone: "village", nom: "Le maire Pistache", corps: 0xd99a3c, chapeau: 0x6b569b, bonjour: "Bienvenue au vieux village ! Un pont part d'ici vers chaque région." },
  { x: MONDE.pnj.foret[0], y: MONDE.pnj.foret[1], zone: "foret", nom: "Lumignon le veilleur", corps: 0x3f8790, chapeau: 0x2a2a3a, bonjour: "Bienvenue au lac Carcajou ! On dit que Nessie nage près des rives, et le kraken tout au large : prends le bateau de pêche ! Le bois Biscornu est juste après." },
  { x: MONDE.pnj.lande[0], y: MONDE.pnj.lande[1], zone: "lande", nom: "Bergère Mousse", corps: 0x9a6fb0, chapeau: 0xf3e2c4, bonjour: "Le vent souffle fort sur les Hautes-Terres. Le lac cache bien des secrets." },
  { x: MONDE.pnj.desert[0], y: MONDE.pnj.desert[1], zone: "desert", nom: "Papy Coyote", corps: 0xc9573f, chapeau: 0xe2b77c, bonjour: "Fait chaud, hein ? Dans le désert, regarde bien autour des cactus et des rochers rouges." },
  { x: MONDE.pnj.bayou[0], y: MONDE.pnj.bayou[1], zone: "bayou", nom: "Tante Grenouille", corps: 0x6e8a44, chapeau: 0xff8fa3, bonjour: "Attention où tu mets les pieds, petit ! Le bayou, ça glisse." }
];
const pnjEn = (x, y) => PNJ.find(n => n.x === x && n.y === y);
const cachetteEn = (x, y) => ciblesJ().find(q => q.x === x && q.y === y);
const occupeJ = (x, y) => !!(pnjEn(x, y) || cachetteEn(x, y));
function trouverJ(ch) { for (let y = 0; y < HAUT; y++) { const x = CARTE[y].indexOf(ch); if (x >= 0) return [x, y]; } return null; }
const DEPART = trouverJ("P");
let accessiblesJ = null;
function casesAccessibles() {   // toutes les cases où l'on peut aller à pied depuis le départ, ou depuis l'arrivée d'un portail
  if (accessiblesJ) return accessiblesJ;
  const file = [DEPART, ...(MONDE.portails || []).map(q => [q.ax, q.ay])], vu = new Set(file.map(c => c + ""));
  while (file.length) { const [x, y] = file.shift(); for (const [dx, dy] of Object.values(DIRS)) { const n = [x + dx, y + dy];
    if (!vu.has(n + "") && libreSol(n[0], n[1]) && !pnjEn(n[0], n[1])) { vu.add(n + ""); file.push(n); } } }
  return accessiblesJ = [...vu].map(s => s.split(",").map(Number));
}

// ---------- où se cache chaque créature : dans sa région, au meilleur endroit ----------
function autour(x, y, chars) { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && chars.includes(tuileJ(x + dx, y + dy))) n++; return n; }
function scoreJ(cle, x, y) {
  const c = tuileJ(x, y), pres = s => autour(x, y, s) > 0;
  switch (cle) {
    case "mothman": return pres("L") ? 3 : pres("B") ? 2 : 1;
    case "barghest": return pres("t") ? 3 : x <= 7 ? 2 : 1;
    case "nessie": return pres("~") ? 3 : 1;
    case "kraken": return (pres("~") ? 2 : 0) + (pres("#b") ? 1 : 0) || 1;
    case "yeti": return c === "n" ? (pres("A") ? 3 : 2) : 1;
    case "swamp": return (pres("~") ? 2 : 0) + (c === "," ? 1 : 0) || 1;
    case "faery": return c === "*" ? 3 : pres("*") ? 2 : 1;
    case "gargouille": return pres("EG") ? 3 : 1;
    case "lutins": return "*,".includes(c) ? 3 : pres("RHD") ? 2 : 1;
    case "chupacabra": return pres("f") ? 3 : 1;
    case "thunderbird": return pres("M") ? 3 : 1;
    case "jackalope": return (pres("c") ? 2 : 0) + (c === "," ? 1 : 0) || 1;
    case "catsith": return pres("Kku") ? 3 : 1;
  }
  return 1;
}
const AQUATIQUES = ["nessie", "kraken", "swamp"];   // ceux-là se cachent dans l'eau, tout près du bord : on les débusque depuis la rive
function casesEau(z) {   // l'eau de la région, juste à côté d'une case où l'on peut marcher (pas un pont)
  const acc = new Set(casesAccessibles().map(c => c + "")), l = [];
  for (let y = 0; y < HAUT; y++) for (let x = 0; x < LARG; x++) if (tuileJ(x, y) === "~" && zoneJ(x, y) === z
    && Object.values(DIRS).some(([dx, dy]) => acc.has([x + dx, y + dy] + "") && !"bB".includes(tuileJ(x + dx, y + dy)))) l.push([x, y]);
  return l;
}
function cachettesJ(cle, prises, loinDe) {   // les meilleures cases de sa région, loin du départ (ou du joueur) et des autres créatures
  const z = HABITAT[cle] || "village", loin = ([x, y]) => Math.abs(loinDe[0] - x) + Math.abs(loinDe[1] - y) >= 5 && prises.every(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y)) >= 3);
  if (cle === "kraken") { const l = casesLarge().filter(c => zoneJ(c[0], c[1]) === z && loin(c) && Math.abs(c[0] - BATEAU0[0]) + Math.abs(c[1] - BATEAU0[1]) >= 12); if (l.length) return l; }   // au large : il faut le bateau
  if (AQUATIQUES.includes(cle)) { const l = casesEau(z).filter(loin); if (l.length) return l; }
  const ok = casesAccessibles().filter(([x, y]) => zoneJ(x, y) === z && !"PpbB=".includes(tuileJ(x, y))
    && Object.values(DIRS).filter(([dx, dy]) => libreSol(x + dx, y + dy)).length >= 3 && PNJ.every(n => Math.abs(n.x - x) + Math.abs(n.y - y) > 2) && loin([x, y]));
  let best = 0; ok.forEach(([x, y]) => best = Math.max(best, scoreJ(cle, x, y)));
  return ok.filter(([x, y]) => scoreJ(cle, x, y) === best);
}
const auHasardJ = l => l[Math.floor(Math.random() * l.length)];
function placerJeu(p) {   // chaque créature de l'aventure se cache dans sa région
  const j = p.jeu, prises = () => Object.values(j.pos).map(q => [q[1], q[2]]);
  Object.keys(j.pos).forEach(k => { const c = TRAQUES[k].cle, [, x, y] = j.pos[k];   // une ancienne partie : on remet chacun dans sa région, et dans l'eau s'il y nage
  if (zoneJ(x, y) !== (HABITAT[c] || "village") || AQUATIQUES.includes(c) && tuileJ(x, y) !== "~" && casesEau(HABITAT[c]).length
    || c === "kraken" && casesLarge().length && !casesLarge().some(([a, b]) => a === x && b === y)) delete j.pos[k]; });
  p.liste.filter(k => !p.pris.includes(k) && !j.pos[k]).forEach(k => {
    const l = cachettesJ(TRAQUES[k].cle, prises(), DEPART), c = l.length ? auHasardJ(l) : auHasardJ(casesAccessibles());
    j.pos[k] = [0, c[0], c[1]];
  });
}
function cacherBoss(p) {   // Sporran rôde dans le bois Biscornu, autour de sa cabane
  const l = cachettesJ("catsith", [], JEU ? [JEU.x, JEU.y] : DEPART);
  p.jeu.boss = [0].concat(auHasardJ(l.length ? l : casesAccessibles().filter(([x, y]) => zoneJ(x, y) === "cabane")));
}
function ciblesJ() {   // les créatures encore cachées sur l'île
  const p = partie(); if (!p || !p.jeu) return [];
  if (enBoss) return p.jeu.boss ? [{ k: "catsith", x: p.jeu.boss[1], y: p.jeu.boss[2] }] : [];
  return p.liste.filter(k => !p.pris.includes(k) && p.jeu.pos[k]).map(k => ({ k, x: p.jeu.pos[k][1], y: p.jeu.pos[k][2] }));
}

// ---------- ouverture, sauvegarde ----------
function ouvrirJeu() {
  initAudio(); taire(); fermerPixel(); arreterGPS(); montrer(null); $("scene").hidden = true; $("victoire").hidden = true;
  changerAmbiance("chasse");
  let p = partie();
  if (!p) { p = { liste: [], pris: [], membres: {}, debut: Date.now() }; ecrire(CLES.partie, p); }
    if (p.jeu && p.jeu.v !== 4) delete p.jeu;   // une partie de l'ancien jeu (4 petites maps) : on repart du village, les créatures sauvées le restent
  if (!p.jeu) p.jeu = { v: 4, m: 0, x: DEPART[0], y: DEPART[1], dir: "haut", pos: {} };
  placerJeu(p);
  const b = p.jeu.bateau;   // un bateau sauvé sur l'ancienne carte du lac (avant le 17/10, ou après un changement de carte) : il revient à l'amarre
  if (b && !eauDuLac().has(b.x + "," + b.y)) { delete p.jeu.bateau; if (b.a) Object.assign(p.jeu, { x: DEPART[0], y: DEPART[1], dir: "bas" }); }
  if (!(p.jeu.bateau && p.jeu.bateau.a) && !libreSol(p.jeu.x, p.jeu.y)) Object.assign(p.jeu, { x: DEPART[0], y: DEPART[1], dir: "bas" });   // une ancienne partie arrêtée sur un pont qui n'existe plus
  JEU = { x: p.jeu.x, y: p.jeu.y, dir: p.jeu.dir || "bas", pas: null, tenu: null, revele: null, raf: 0, t: 0, dernierBip: 0, zone: null };
  JEU.bateau = BATEAU0 && (p.jeu.bateau && p.jeu.bateau.lac ? { ...p.jeu.bateau } : { x: BATEAU0[0], y: BATEAU0[1], dir: dirLac(), a: false, lac: 1 });   // lac : tourné vers le large (17/10 ; les anciens bateaux sont retournés)
  if (p.jeu.nPris !== undefined && p.pris.length > p.jeu.nPris) JEU.action = { ligne: 3, t0: performance.now() + 300, duree: 1900, vitesse: 120 };   // un cryptide de plus : on saute de joie
  p.jeu.nPris = p.pris.length;
  if (enBoss && !p.jeu.boss) { cacherBoss(p); bossPhase = 0; }
  ecrire(CLES.partie, p);
  $("jeu").hidden = false; allumerJ(0);
  arriverJ(true);
  if (!JEU.raf) JEU.raf = requestAnimationFrame(boucleJeu);
}
function sauverJ() { majPartie(p => { if (p.jeu) Object.assign(p.jeu, { x: JEU.x, y: JEU.y, dir: JEU.dir }, JEU.bateau ? { bateau: { ...JEU.bateau } } : {}); }); }
function fermerJeu() {
  if (JEU) { cancelAnimationFrame(JEU.raf); JEU.raf = 0; JEU.tenu = null; sauverJ(); }
  $("jeu").hidden = true;
}
function arriverJ(debut) {   // on entre dans une région : son nom, et combien de cryptides s'y cachent
  const z = JEU.zone = zoneJ(JEU.x, JEU.y), Z = ZONES[z], n = ciblesJ().filter(q => zoneJ(q.x, q.y) === z).length;
  $("jeuLieu").textContent = Z.nom;
  let txt = n ? n + (n > 1 ? " cryptides se cachent ici" : " cryptide se cache ici") : "Aucun cryptide ici. Cherche ailleurs !";
  if (enBoss) txt = z === "cabane" ? "Sporran rôde autour de sa cabane…" : "Sporran t'attend dans le bois Biscornu, après le lac Carcajou !";
  titreJ(Z.nom, txt); if (!debut) sfx("page");
}
let minuterieTitre = 0;
function titreJ(titre, sous) {
  const el = $("jeuTitre"); el.innerHTML = ""; const h = document.createElement("b"); h.textContent = titre; el.appendChild(h);
  if (sous) { const s = document.createElement("span"); s.textContent = sous; el.appendChild(s); }
  el.hidden = false; clearTimeout(minuterieTitre); minuterieTitre = setTimeout(() => el.hidden = true, 2600);
}
function dialogueJ(texte, duree) {
  const el = $("jeuDialogue"); el.textContent = texte; el.hidden = false;
  clearTimeout(dialogueJ.t); dialogueJ.t = setTimeout(() => el.hidden = true, duree || 3600);
}

// ---------- déplacement ----------
function essayerPas(dir, essai) {   // essai : on regarde seulement si ça passe (sans se tourner ni cogner)
  if (!JEU || JEU.pas || JEU.revele) return false;
  const [dx, dy] = DIRS[dir], x = JEU.x + dx, y = JEU.y + dy, B = JEU.bateau;
  if (B && B.a) {   // en bateau : on va sur l'eau ; en poussant vers la rive, on descend (le bateau reste là)
    if (eauJ(x, y)) { B.x = x; B.y = y; B.dir = dir; }
    else if (libreJ(x, y) && !essai) { B.a = false; dialogueJ("Tu descends du bateau. Il t'attend ici.", 2400); }
    else { if (!essai) JEU.dir = B.dir = dir; return false; }
  }
  else if (B && x === B.x && y === B.y) {   // on monte dans le bateau
    if (essai) return false;
    B.a = true; sfx("page"); dialogueJ("Tu montes dans le bateau de pêche ! Navigue sur le lac. Pousse vers la rive pour descendre.", 3600);   // il garde son sens : la proue vers le lac
  }
  else if (!libreJ(x, y)) { if (essai) return false; JEU.dir = dir; const g = portailEn(x, y); if (g && !JEU.portail) return portailJ(g), false; if (performance.now() - (JEU.tCogne || 0) > 350) { JEU.tCogne = performance.now(); sfx("clic"); } return false; }
  if (JEU.portail) { JEU.portail = null; $("jeuDialogue").hidden = true; }   // on s'éloigne du portail : on reste
  JEU.dir = dir; JEU.pas = { de: [JEU.x, JEU.y], t0: performance.now() }; JEU.x = x; JEU.y = y; JEU.action = null; return true;
}
// ---------- le bateau de pêche (17/10) : amarré au bord du lac Carcajou ; il emmène au large, là où se cache le kraken ----------
const BATEAU0 = MONDE.bateau || null;
function dirLac() {   // le sens du lac à l'amarre : la direction où l'eau s'étend le plus loin
  let best = "droite", n0 = -1;
  for (const [d, [dx, dy]] of Object.entries(DIRS)) { let n = 0; while (n < 30 && "~v".includes(tuileJ(BATEAU0[0] + dx * (n + 1), BATEAU0[1] + dy * (n + 1)))) n++; if (n > n0) { n0 = n; best = d; } }
  return best;
}
// le bouton « Monter » / « Descendre » (17/10) : à côté du bateau, plus besoin de pousser pile dessus
function boutonBateauJ() {
  const B = JEU && JEU.bateau, el = $("jeuBateau"); if (!el || !JEU) return;
  let quoi = "";
  if (B && !B.a && !JEU.pas && Math.max(Math.abs(B.x - JEU.x), Math.abs(B.y - JEU.y)) <= 2 && zoneJ(B.x, B.y) === zoneJ(JEU.x, JEU.y)) quoi = "Monter dans le bateau";
  else if (B && B.a && !JEU.pas && rivePres()) quoi = "Descendre";
  else if (!(B && B.a) && !JEU.portail && !JEU.revele && portailPres()) quoi = "Utiliser le portail";   // le même bouton sert aux portails (17/10)
  el.classList.toggle("portail", quoi === "Utiliser le portail");
  if (el.textContent !== quoi) el.textContent = quoi; el.hidden = !quoi;
}
function rivePres() { return Object.entries(DIRS).map(([d, [dx, dy]]) => [d, JEU.x + dx, JEU.y + dy]).sort(([a], [b]) => (b === JEU.dir) - (a === JEU.dir)).find(([, x, y]) => libreJ(x, y)); }
function bateauBoutonJ() {
  if ($("jeuBateau").classList.contains("portail")) { const g = portailPres(); if (g) portailJ(g); return boutonBateauJ(); }
  const B = JEU && JEU.bateau; if (!B || JEU.pas || JEU.revele) return;
  if (!B.a) { B.a = true; JEU.pas = { de: [JEU.x, JEU.y], t0: performance.now() }; JEU.x = B.x; JEU.y = B.y; JEU.dir = B.dir; JEU.action = null; sfx("page");
    dialogueJ("Tu montes dans le bateau de pêche ! Navigue sur le lac. Pousse vers la rive ou appuie sur « Descendre ».", 3600); }
  else { const r = rivePres(); if (!r) return; B.a = false; JEU.pas = { de: [JEU.x, JEU.y], t0: performance.now() }; JEU.x = r[1]; JEU.y = r[2]; JEU.dir = r[0]; dialogueJ("Tu descends du bateau. Il t'attend ici.", 2400); }
  boutonBateauJ(); sauverJ();
}
const eauJ = (x, y) => "~v".includes(tuileJ(x, y)) && !occupeJ(x, y);
let largeJ = null;
let lacJ = null;
function eauDuLac() {   // toutes les cases d'eau qu'on atteint en bateau depuis l'amarre
  if (lacJ) return lacJ; lacJ = new Set(); if (!BATEAU0) return lacJ;
  const f = [BATEAU0]; lacJ.add(BATEAU0 + "");
  while (f.length) { const [x, y] = f.shift(); for (const [dx, dy] of Object.values(DIRS)) { const n = [x + dx, y + dy]; if (!lacJ.has(n + "") && "~v".includes(tuileJ(n[0], n[1]))) { lacJ.add(n + ""); f.push(n); } } }
  return lacJ;
}
function casesLarge() {   // l'eau qu'on atteint en bateau depuis l'amarre, à plus de 2 cases de toute rive
  if (largeJ) return largeJ; if (!BATEAU0) return largeJ = [];
  return largeJ = [...eauDuLac()].map(s => s.split(",").map(Number)).filter(([x, y]) => { for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) if (!"~vZz".includes(tuileJ(x + a, y + b))) return false; return true; });
}
function bateauJ(R, fx, fy, t) {   // l'image du bateau, tournée vers sa direction ; le héros est assis dessus quand il navigue
  const B = JEU.bateau; if (!B || !ATLAS_DECOR.bateau_haut) return;
  if (!R.bateau) { R.bateau = new THREE.Sprite(matDecor(R, "bateau_haut")); R.bateau.center.set(.5, .36); R.scene.add(R.bateau); }
  // vers le bas-droite : l'image « bas » retournée (dans l'image « droite » de la planche, la proue pointue se lit vers le haut-gauche, 17/10)
  const inv = B.dir === "droite", nom = inv ? "bateau_bas" : "bateau_" + B.dir, [, , w, h] = ATLAS_DECOR[nom], s = R.bateau, m = matDecor(R, nom, inv);
  if (s.material !== m) s.material = m;
  s.scale.set(4.2, 4.2 * h / w, 1);
  const x = B.a ? fx : B.x, z = B.a ? fy : B.y, houle = Math.sin(t / 600) * .03;
  s.position.set(x - .05, houle, z - .05);   // un peu plus loin que le héros : il est dessiné par-dessus, sur le pont
}
// ---------- les portails (17/10) : au bout des chemins, un portail mène à l'île voisine ; on peut aussi rentrer tout de suite au village ----------
const portailEn = (x, y) => (MONDE.portails || []).find(q => q.x === x && q.y === y);
const portailPres = () => (MONDE.portails || []).find(q => Math.max(Math.abs(q.x - JEU.x), Math.abs(q.y - JEU.y)) <= 3);   // 3 cases autour, dans tous les sens
function portailJ(q) {   // le choix : l'île voisine, le village (si on n'y va pas déjà), ou rester
  sfx("page"); JEU.portail = q; const t0 = performance.now();
  const el = $("jeuDialogue"); el.innerHTML = ""; el.hidden = false; clearTimeout(dialogueJ.t);
  const t = document.createElement("div"); t.textContent = "Un portail magique ! Où veux-tu aller ?"; el.appendChild(t);
  const l = document.createElement("div"), choix = [[q.vers, ZONES[q.vers].nom]]; l.className = "jeu-choix";
  if (q.zone !== "village" && q.vers !== "village") choix.push(["village", "Retour au village"]);
  choix.push([null, "Rester ici"]);
  choix.forEach(([z, nom]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = nom; b.onclick = () => { if (performance.now() - t0 < 450) return; z ? voyagerJ(z) : boutonB(); }; l.appendChild(b); });   // t0 : le toucher qui a ouvert le menu ne choisit pas aussi
  el.appendChild(l);
}
function voyagerJ(z) {   // on arrive devant le portail d'en face (ou devant la cathédrale, pour le retour au village)
  const q = JEU.portail; if (!q) return; JEU.portail = null; $("jeuDialogue").hidden = true;
  const p = z === q.vers && (MONDE.portails || []).find(o => o.zone === z && o.vers === q.zone);
  if (p) { JEU.x = p.ax; JEU.y = p.ay; JEU.dir = Object.keys(DIRS).find(d => DIRS[d][0] === p.ax - p.x && DIRS[d][1] === p.ay - p.y) || "bas"; }
  else { JEU.x = DEPART[0]; JEU.y = DEPART[1]; JEU.dir = "bas"; }
  JEU.pas = null; JEU.action = null; sfx("fuite"); sauverJ(); arriverJ();
}
// Le joystick : pousser tout droit vers le haut (ou le bas, la gauche, la droite de l'écran) fait marcher en zigzag sur les 2 diagonales voisines,
// et si la diagonale choisie est bouchée, on glisse sur la voisine. Comme ça on monte même quand un arbre est devant.
function pasTenu() {
  if (!JEU || !JEU.tenu) return;
  const a = JEU.tenu, b = JEU.tenu2;
  const ordre = !b ? [a] : JEU.zigzag && JEU.dernierDir === a ? [b, a] : [a, b];
  for (const d of ordre) if (essayerPas(d, true)) { JEU.dernierDir = d; return; }
  essayerPas(ordre[0]);
}
function finPas() {
  JEU.pas = null; sauverJ();
  if (zoneJ(JEU.x, JEU.y) !== JEU.zone) arriverJ();
}
function boutonA() {
  if (!JEU) return;
  if (JEU.revele) return trouveJ();
  if (JEU.portail) return voyagerJ(JEU.portail.vers);
  const [dx, dy] = DIRS[JEU.dir], fx = JEU.x + dx, fy = JEU.y + dy;
  const g = portailEn(fx, fy) || (!cachetteEn(fx, fy) && !pnjEn(fx, fy) && portailPres()); if (g) return portailJ(g);   // A ouvre un portail tout proche, pas besoin d'être collé devant (17/10)
  if (JEU.bateau && !JEU.bateau.a && fx === JEU.bateau.x && fy === JEU.bateau.y) return essayerPas(JEU.dir);   // A devant le bateau : on monte
  // comme dans Zelda : on fouille ce qu'on a devant soi. Un buisson qui bouge cache un cryptide.
  const q = cachetteEn(fx, fy);
  if (q) { JEU.revele = { q, t0: performance.now() + 400 }; fouilleJ({ ligne: 2, boucle: true, vitesse: 160 }); sfx("revele"); if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    return dialogueJ(q.k === "catsith" ? "C'est Sporran ! Appuie encore sur A pour l'attraper !" : "Deux yeux brillent dans la cachette… C'est un cryptide ! Appuie encore sur A pour ouvrir l'œil magique.", 60000); }
  const n = pnjEn(fx, fy);
  if (n) { sfx("page"); JEU.parle = n; return dialogueJ(n.nom + " : " + texteHabitant(n), 8000); }
  if (tuileJ(fx, fy) === "S") { sfx("page"); return dialogueJ(texteSigne(JEU.x + dx, JEU.y + dy), 6000); }
  sfx("clic"); fouilleJ(); dialogueJ(["Rien par ici…", "Cherche ce qui bouge ! Mets-toi devant et appuie sur A.", "Le détecteur t'aide : plus il s'allume, plus un cryptide est proche !"][Math.floor(Math.random() * 3)], 2400);
}
function texteHabitant(n) {   // ce que dit l'habitant d'une région : bonjour, puis les indices
  if (enBoss) return "Sporran ? Il est parti vers sa cabane, dans le bois Biscornu, au sud du village !";
  const l = ciblesJ().filter(q => zoneJ(q.x, q.y) === n.zone).map(q => TRAQUES[q.k].indice);
  if (!l.length) return n.bonjour + " Ici, tous les cryptides sont sauvés. Bravo !";
  return n.bonjour + " " + (l.length > 1 ? l.length + " cryptides se cachent par ici. " : "Un cryptide se cache par ici. ") + (l.length > 1 ? "Indices : " : "Un indice : ") + l.map(t => "« " + t + " »").join(", ") + ". Cherche une cachette qui bouge !";
}
function texteSigne(x, y) {   // le panneau d'une région donne les indices des créatures qui s'y cachent
  const z = zoneJ(x, y), txt = ZONES[z].panneau;
  if (enBoss) return txt + (z === "cabane" ? " Sporran rôde tout près…" : " Sporran t'attend dans le bois Biscornu !");
  const l = ciblesJ().filter(q => zoneJ(q.x, q.y) === z).map(q => TRAQUES[q.k].indice);
  return l.length ? txt + " Indices : " + l.map(s => "« " + s + " »").join(", ") + "." : txt + " Aucun cryptide ne se cache par ici.";
}
function boutonB() {
  if (!JEU) return;
  if (JEU.revele) return fuirJ();
  JEU.portail = null; $("jeuDialogue").hidden = true;
}

// ---------- capture : on repasse à l'œil magique (RA), comme sur la carte GPS ----------
function trouveJ() {   // appelé depuis un « clic » ou une touche : iOS n'autorise la caméra et les capteurs qu'à ce moment-là
  const r = JEU && JEU.revele; if (!r) return;
  const k = r.q.k; JEU.revele = null; $("jeuDialogue").hidden = true;
  if (k === "catsith" && bossPhase < 2) { partirCrea(r.q); return fuiteBoss(); }
  fermerJeu(); sfx("oeil");
  bandeau(k === "catsith" ? "Tu as débusqué Sporran ! Ouvre l'œil magique…" : "Débusqué ! Cherche-le autour de toi avec l'œil magique…", 2400);
  ouvrirOeil(() => k === "catsith" ? demarrerBossAR() : demarrerTraque(k, { gpsFait: true, angleGPS: null }));
}
function fuirJ() {
  partirCrea(JEU.revele.q); JEU.revele = null; JEU.action = null; sfx("clic");
  dialogueJ("Tu laisses le cryptide tranquille… Il reste caché ici. Reviens quand tu veux !", 3000);
}
function fuiteBoss() {   // comme sur la carte GPS : Sporran file ailleurs deux fois avant de se laisser attraper
  bossPhase++; sfx("fuite"); JEU.action = null;
  const p = partie(); cacherBoss(p); ecrire(CLES.partie, p);
  dialogueJ(bossPhase === 1 ? "Hé hé ! Trop lent ! Attrape-moi si tu peux !" : "Encore raté ! Dernière chance, petit humain !", 3400);
}

import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
// ---------- rendu en 3D isométrique (three.js) : formes rondes et douces, couleurs de forêt de pins au crépuscule ----------
// L'île devient un grand diorama : les cases de la grille donnent le sol, et chaque lettre pose son objet (arbre, maison…),
// dans le style de sa région. La lumière change en douceur d'une région à l'autre (AMB).
const COUL = { terre: 0x8a5a3b, tronc: 0x7a5134, rocher: 0xa3a1ac, pierre: 0x8e85ad, rune: 0x5ff0d0,
  mur: 0xf3e2c4, toits: [0xc9573f, 0x6b569b, 0x3f8790, 0xd99a3c], porte: 0x6e4630, vitre: 0xffd36e, bois: 0xc98d4b, lampe: 0x3d3a4a, lumiere: 0xffe08a,
  capuche: 0x6f52a8, capuche2: 0x58408a, peau: 0xf5c9a2, yeux: 0x2a1d24, botte: 0x4a3326, sable: 0xeab47a, sable2: 0xe3a86c, neige: 0xf3f6fb, neige2: 0xe4ecf6,
  fleurs: [0xff8fa3, 0xfff1d6, 0xffc94d, 0xb48ee8] };
const ZC = {   // les couleurs de chaque région : sol (2 tons), hautes herbes, chemin, eau, fond de l'eau
  lande: { sol: [0x93a862, 0x87a05a], herbes: 0x9a6fb0, chemin: 0xc8b28a, eau: 0x5cb8d0, fond: 0x2e5f78 },
  desert: { sol: [COUL.sable, COUL.sable2], herbes: 0xb8a46a, chemin: 0xd49a62, eau: 0x5cc2c9, fond: 0x2e6470 },
  village: { sol: [0x86b26a, 0x79a85f], herbes: 0x4e8b55, chemin: 0xe2b77c, eau: 0x5cc2c9, fond: 0x2e6470 },
  foret: { sol: [0x3e6b52, 0x46745a], herbes: 0x2b5a48, chemin: 0x9a7e62, eau: 0x3f6f9e, fond: 0x1e3550 },
  bayou: { sol: [0x76904c, 0x6c8644], herbes: 0x9aa552, chemin: 0xa58a62, eau: 0x3f6b5c, fond: 0x26362a },
  cabane: { sol: [0x7f9e58, 0x8aa862], herbes: 0x5f8a4a, chemin: 0xc89a6a, eau: 0x5cc2c9, fond: 0x2e6470 }
};
const AMB = {   // lumière de chaque région : ciel, sol, intensité ; soleil ; couleur du fond ; nuit (0 = plein jour, 1 = nuit noire)
  lande: { ciel: [0xdfeaf5, 0x6a6a5a, 1.5], soleil: [0xf4f1ff, 1.9], fond: 0xbcd3dc, nuit: .1 },
  desert: { ciel: [0xffe9c8, 0xa0603a, 1.7], soleil: [0xffe0a8, 2.5], fond: 0xf3c98e, nuit: 0 },
  village: { ciel: [0xd8ecff, 0x7a5a40, 1.6], soleil: [0xfff0d6, 2.2], fond: 0xf3d9ae, nuit: 0 },
  foret: { ciel: [0xdcefe8, 0x4a6a46, 1.6], soleil: [0xfff3da, 2.1], fond: 0xcfe3d6, nuit: 0 },
  bayou: { ciel: [0xcfe0a8, 0x45532c, 1.25], soleil: [0xffdf9a, 1.5], fond: 0x8a9a6a, nuit: .45 },
  cabane: { ciel: [0x6f5cc8, 0x161236, .8], soleil: [0x8fa8ff, .45], fond: 0x1a1536, nuit: 1.4 }   // plus que la nuit : le bois est encore plus sombre
};
const M3 = {};   // matériaux partagés, mats et doux (pas de reflets)
const mat3 = (c, e) => M3[c + "/" + (e || 0)] || (M3[c + "/" + (e || 0)] = new THREE.MeshLambertMaterial({ color: c, emissive: e ? c : 0x000000, emissiveIntensity: e || 0 }));
const hautSol = c => "~bB".includes(c) ? -.34 : 0;
let R3 = null;   // le moteur du jeu : rendu, scène, caméra, lumières, héros, et le diorama de l'île
function moteurJeu() {
  if (R3) return R3;
  const rendu = new THREE.WebGLRenderer({ canvas: $("jeuCanvas"), alpha: true, antialias: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 100);
  const ciel = new THREE.HemisphereLight(0xd8ecff, 0x7a5a40, 1.6), soleil = new THREE.DirectionalLight(0xfff0d6, 2.2);
  soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024); Object.assign(soleil.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 40 });
  soleil.shadow.bias = -.002; scene.add(ciel, soleil, soleil.target);
  const lampes = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xffd27a, 0, 5, 1.4); scene.add(l); return l; });   // 4 lumières prêtées aux lampadaires les plus proches
  const heros = creerHeros(); scene.add(heros);
  const signe = new THREE.Sprite(new THREE.SpriteMaterial({ map: texteSprite("!"), depthTest: false })); signe.scale.set(.7, .7, 1); signe.visible = false; signe.renderOrder = 9; scene.add(signe);
  const fond = new THREE.Color(AMB.village.fond);
  return R3 = { rendu, scene, camera, ciel, soleil, lampes, heros, signe, ile: null, fond, nuit: 0 };
}
function texteSprite(ch) {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.strokeStyle = "#2a1d24"; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#e0453a"; g.font = "bold 84px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 64, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const IMG_JEU = "";   // dossier des images dessinées du jeu (la page de test les prend sur la branche)
// Le héros dessiné : une planche de 6 colonnes (4 pas de marche, 2 images d'attente) sur 4 lignes (bas, droite, haut, gauche).
const LIGNE_HEROS = { bas: 0, droite: 1, haut: 2, gauche: 3 };
function creerHeros() {   // un enfant en sweat à capuche violet, masque de chat en bois, avec sa lanterne
  const g = new THREE.Group(), corps = new THREE.Group(); g.add(corps);
  const m = (geo, c, x, y, z, e) => { const o = new THREE.Mesh(geo, mat3(c, e)); o.position.set(x, y, z); o.castShadow = true; corps.add(o); return o; };
  // la version en volumes, gardée tant que l'image n'est pas chargée (ou si elle ne se charge pas)
  m(new THREE.CapsuleGeometry(.2, .22, 6, 14), COUL.capuche, 0, .36, 0);
  m(new THREE.SphereGeometry(.25, 18, 14), COUL.capuche2, 0, .74, -.04);          // la capuche
  m(new THREE.SphereGeometry(.2, 18, 14), COUL.peau, 0, .73, .06);               // le visage
  m(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, -.075, .76, .245); m(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, .075, .76, .245);
  m(new THREE.SphereGeometry(.07, 10, 8), COUL.botte, -.09, .06, .02); m(new THREE.SphereGeometry(.07, 10, 8), COUL.botte, .09, .06, .02);
  m(new THREE.CylinderGeometry(.01, .01, .14, 4), COUL.lampe, .27, .5, .08);
  m(new THREE.BoxGeometry(.12, .15, .12), COUL.lumiere, .27, .37, .08, 1.2);       // la lanterne
  const lueur = new THREE.PointLight(0xffd27a, 1.2, 3, 1.6); lueur.position.set(.27, .4, .1); g.add(lueur);
  const dessin = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, alphaTest: .05, depthWrite: false }));
  dessin.center.set(.5, .05); dessin.scale.set(TAILLE_HEROS, TAILLE_HEROS, 1); dessin.position.y = .02; dessin.visible = false; g.add(dessin);
  // l'image suivante, posée par-dessus et de plus en plus visible : on passe en douceur d'une image à l'autre
  const suite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, alphaTest: .05, depthWrite: false, opacity: 0 }));
  suite.center.copy(dessin.center); suite.scale.copy(dessin.scale); suite.position.y = .02; suite.visible = false; g.add(suite);
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(.3, 20), new THREE.MeshBasicMaterial({ color: 0x1a1030, transparent: true, opacity: .28, depthWrite: false, depthTest: false }));
  ombre.rotation.x = -Math.PI / 2; ombre.scale.set(1, .75, 1); ombre.position.y = .01; ombre.renderOrder = -1; ombre.visible = false; g.add(ombre);   // une ombre douce sous les pieds
  g.userData = { corps, lueur, dessin, suite, ombre };
  new THREE.TextureLoader().load(IMG_JEU + "jeu-heros.webp", tex => {
    tex.colorSpace = THREE.SRGBColorSpace; tex.repeat.set(1 / 6, 1 / 4); tex.magFilter = THREE.LinearFilter; g.userData.texMarche = tex; g.userData.texMarche2 = tex.clone();
    dessin.material.map = tex; dessin.material.needsUpdate = true; dessin.visible = true; ombre.visible = true; corps.visible = false;
  });
  // les actions (4 images de 320×360 par ligne) : fouiller vers la gauche, fouiller vers la droite, surprise, joie
  new THREE.TextureLoader().load(IMG_JEU + "jeu-heros-actions.webp", tex => { tex.colorSpace = THREE.SRGBColorSpace; tex.repeat.set(1 / 4, 1 / 4); g.userData.texActions = tex; g.userData.texActions2 = tex.clone(); });
  return g;
}
const TAILLE_HEROS = 1.4;   // un enfant : un peu plus petit qu'une porte, bien plus petit qu'un arbre
const lisse = f => f * f * (3 - 2 * f);   // départ et arrivée en douceur
function fonduImages(a, b, texA, texB, posA, posB, f) {   // image a, puis l'image suivante b qui apparaît par-dessus (f de 0 à 1)
  if (a.material.map !== texA) { a.material.map = texA; a.material.needsUpdate = true; }
  if (b.material.map !== texB) { b.material.map = texB; b.material.needsUpdate = true; }
  texA.offset.set(posA[0], posA[1]); texB.offset.set(posB[0], posB[1]);
  f = Math.min(1, Math.max(0, (f - .55) / .45));   // on ne mélange qu'à la fin de chaque image : un passage rapide, sans image en double
  b.material.opacity = lisse(f); b.visible = a.visible && f > .02;
  b.center.copy(a.center); b.scale.copy(a.scale); b.material.color.copy(a.material.color);
}
function imageHeros(h, t, marche) {   // choisit l'image de la planche : direction, et pas de marche ou respiration (ou une action : fouiller, surprise, joie)
  const u = h.userData, d = u.dessin; if (!u.texMarche) return;
  let a = JEU.action;
  if (a && !a.boucle && t - a.t0 > a.duree) a = JEU.action = a.puis ? Object.assign(a.puis, { t0: t }) : null;
  const act = !!(a && u.texActions), S = TAILLE_HEROS;
  if (act !== !!u.enAction) { u.enAction = act; act ? (d.scale.set(S, S * 1.125, 1), d.center.set(.5, 16 / 360)) : (d.scale.set(S, S, 1), d.center.set(.5, .05)); }
  if (act) {
    const x = Math.max(0, t - a.t0) / a.vitesse, c = Math.floor(x) % 4, ligne = 1 - (a.ligne + 1) / 4;
    const fin = !a.boucle && Math.floor(x) >= 3;   // la dernière image d'une action qui ne boucle pas ne revient pas à la première
    return fonduImages(d, u.suite, u.texActions, u.texActions2, [c / 4, ligne], [((c + 1) % 4) / 4, ligne], fin ? 0 : x % 1);
  }
  const ligne = 1 - (LIGNE_HEROS[JEU.dir] + 1) / 4, x = marche ? t / 170 : t / 650, c = Math.floor(x) % (marche ? 4 : 2), base = marche ? 0 : 4, n = marche ? 4 : 2;
  fonduImages(d, u.suite, u.texMarche, u.texMarche2, [(base + c) / 6, ligne], [(base + (c + 1) % n) / 6, ligne], x % 1);
}
const fouilleJ = puis => { JEU.action = { ligne: "bas gauche".includes(JEU.dir) ? 0 : 1, t0: performance.now(), duree: 400, vitesse: 100, puis }; };
function prisme(w, d, h) {   // un toit à deux pentes, faîtage le long de x
  const x = w / 2, z = d / 2, p = [-x, 0, -z, x, 0, -z, x, h, 0, -x, h, 0, -x, 0, z, x, 0, z];
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  geo.setIndex([0, 3, 2, 0, 2, 1, 4, 5, 2, 4, 2, 3, 0, 4, 3, 1, 2, 5, 0, 1, 5, 0, 5, 4]); geo.computeVertexNormals(); return geo;
}
function blocsJ(lettres) {   // les groupes de cases voisines faits de ces lettres (une maison, la cathédrale, une mesa…)
  const vu = new Set(), blocs = [];
  for (let y = 0; y < HAUT; y++) for (let x = 0; x < LARG; x++) {
    if (!lettres.includes(CARTE[y][x]) || vu.has(x + "," + y)) continue;
    const cases = [], file = [[x, y]]; vu.add(x + "," + y);
    while (file.length) { const [a, b] = file.pop(); cases.push([a, b]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (a + dx) + "," + (b + dy);
      if (!vu.has(k) && lettres.includes(tuileJ(a + dx, b + dy))) { vu.add(k); file.push([a + dx, b + dy]); } }); }
    const xs = cases.map(c => c[0]), ys = cases.map(c => c[1]);
    blocs.push({ cases, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
  }
  return blocs;
}
function dioramaVolumes() {   // l'ancienne île en volumes : gardée si les planches dessinées ne se chargent pas
  const R = moteurJeu(); if (R.ile) return R.ile;
  const G = CARTE, H = HAUT, W = LARG, groupe = new THREE.Group(), anim = [], lampes = [], rnd = hasard(311);
  const ajoute = (o, x, y, z, ombre) => { o.position.set(x, y, z); if (ombre !== false) o.castShadow = true; groupe.add(o); return o; };
  const boite = (w, h, d, c, x, y, z, e) => ajoute(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat3(c, e)), x, y, z);
  const neigeux = (x, y) => G[y][x] === "n" || autour(x, y, "n") >= 3;
  // le sol : une seule géométrie (dessus de chaque case, et flancs de terre là où le sol descend)
  const pos = [], col = [], c3 = new THREE.Color();
  const quad = (a, b, c, d, hex) => { c3.setHex(hex); for (const p of [a, b, c, a, c, d]) { pos.push(...p); col.push(c3.r, c3.g, c3.b); } };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (G[y][x] === " ") continue;
    const ch = G[y][x], h = hautSol(ch), Z = ZC[zoneJ(x, y)], x0 = x - .5, x1 = x + .5, z0 = y - .5, z1 = y + .5, r = rnd() < .5;
    const dessus = h < 0 ? Z.fond : "=p".includes(ch) ? Z.chemin : ch === ":" ? (r ? COUL.sable : COUL.sable2)
      : neigeux(x, y) ? (r ? COUL.neige : COUL.neige2) : Z.sol[r ? 0 : 1];
    quad([x0, h, z0], [x0, h, z1], [x1, h, z1], [x1, h, z0], dessus);
    [[0, -1, [x0, z0], [x1, z0]], [0, 1, [x1, z1], [x0, z1]], [-1, 0, [x0, z1], [x0, z0]], [1, 0, [x1, z0], [x1, z1]]].forEach(([dx, dy, a, b]) => {
      const n = G[y + dy] && G[y + dy][x + dx] !== " " ? G[y + dy][x + dx] : undefined, nh = n === undefined ? -1.1 : hautSol(n);
      if (nh < h) { quad([a[0], nh, a[1]], [b[0], nh, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], COUL.terre); if (h === 0 && n !== undefined) quad([a[0], h - .06, a[1]], [b[0], h - .06, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], dessus); }
      else if (n === undefined) quad([a[0], -1.1, a[1]], [b[0], -1.1, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], COUL.terre);
    });
  }
  const sol = new THREE.BufferGeometry(); sol.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sol.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); sol.computeVertexNormals();
  const msol = new THREE.Mesh(sol, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); msol.receiveShadow = true; msol.userData.vivant = true; groupe.add(msol);
  // l'eau : une surface un peu transparente, bleue au lac, sombre dans la forêt, verte et boueuse au bayou
  const ep = [], ec = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ("~bB".includes(G[y][x])) {
    c3.setHex(ZC[zoneJ(x, y)].eau); ep.push(x - .5, -.1, y - .5, x - .5, -.1, y + .5, x + .5, -.1, y + .5, x - .5, -.1, y - .5, x + .5, -.1, y + .5, x + .5, -.1, y - .5);
    for (let i = 0; i < 6; i++) ec.push(c3.r, c3.g, c3.b);
  }
  if (ep.length) {
    const ge = new THREE.BufferGeometry(); ge.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3)); ge.setAttribute("color", new THREE.Float32BufferAttribute(ec, 3)); ge.computeVertexNormals();
    const me = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: .8, side: THREE.DoubleSide, emissive: 0x5cc2c9, emissiveIntensity: .08 });
    const eau = new THREE.Mesh(ge, me); eau.receiveShadow = true; eau.userData.vivant = true; groupe.add(eau); anim.push(t => { me.emissiveIntensity = .06 + .05 * Math.sin(t / 700); });
  }
  // hautes herbes (bruyère violette, fougères, roseaux) et fleurs : des milliers de petits brins, dessinés en une fois
  const brins = [], fleurs = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (G[y][x] === ",") { const c = ZC[zoneJ(x, y)].herbes; for (let i = 0; i < 9; i++) brins.push([x + (rnd() - .5) * .85, y + (rnd() - .5) * .85, .7 + rnd() * .6, c]); }
    if (G[y][x] === "*") for (let i = 0; i < 7; i++) fleurs.push([x + (rnd() - .5) * .8, y + (rnd() - .5) * .8, COUL.fleurs[(rnd() * 4) | 0]]);
  }
  const mat4 = new THREE.Matrix4(), q = new THREE.Quaternion(), un = new THREE.Vector3(1, 1, 1);
  if (brins.length) { const ib = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, .42, 5).translate(0, .21, 0), new THREE.MeshLambertMaterial(), brins.length);
    brins.forEach(([x, z, s, c], i) => { q.setFromAxisAngle(new THREE.Vector3(rnd() - .5, 0, rnd() - .5).normalize(), (rnd() - .5) * .5); ib.setMatrixAt(i, mat4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(s, s, s))); ib.setColorAt(i, c3.setHex(c)); });
    ib.castShadow = true; groupe.add(ib); }
  if (fleurs.length) { const ifl = new THREE.InstancedMesh(new THREE.SphereGeometry(.065, 8, 6), new THREE.MeshLambertMaterial(), fleurs.length);
    fleurs.forEach(([x, z, c], i) => { ifl.setMatrixAt(i, mat4.compose(new THREE.Vector3(x, .07, z), q.identity(), un)); ifl.setColorAt(i, c3.setHex(c)); }); groupe.add(ifl); }
  // maisons du village et du ranch : chaque bloc de toits et de murs devient une maison
  blocsJ("RHD").forEach(({ cases, x0, x1, y0, y1 }, i) => {
    const w = x1 - x0 + 1 - .1, d = y1 - y0 + 1 - .1, cx = (x0 + x1) / 2, cz = (y0 + y1) / 2, hm = 1.05, toit = COUL.toits[i % 4];
    boite(w, hm, d, COUL.mur, cx, hm / 2, cz).receiveShadow = true;
    ajoute(new THREE.Mesh(prisme(w + .3, d + .3, .75), mat3(toit)), cx, hm, cz);
    boite(.22, .5, .22, COUL.terre, cx + w * .3, hm + .5, cz - d * .15);
    cases.filter(([, b]) => b === y1).forEach(([a]) => {
      if (G[y1][a] === "D") ajoute(new THREE.Mesh(new THREE.BoxGeometry(.36, .62, .06), mat3(COUL.porte)), a, .31, cz + d / 2 + .02, false);
      else ajoute(new THREE.Mesh(new THREE.BoxGeometry(.3, .28, .05), mat3(COUL.vitre, .8)), a, .62, cz + d / 2 + .02, false);
    });
  });
  // la cathédrale : une nef de pierre, une tour-clocher en façade avec sa flèche, une rosace et des vitraux allumés, des gargouilles aux coins
  blocsJ("EG").forEach(({ x0, x1, y0, y1 }) => {
    const cx = (x0 + x1) / 2, w = x1 - x0 + 1, d = y1 - y0 + 1, pierre = 0xcfc4b2, ardoise = 0x4f5a78, nef = d - 1.3, nz = y0 - .5 + nef / 2;
    boite(w * .62, 1.7, nef, pierre, cx, .85, nz).receiveShadow = true;
    ajoute(new THREE.Mesh(prisme(nef + .2, w * .62 + .3, 1.1), mat3(ardoise)), cx, 1.7, nz).rotation.y = Math.PI / 2;
    [-1, 1].forEach(s => { boite(w * .2, 1, nef - .4, 0xbdb2a0, cx + s * w * .41, .5, nz);
      for (let k = 0; k < 3; k++) boite(.05, .55, .24, [0xff8fa3, 0x9ad8ff, 0xffd36e][k], cx + s * (w * .31 + .02), 1.25, y0 + .3 + k * (nef - .6) / 2, .9); });
    const tz = y1 - .45; boite(1.7, 3.1, 1.5, pierre, cx, 1.55, tz).receiveShadow = true;
    const fleche = ajoute(new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.1, 4), mat3(ardoise)), cx, 3.1 + 1.05, tz); fleche.rotation.y = Math.PI / 4;
    ajoute(new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .06, 16), mat3(0xb48ee8, 1)), cx, 2.25, tz + .76, false).rotation.x = Math.PI / 2;
    boite(.56, .9, .06, COUL.porte, cx, .45, tz + .76);
    ajoute(new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .06, 12, 1, false, 0, Math.PI), mat3(COUL.porte)), cx, .9, tz + .76, false).rotation.set(Math.PI / 2, 0, Math.PI / 2);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const g = ajoute(new THREE.Mesh(new THREE.SphereGeometry(.15, 8, 6), mat3(0x7a7488)), cx + sx * .78, 3.15, tz + sz * .68); g.scale.set(1, .8, 1.4); });
  });
  // la cabane biscornue : tout y est de travers (murs penchés, toit trop grand, petite tour en chapeau pointu, cheminée tordue)
  blocsJ("Kk").forEach(({ x0, x1, y0, y1 }) => {
    const cx = (x0 + x1) / 2, cz = (y0 + y1) / 2, w = x1 - x0 + 1, d = y1 - y0 + 1, cab = new THREE.Group(), bois = 0x8c6a4a, toit = 0x5b3f78, face = (d - .4) / 2 + .03;
    const m = (geo, c, x, y, z, e) => { const o = new THREE.Mesh(geo, mat3(c, e)); o.position.set(x, y, z); o.castShadow = true; cab.add(o); return o; };
    m(new THREE.BoxGeometry(w - .5, 1.25, d - .4), bois, 0, .62, 0).rotation.z = .05;
    for (let k = 0; k < 4; k++) m(new THREE.BoxGeometry(w - .45, .05, .02), 0x6a4e36, 0, .2 + k * .3, face - .02).rotation.z = .05;
    const t1 = m(prisme(w + .2, d + .5, 1), toit, -.1, 1.22, 0); t1.rotation.z = -.07; t1.rotation.y = .04;
    const etage = m(new THREE.BoxGeometry(1.4, .95, 1.2), 0x7b5a40, .85, 2.05, -.1); etage.rotation.set(0, .28, -.1);
    m(new THREE.CylinderGeometry(.2, .2, .05, 14), COUL.vitre, .95, 2.1, .5, 1.2).rotation.x = Math.PI / 2;
    const chapeau = m(new THREE.ConeGeometry(1, 1.5, 7), 0x3d2a52, .95, 3.2, -.1); chapeau.rotation.z = .22;
    m(new THREE.ConeGeometry(.3, .6, 6), 0x3d2a52, 1.38, 3.95, -.1).rotation.z = .9;
    const ch1 = m(new THREE.BoxGeometry(.32, 1.1, .32), 0x9a5a4a, -1.5, 1.9, -.4); ch1.rotation.z = .18;
    m(new THREE.BoxGeometry(.3, .45, .3), 0x9a5a4a, -1.62, 2.6, -.4).rotation.z = -.3;
    m(new THREE.BoxGeometry(.52, .82, .06), COUL.porte, G[y1].indexOf("k") - cx, .41, face);
    [-1.45, 1.25].forEach(x => m(new THREE.BoxGeometry(.42, .36, .05), COUL.vitre, x, .78, face, 1).rotation.z = .12);
    [-.5, .55].forEach(x => m(new THREE.BoxGeometry(.08, .9, .08), 0x6a4e36, G[y1].indexOf("k") - cx + x, .45, d / 2 + .1));
    m(new THREE.BoxGeometry(1.4, .06, .55), toit, G[y1].indexOf("k") - cx, .95, d / 2 - .05).rotation.x = .3;
    cab.rotation.y = -.05; ajoute(cab, cx, 0, cz, false);
  });
  // le pont couvert de la forêt, rouge comme ceux de l'Oregon : toit et murs deviennent transparents quand on passe dessous
  const ponts = [];
  blocsJ("B").forEach(({ x0, x1, y0 }) => {
    const L = x1 - x0 + 1 + .5, cx = (x0 + x1) / 2, z = y0, mm = new THREE.MeshLambertMaterial({ color: 0xa8423a, transparent: true }), mt = new THREE.MeshLambertMaterial({ color: 0x5a3a2e, transparent: true });
    boite(L, .1, 1.05, COUL.bois, cx, -.02, z).receiveShadow = true;
    [-.5, .5].forEach(s => { const mur = ajoute(new THREE.Mesh(new THREE.BoxGeometry(L, .82, .07), mm), cx, .4, z + s); mur.userData.vivant = true; });
    const t = ajoute(new THREE.Mesh(prisme(L + .3, 1.35, .55), mt), cx, .81, z); t.userData.vivant = true;
    ponts.push({ x0, x1, z, mats: [mm, mt] });
  });
  anim.push(() => ponts.forEach(p => { const dans = JEU && JEU.x >= p.x0 - 1 && JEU.x <= p.x1 + 1 && Math.abs(JEU.y - p.z) <= 1, o = dans ? .22 : 1;
    p.mats.forEach(m => { m.opacity += (o - m.opacity) * .2; m.depthWrite = m.opacity > .9; }); }));
  // les mesas du désert : de hautes tables de roche rouge, en couches
  blocsJ("M").forEach(({ cases }) => { const h = 1.6 + rnd() * 1.2;
    cases.forEach(([x, y]) => { [0xb5532f, 0xd47a45, 0xc4643a].forEach((c, k) => boite(1, h / 3, 1, c, x, h / 6 + k * h / 3, y).receiveShadow = true); boite(1, .06, 1, 0xe8a066, x, h + .03, y); });
  });
  // les autres objets, case par case, dans le style de leur région
  const arbre = (x, y, z, s) => {
    const a = new THREE.Group(), o = (geo, c, px, py, pz) => { const m = new THREE.Mesh(geo, mat3(c)); m.position.set(px, py, pz); m.castShadow = true; a.add(m); return m; };
    const pin = (c1, c2, cap) => { o(new THREE.CylinderGeometry(.07, .1, .45, 6), COUL.tronc, 0, .22, 0);
      [[.46, .55, .5], [.36, .5, .8], [.24, .42, 1.08]].forEach(([r, hh, yy], k) => o(new THREE.ConeGeometry(r, hh, 8), cap && k === 2 ? COUL.neige : rnd() < .5 ? c1 : c2, 0, yy, 0)); };
    const rond = cs => { o(new THREE.CylinderGeometry(.07, .1, .45, 6), COUL.tronc, 0, .22, 0);
      [[.42, 0, .72, 0], [.3, -.16, .98, .08], [.26, .18, .92, -.06]].forEach(([r, ox, yy, oz]) => o(new THREE.SphereGeometry(r, 10, 7), cs[(rnd() * cs.length) | 0], ox, yy, oz)); };
    const mort = () => { o(new THREE.CylinderGeometry(.05, .1, 1, 5), 0x4a3a32, 0, .5, 0);
      [[.35, .7, .7], [-.4, .55, -.6], [.1, .85, 2.2]].forEach(([, yy, ry]) => { const b = o(new THREE.CylinderGeometry(.025, .04, .5, 4), 0x4a3a32, Math.sin(ry) * .14, yy, Math.cos(ry) * .14); b.rotation.set(Math.cos(ry) * .9, 0, -Math.sin(ry) * .9); }); };
    if (z === "foret") rnd() < .2 ? mort() : pin(0x1f4a3e, 0x2a5c4a);
    else if (z === "lande") neigeux(x, y) || y <= 7 && x <= 13 ? pin(0x2c6450, 0x3b7d5c, true) : rnd() < .55 ? pin(0x2c6450, 0x3b7d5c) : (o(new THREE.CylinderGeometry(.05, .07, .55, 6), 0xe8e4dc, 0, .27, 0), o(new THREE.SphereGeometry(.36, 10, 7), 0xa8c060, 0, .8, 0));
    else if (z === "bayou") {   // cyprès chauve : pied évasé, feuillage plat, mousse espagnole qui pend
      o(new THREE.CylinderGeometry(.08, .24, .95, 7), 0x6b4f3a, 0, .47, 0);
      [[.5, 1.0], [.38, 1.25]].forEach(([r, yy]) => o(new THREE.SphereGeometry(r, 10, 7), rnd() < .5 ? 0x5f7d3c : 0x6e8a44, 0, yy, 0).scale.y = .45);
      [0, 2.1, 4.2].forEach(ang => o(new THREE.ConeGeometry(.06, .45, 4), 0xa0ab88, Math.cos(ang) * .38, .78, Math.sin(ang) * .38).rotation.x = Math.PI);
    }
    else if (z === "cabane") rnd() < .45 ? pin(0x2c6450, 0x3b7d5c) : rond([0xd9822b, 0xc9573f, 0xe3a73a]);
    else if (z === "desert") mort();
    else rnd() < .65 ? pin(0x2c6450, 0x3b7d5c) : rond([0x7fb85c, 0x9cc96b]);
    a.scale.setScalar(s); a.rotation.y = rnd() * 6; return a;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = G[y][x], z = zoneJ(x, y), jx = (rnd() - .5) * .16, jz = (rnd() - .5) * .16, s = .85 + rnd() * .3;
    if (ch === "T") ajoute(arbre(x, y, z, s), x + jx, 0, y + jz, false);
    if (ch === "#") { const r = ajoute(new THREE.Mesh(new THREE.DodecahedronGeometry(.36, 1), mat3(z === "desert" ? 0xc77a4a : COUL.rocher)), x + jx, .16, y + jz); r.scale.set(s, .72 * s, s); r.rotation.y = rnd() * 6; }
    if (ch === "A") {   // une montagne au sommet enneigé
      const h = 1.6 + rnd() * 1.4, r = .78, cap = h * .38;
      ajoute(new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat3(rnd() < .5 ? 0x7d8399 : 0x8d93a8)), x + jx, h / 2, y + jz).rotation.y = rnd() * 3;
      ajoute(new THREE.Mesh(new THREE.ConeGeometry(r * cap / h * 1.06, cap, 7), mat3(COUL.neige)), x + jx, h - cap / 2 + .01, y + jz, false);
    }
    if (ch === "c") {   // un cactus à deux bras
      const g = new THREE.Group(), v = 0x5f9a5a, p = (geo, px, py, rz) => { const m = new THREE.Mesh(geo, mat3(v)); m.position.set(px, py, 0); m.rotation.z = rz || 0; m.castShadow = true; g.add(m); };
      p(new THREE.CapsuleGeometry(.12, .7, 4, 8), 0, .5); p(new THREE.CapsuleGeometry(.07, .22, 4, 6), -.2, .62); p(new THREE.CapsuleGeometry(.07, .18, 4, 6), .2, .5);
      p(new THREE.CapsuleGeometry(.06, .12, 4, 6), -.12, .48, Math.PI / 2); p(new THREE.CapsuleGeometry(.06, .1, 4, 6), .12, .38, Math.PI / 2);
      g.rotation.y = rnd() * 6; g.scale.setScalar(s); ajoute(g, x + jx, 0, y + jz, false);
    }
    if (ch === "t") {   // une tombe : pierre arrondie ou croix, un peu penchée
      const g = new THREE.Group(), gris = rnd() < .5 ? 0x9a98a8 : 0x86849a, p = (geo, py) => { const m = new THREE.Mesh(geo, mat3(gris)); m.position.set(0, py, 0); m.castShadow = true; g.add(m); return m; };
      if (rnd() < .6) { p(new THREE.BoxGeometry(.48, .45, .14), .22); p(new THREE.CylinderGeometry(.24, .24, .14, 12, 1, false, 0, Math.PI), .45).rotation.set(Math.PI / 2, 0, Math.PI / 2); }
      else { p(new THREE.BoxGeometry(.1, .7, .1), .35); p(new THREE.BoxGeometry(.42, .1, .1), .5); }
      p(new THREE.BoxGeometry(.6, .06, .5), .03);
      g.rotation.set((rnd() - .5) * .15, (rnd() - .5) * .3, (rnd() - .5) * .2); ajoute(g, x, 0, y, false);
    }
    if (ch === "u") {   // une citrouille, parfois allumée
      const allumee = rnd() < .5, c = ajoute(new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), mat3(0xe0782a, allumee ? .45 : 0)), x + jx, .17, y + jz); c.scale.y = .72;
      boite(.05, .12, .05, 0x5a7a3a, x + jx, .36, y + jz);
    }
    if (ch === "o") {
      const p = ajoute(new THREE.Mesh(new THREE.CapsuleGeometry(.2, .85, 4, 8), mat3(COUL.pierre)), x, .62, y); p.scale.set(1.1, 1, .7); p.rotation.set((rnd() - .5) * .12, rnd() * 3, (rnd() - .5) * .12);
      const r = ajoute(new THREE.Mesh(new THREE.BoxGeometry(.12, .2, .02), new THREE.MeshLambertMaterial({ color: COUL.rune, emissive: COUL.rune })), x, .75, y + .16, false); r.userData.vivant = true;
      anim.push(t => { r.material.emissiveIntensity = .4 + Math.sin(t / 500 + x) * .3; });
    }
    if (ch === "f") {   // barrière en bois, grille en fer noir autour du cimetière
      const g = new THREE.Group(), c = z === "foret" ? 0x3a3540 : COUL.bois;
      [-.38, .38].forEach(o => { const pt = new THREE.Mesh(new THREE.BoxGeometry(.1, .5, .1), mat3(c)); pt.position.set(o, .25, 0); pt.castShadow = true; g.add(pt); });
      [.2, .38].forEach(hh => { const r = new THREE.Mesh(new THREE.BoxGeometry(1, .07, .05), mat3(c)); r.position.y = hh; r.castShadow = true; g.add(r); });
      if (!(G[y][x - 1] === "f" || G[y][x + 1] === "f")) g.rotation.y = Math.PI / 2; ajoute(g, x, 0, y, false);
    }
    if (ch === "L") {
      boite(.08, 1.35, .08, COUL.lampe, x, .67, y);
      ajoute(new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), mat3(COUL.lumiere, 1.6)), x, 1.42, y, false);
      lampes.push([x, y]);
    }
    if (ch === "p") {   // un passage entre deux régions : une arche de bois avec deux lanternes
      const g = new THREE.Group(), bois = 0x6e4a32, o = (geo, c, px, py, e) => { const m = new THREE.Mesh(geo, mat3(c, e)); m.position.set(px, py, 0); m.castShadow = !e; g.add(m); return m; };
      [-.46, .46].forEach(px => { o(new THREE.BoxGeometry(.12, 1.35, .12), bois, px, .67); o(new THREE.BoxGeometry(.13, .18, .13), COUL.lumiere, px * .82, 1.02, 1.4); });
      o(new THREE.BoxGeometry(1.2, .12, .16), bois, 0, 1.38);
      const t = o(prisme(1.35, .5, .3), 0x5b3f78, 0, 1.44); t.castShadow = true;
      if (!libreJ(x - 1, y) && !libreJ(x + 1, y)) g.rotation.y = 0; else g.rotation.y = Math.PI / 2;
      ajoute(g, x, 0, y, false);
    }
    if (ch === "S") {
      boite(.08, .6, .08, COUL.tronc, x, .3, y);
      boite(.6, .34, .07, COUL.bois, x, .62, y + .02);
    }
    if (ch === "b") {   // planches de bois, avec des garde-fous sur les côtés
      boite(.98, .08, .98, COUL.bois, x, -.02, y).receiveShadow = true;
      const long = "bB".includes(tuileJ(x - 1, y)) || "bB".includes(tuileJ(x + 1, y));
      if (long) { if (!"bB".includes(tuileJ(x, y - 1))) boite(1, .3, .06, COUL.tronc, x, .13, y - .46); if (!"bB".includes(tuileJ(x, y + 1))) boite(1, .3, .06, COUL.tronc, x, .13, y + .46); }
      else { if (!"bB".includes(tuileJ(x - 1, y))) boite(.06, .3, 1, COUL.tronc, x - .46, .13, y); if (!"bB".includes(tuileJ(x + 1, y))) boite(.06, .3, 1, COUL.tronc, x + .46, .13, y); }
    }
  }
  // des lucioles au-dessus du bayou
  const luc = []; for (let y = 14; y < H; y++) for (let x = 31; x < W; x++) if (rnd() < .12) luc.push(x + rnd() - .5, .4 + rnd() * .8, y + rnd() - .5);
  if (luc.length) {
    const gl = new THREE.BufferGeometry(), base = luc.slice(); gl.setAttribute("position", new THREE.Float32BufferAttribute(luc, 3));
    const pts = new THREE.Points(gl, new THREE.PointsMaterial({ color: 0xfff3a0, size: 5, sizeAttenuation: false, transparent: true, opacity: .9 })); pts.userData.vivant = true; groupe.add(pts);
    anim.push(t => { const a = gl.attributes.position.array; for (let i = 0; i < a.length; i += 3) { a[i + 1] = base[i + 1] + Math.sin(t / 600 + i) * .15; a[i] = base[i] + Math.sin(t / 900 + i * 2) * .1; }
      gl.attributes.position.needsUpdate = true; pts.material.opacity = .4 + .5 * Math.abs(Math.sin(t / 400)); });
  }
  fusionnerJ(groupe); R.scene.add(groupe);
  return R.ile = { groupe, anim, lampes };
}
function fusionnerJ(groupe) {   // les objets immobiles de même couleur fondus ensemble, par morceaux de l'île : bien moins de travail pour le téléphone
  groupe.updateMatrixWorld(true);
  const lots = new Map(), vieux = [], centre = new THREE.Vector3();
  groupe.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.userData.vivant) return;
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld); g.deleteAttribute("uv"); if (!g.index) return;
    g.computeBoundingBox(); g.boundingBox.getCenter(centre);
    const cle = o.material.uuid + "/" + Math.floor(centre.x / 11) + "/" + Math.floor(centre.z / 10);
    if (!lots.has(cle)) lots.set(cle, { mat: o.material, g: [], ombre: false }); const e = lots.get(cle); e.g.push(g); e.ombre = e.ombre || o.castShadow; vieux.push(o); });
  vieux.forEach(o => o.parent.remove(o));
  lots.forEach(({ mat, g, ombre }) => { const m = new THREE.Mesh(mergeGeometries(g), mat); m.castShadow = ombre; m.receiveShadow = true; groupe.add(m); });
}
// ---------- le décor dessiné (flat design) : le sol en tuiles, et chaque objet est une image posée debout, face à la caméra ----------
// Les images viennent de 3 planches : jeu-sols.webp (les tuiles de sol de chaque zone, voir SOLS), jeu-decor.webp (les objets, voir ATLAS_DECOR)
// et jeu-nature.webp (les arbres et plantes de chaque zone : <zone>_a1…a8 grands, <zone>_p1…p4 petits).
// La caméra est inclinée comme sur les dessins (le losange d'une tuile est 0,675 fois moins haut que large).
const HAUT_CAM = { flat: 9.15, volumes: 10.5 };   // flat : la pente des terrains peints (losange 0,543)
// jeu-sols.webp : une ligne par zone (tirée de son terrain peint), 7 tuiles par ligne
const SOLS_ZONE = ["village", "foret", "cabane", "desert", "lande", "bayou"], SOLS = ["sol", "sol2", "chemin", "paves", "eau", "planches", "neige"];
// chaque objet : sa hauteur (en cases) et, s'il le faut, de combien son pied descend sous le centre de la case
const TAILLE_DECOR = { sapin: 2.4, sapinneige: 2.4, bouleau: 2.2, automne: 2.2, mort: 1.9, cypres: 2.5, fleuri: .8, rocher: .85, rune: 1.1, bruyere: .5, champignons: .5,
  montagne: 2.3, tronc: .6, roseaux: .65, nenuphar: .35, cactus: 1.3, petitcactus: .7, falaise: 1.25, tombe: .75, croix: .85, grille: .9, citrouille: .55, lampadaire: 1.6,
  souche: .55, arche: 2, panneau: 1, barriere: .75, banc: .6, puits: 1.2, tonneau: .6, caisse: .6, boite: .9, epouvantail: 1.3, lanterne: .7, panier: .45, fontaine: 1,
  lac_rocher: .9, lac_souche: .7, lac_panneau: 1.1, lac_lanterne: 1.5, lac_banc: 1.3, lac_barque: 1, lac_buches: .7, lac_cairn: 1 };   // le lac (planches de Sam, 17/10)
const OBJETS_LAC = ["lac_rocher", "lac_souche", "lac_buches", "lac_cairn"];
const JEUX_PARC = ["toboggan", "balancoire", "tourniquet", "bacasable", "cheval", "tour", "tapecul", "dome"];   // quand la planche du parc sera là
const PROPS_VILLAGE = ["puits", "fontaine", "tonneau", "caisse", "banc", "boite", "epouvantail", "lanterne", "panier"];
const CACHETTE_FLAT = { foret: "cach_foret", lande: "cach_lande", village: "cach_village", desert: "cach_desert", bayou: "cach_bayou", cabane: "cach_cabane" };
// les arbres d'une zone : surtout ses grands arbres, parfois un petit (buisson, rocher, souche)
const ARBRES = { // foret : ni arbres tordus (1, 5) ni sorbier à baies rouges (4), demandé par Sam le 18/10
  cabane: [1, 2, 3, 4, 5, 6, 7, 8], desert: [2, 3, 6, 8], lande: [2, 4, 5, 7, 8], bayou: [1, 2, 3, 4, 5, 6, 7, 8], foret: [2, 3, 6, 7, 8], village: [1, 2, 3, 4, 5, 6] };
const NEIGE_LANDE = [1, 3, 6];
function arbreJ(z, neige, r, r2) {
  if (typeof ATLAS_DECOR === "undefined" || !ATLAS_DECOR[z + "_a1"]) return z === "desert" ? "cactus" : "sapin";
  if (r < .14 && z !== "foret") return z + "_p" + (1 + Math.floor(r2 * 4));   // au lac, un « T » est toujours un arbre (le bois de Sam)
  const l = z === "lande" && neige ? NEIGE_LANDE : ARBRES[z]; return z + "_a" + l[Math.floor(r2 * l.length)];
}
const CACTUS_DESERT = ["desert_a1", "desert_a4", "desert_a5", "desert_a7"];
const SIN_CAM = .543;   // un écart au sol (dx + dz) / √2 se voit SIN_CAM fois plus court à l'écran, en hauteur
function chargerFlat(R) {   // les 3 planches du décor ; si l'une manque, on garde l'île en volumes
  R.flat = "attente"; R.tFlat = performance.now(); let n = 0;
  const L = new THREE.TextureLoader(), ok = () => { if (++n === 3 + MONDE.iles.length && R.flat === "attente") R.flat = "ok"; }, non = () => { R.flat = "non"; };
  R.texSol = L.load(IMG_JEU + "jeu-sols.webp", t => { t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4; t.needsUpdate = true; ok(); }, undefined, non);
  R.texDecor = L.load(IMG_JEU + "jeu-decor.webp", t => { t.colorSpace = THREE.SRGBColorSpace; ok(); }, undefined, non);
  R.texIles = MONDE.iles.map(d => L.load(IMG_JEU + d.image, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; ok(); }, undefined, non));
  R.texNature = L.load(IMG_JEU + "jeu-nature.webp", t => { t.colorSpace = THREE.SRGBColorSpace; ok(); }, undefined, non);   // les arbres de chaque zone
  R.matsFlat = [];   // tous les matériaux dessinés : on les teinte la nuit
}
function matDecor(R, nom, miroir, fondu) {   // un matériau par objet (et par sens, et estompé quand il cache le héros)
  const cle = nom + (miroir ? "/m" : "") + (fondu ? "/f" : ""); R.mats = R.mats || {};
  if (R.mats[cle]) return R.mats[cle];
  const [x, y, w, h, nat] = ATLAS_DECOR[nom], [W, H] = nat ? ATLAS_DECOR.taille2 : ATLAS_DECOR.taille, t = (nat ? R.texNature : R.texDecor).clone();
  t.repeat.set((miroir ? -w : w) / W, h / H); t.offset.set((miroir ? x + w : x) / W, 1 - (y + h) / H); t.needsUpdate = true;
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: .04, depthWrite: false, opacity: fondu ? .4 : 1 });
  R.matsFlat.push(m); return R.mats[cle] = m;
}
function poserDecor(R, groupe, nom, x, z, o = {}) {   // une image debout ; o.haut = hauteur (cases), o.large = largeur, o.pied = descente du pied
  const [, , w, h] = ATLAS_DECOR[nom], s = new THREE.Sprite(matDecor(R, nom, o.miroir));
  const H = o.large ? o.large * h / w : (o.haut || TAILLE_DECOR[nom] || (/_a\d$/.test(nom) ? 2.3 : 1)) * (o.varie || 1), Wd = H * w / h, pied = o.pied === undefined ? .18 : o.pied;
  s.scale.set(Wd, H, 1); s.center.set(.5, pied * SIN_CAM / H); s.position.set(x, 0, z);   // le bas de l'image descend de « pied » sous le centre de la case
  s.userData = { nom, miroir: !!o.miroir, x, z, haut: H }; groupe.add(s); return s;
}
function dioramaFlat() {
  const R = moteurJeu(); if (R.ile) return R.ile;
  const G = CARTE, groupe = new THREE.Group(), anim = [], rnd = hasard(311), devant = [];
  const neigeux = (x, y) => G[y][x] === "n" || autour(x, y, "n") >= 3;
  // le sol : un carré par case, rangés du fond vers l'avant (on les dessine dans cet ordre, sans profondeur)
  const pos = [], uv = [], e = .004;
  const sol = (x, y) => { const ch = G[y][x], z = zoneJ(x, y), Z = SOLS_ZONE.indexOf(z), c = k => [Z, SOLS.indexOf(k)];   // [ligne de la zone, tuile]
    if (ch === "~") return c("eau");
    if ("bB".includes(ch)) return c("planches");
    if ("=pPGk".includes(ch)) return z === "village" ? c("paves") : c("chemin");
    if ("EGRHD".includes(ch) && z === "village") return c("paves");
    if (neigeux(x, y)) return [SOLS_ZONE.indexOf("lande"), SOLS.indexOf("neige")];
    return c(ch === "*" || rnd() < .3 ? "sol2" : "sol"); };
  MONDE.iles.forEach((d, n) => {   // l'image entière de l'île, posée à plat : chaque pixel retombe sur sa case
    const m = (px, py) => { const a = (px - d.X0) / d.hw, b = (py - d.Y0) / d.hh - 1; return [(a + b) / 2 - d.i0 + d.ox, 0, (b - a) / 2 - d.j0 + d.oy]; };
    const C = [m(0, 0), m(d.W, 0), m(d.W, d.H), m(0, d.H)], U = [[0, 1], [1, 1], [1, 0], [0, 0]], pos = [], uv = [];
    [0, 2, 1, 0, 3, 2].forEach(k => { pos.push(...C[k]); uv.push(...U[k]); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    const mt = new THREE.MeshBasicMaterial({ map: R.texIles[n], transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }); R.matsFlat.push(mt);
    const ms = new THREE.Mesh(g, mt); ms.renderOrder = -11; ms.frustumCulled = false; ms.userData.ile = d.zone; groupe.add(ms);
  });
  const cases = []; for (let y = 0; y < HAUT; y++) for (let x = 0; x < LARG; x++) if (G[y][x] === "b") cases.push([x, y]);
  cases.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
  cases.forEach(([x, y]) => {
    const [l, k] = sol(x, y), nc = SOLS.length, nl = SOLS_ZONE.length, u0 = k / nc + e, u1 = (k + 1) / nc - e, v0 = l / nl + e, v1 = (l + 1) / nl - e;
    const vert = "b".includes(tuileJ(x, y - 1)) || "b".includes(tuileJ(x, y + 1)), c = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], q = k => c[(k + (vert ? 1 : 0)) % 4];   // les planches en travers du pont
    const P = [[x - .5, 0, y - .5], [x + .5, 0, y - .5], [x + .5, 0, y + .5], [x - .5, 0, y + .5]];
    [0, 2, 1, 0, 3, 2].forEach(k => { pos.push(...P[k]); uv.push(...q(k)); });
  });
  const gs = new THREE.BufferGeometry(); gs.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gs.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const ms = new THREE.MeshBasicMaterial({ map: R.texSol, depthWrite: false, depthTest: false }); R.matsFlat.push(ms);
  const msol = new THREE.Mesh(gs, ms); msol.renderOrder = -10; msol.frustumCulled = false; groupe.add(msol);
  // les objets
  const pose = (nom, x, z, o) => { const s = poserDecor(R, groupe, nom, x, z, o); if (s.userData.haut > 1.1) devant.push(s); return s; };
  const lampes = [], lueur = (x, z, h) => lampes.push({ x, z, h });
  const PEINTES = new Set(MONDE.iles.filter(i => i.peint).map(i => i.zone));
  for (let y = 0; y < HAUT; y++) for (let x = 0; x < LARG; x++) {
    const ch = G[y][x], z = zoneJ(x, y), r = rnd(), m = rnd() < .5;
    if (ch === "T") {
      if (z === "village" && r < .22 && autour(x, y, "=.,*") >= 3) pose(PROPS_VILLAGE[Math.floor(rnd() * PROPS_VILLAGE.length)], x, y, { miroir: m });
      else { const n = arbreJ(z, neigeux(x, y) || autour(x, y, "nA"), r, rnd()), pt = n.includes("_p");
        pose(n, x + (rnd() - .5) * .3, y + (rnd() - .5) * .3, { miroir: m, varie: (.85 + rnd() * .3) * 1.3, haut: pt ? .9 : undefined }); }
    }
    else if (ch === "A") pose("montagne", x, y, { miroir: m, haut: 2 + rnd() * .6 });
    else if (ch === "M") pose("falaise", x, y, { miroir: m, haut: 1.1 + rnd() * .3 });
    else if (ch === "#" && PEINTES.has(z)) { }   // les rochers sont déjà peints sur les cartes en cube
    else if (ch === "#") pose(z === "desert" ? "falaise" : "rocher", x, y, { miroir: m, haut: z === "desert" ? .8 : .85 });
    else if (ch === "g") { const q = portailEn(x, y); pose("arche", x, y, { miroir: !!q && q.ay === y, pied: .05, haut: 2.2 }); }   // l'arche s'ouvre face au chemin : son image passe en y (bas-gauche), retournée en x
    else if (ch === "o") { const k = (x * 7 + y * 3) % 6 + 1; z === "foret" && ATLAS_DECOR.menhir6 ? pose("menhir" + k, x, y, { miroir: m, haut: 2.8 * ATLAS_DECOR["menhir" + k][3] / 300 }) : pose("rune", x, y, { miroir: m }); }
    else if (ch === "O") pose(OBJETS_LAC[Math.floor(r * 4)], x, y, { miroir: m });
    else if (ch === "J") pose("lac_banc", x, y, { miroir: tuileJ(x, y + 1) !== "~" });   // face au lac : son image regarde vers le bas-gauche (y + 1), retournée vers le bas-droite (x + 1)
    else if (ch === "c") pose(ATLAS_DECOR.desert_a1 ? (r < .75 ? CACTUS_DESERT[Math.floor(rnd() * 4)] : "desert_p" + (1 + Math.floor(rnd() * 4))) : r < .6 ? "cactus" : "petitcactus", x, y, { miroir: m, haut: ATLAS_DECOR.desert_a1 ? (r < .75 ? 1.5 : .7) : undefined });
    else if (ch === "t") pose(r < .6 ? "tombe" : "croix", x, y, { miroir: m });
    else if (ch === "u") pose("citrouille", x, y, { miroir: m });
    else if (ch === "j") { const l = JEUX_PARC.filter(n => ATLAS_DECOR[n]); pose(l.length ? l[Math.floor(rnd() * l.length)] : ["banc", "tonneau", "lanterne"][Math.floor(rnd() * 3)], x, y, { miroir: m }); }
    else if (ch === "S") pose(z === "foret" && ATLAS_DECOR.lac_panneau ? "lac_panneau" : "panneau", x, y, { miroir: m });
    else if (ch === "L" && z === "foret" && ATLAS_DECOR.lac_lanterne) { pose("lac_lanterne", x, y, { miroir: m }); lueur(x, y, 1); }
    else if (ch === "L") { pose("lampadaire", x, y); lueur(x, y, 1.35); }
    else if (ch === "f") pose(z === "foret" ? "grille" : "barriere", x, y, { miroir: "fT".includes(tuileJ(x, y - 1)) || "fT".includes(tuileJ(x, y + 1)) });
    else if (ch === "p") { pose("arche", x, y, { miroir: libreSol(x - 1, y) && libreSol(x + 1, y) && !(libreSol(x, y - 1) && libreSol(x, y + 1)), pied: .05 }).userData.passage = true; }
    else if (ch === "," && (z === "lande" || z === "cabane")) pose("bruyere", x + (rnd() - .5) * .3, y + (rnd() - .5) * .3, { miroir: m, haut: .4 + rnd() * .2 });
    else if (ch === "," && z === "bayou") pose("roseaux", x, y, { miroir: m });
    else if (ch === "," && z === "foret") pose("foret_p1", x + (rnd() - .5) * .4, y + (rnd() - .5) * .4, { miroir: m, haut: .75 + rnd() * .3 });   // les bruyères : que des violettes, plus grosses (18/10)
    else if (ch === ";" && z === "foret") pose("foret_p2", x + (rnd() - .5) * .4, y + (rnd() - .5) * .4, { miroir: m, haut: .5 + rnd() * .25 });   // l'ajonc jaune, un peu partout
    else if (ch === "~" && z === "bayou" && r < .12) pose("nenuphar", x, y, { miroir: m, pied: 0 });
  }
  // les bâtiments : une image pour tout le bloc de cases (maison, cathédrale, cabane, ranch, pont couvert)
  batimentsJ().forEach(({ b, nom, w, d, large }) => {
    const s = poserDecor(R, groupe, nom, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, { large, pied: large * .486, miroir: nom === "pont" && d > w });
    s.userData.bloc = b; devant.push(s);
  });
  // la nuit, les lampadaires brillent
  const halo = halosJ(); lampes.forEach(l => { const s = new THREE.Sprite(halo); s.scale.set(1.6, 1.6, 1); s.position.set(l.x, l.h, l.z); s.renderOrder = 2; groupe.add(s); });
  // le bois Biscornu brille : des lueurs turquoise, violettes et roses (champignons, mousses, lucioles) qui respirent doucement
  const lueurs = [0x4ff3e0, 0x9a7bff, 0xff7ad9].map(c => lueurJ(c));
  for (let y = 0; y < HAUT; y++) for (let x = 0; x < LARG; x++) if (zoneJ(x, y) === "cabane" && G[y][x] !== " " && rnd() < ((TUILES[G[y][x]] || {}).libre ? .045 : .03)) {
    const m = lueurs[Math.floor(rnd() * 3)].clone(), s = new THREE.Sprite(m), t = .8 + rnd() * .7, ph = rnd() * 7, h = rnd() < .5 ? .08 : .4 + rnd() * .9;
    s.scale.set(t, t, 1); s.position.set(x + (rnd() - .5) * .8, h, y + (rnd() - .5) * .8); s.renderOrder = 3; groupe.add(s);
    anim.push(tt => { m.opacity = Math.min(1, moteurJeu().nuit || 0) * (.6 + .4 * Math.sin(tt / 900 + ph)); });
  }
  const vx = vortexJ(R); if ((MONDE.portails || []).length) anim.push(vx.tourner);
  (MONDE.portails || []).forEach((q, i) => {   // les portails : un vortex de couleur tourne dans l'arche, et une lueur respire autour
    const [, , aw, ah] = ATLAS_DECOR.arche, H = 2.2, v = new THREE.Sprite(vx.mat); v.scale.set(H * aw / ah, H, 1); v.center.set(.5, .05 * SIN_CAM / H);
    if (q.ay === q.y) v.scale.x *= -1;   // arche retournée (voir « g » dans decorJ) : le vortex aussi
    v.position.set(q.x, 0, q.y); v.renderOrder = -1; groupe.add(v);   // derrière l'arche : ses piliers le bordent
    const m = lueurJ(0x4ff3e0).clone(), s = new THREE.Sprite(m); s.scale.set(2.4, 2.4, 1); s.position.set(q.x, .9, q.y); s.renderOrder = 3; groupe.add(s);
    anim.push(tt => { m.opacity = .35 + .2 * Math.sin(tt / 500 + i); });
  });
  R.scene.add(groupe);
  return R.ile = { groupe, anim, lampes: [], devant, flat: true };
}
function vueZoneJ(R, d) {   // on ne voit que l'île où l'on est (17/10) : les autres restent cachées, même au bord
  const z = zoneJ(JEU.x, JEU.y);
  if (R.vueZone !== z) { R.vueZone = z;
    d.groupe.children.forEach(o => { const u = o.userData; if (u.zoneVue === undefined) u.zoneVue = u.ile || zoneJ(Math.round(o.position.x), Math.round(o.position.z)); o.visible = u.zoneVue === z; }); }
  (R.cach || []).forEach(c => c.g.visible = zoneJ(c.q.x, c.q.y) === z);
  (R.pnj || []).forEach(({ n, g }) => g.visible = n.zone === z);
  if (R.bateau && JEU.bateau) R.bateau.visible = zoneJ(JEU.bateau.x, JEU.bateau.y) === z;
}
function vortexJ(R) {   // le vortex des portails : une spirale turquoise, rose et violette dessinée dans l'ouverture de l'arche (même cadre que son image)
  if (R.vortex) return R.vortex;
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 255; const g = cv.getContext("2d"), t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }); R.matsFlat.push(mat);
  const cx = 136, cy = 130, rx = 44, ry = 62, bras = ["#4ff3e0", "#ff7ad9", "#9a7bff"];   // l'ouverture de l'arche, en pixels de son image
  let tPrec = -1e9;
  const tourner = tt => { if (tt - tPrec < 33) return; tPrec = tt;   // 30 images par seconde suffisent
    g.clearRect(0, 0, 256, 255); g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
    const f = g.createRadialGradient(cx, cy, 2, cx, cy, ry); f.addColorStop(0, "#fff6ff"); f.addColorStop(.25, "#b45cff"); f.addColorStop(.7, "#3a1f7a"); f.addColorStop(1, "#1fb7c9");
    g.fillStyle = f; g.fillRect(0, 0, 256, 255);
    g.translate(cx, cy); g.scale(rx / ry, 1); g.rotate(-tt / 420); g.lineCap = "round";
    bras.forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 7; g.globalAlpha = .85; g.beginPath();
      for (let a = 0; a < 7.5; a += .15) { const r = 3 + a * 8.2, b = a + k * Math.PI * 2 / 3; a ? g.lineTo(Math.cos(b) * r, Math.sin(b) * r) : g.moveTo(Math.cos(b) * r, Math.sin(b) * r); }
      g.stroke(); });
    g.restore(); t.needsUpdate = true; };
  tourner(0);
  return R.vortex = { mat, tourner };
}
function lueurJ(c) {   // un petit rond de lumière colorée, qui s'ajoute à l'image
  const R = moteurJeu(), k = "lueur" + c; if (R[k]) return R[k];
  const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"), d = g.createRadialGradient(32, 32, 0, 32, 32, 32), o = new THREE.Color(c);
  const rgb = `${Math.round(o.r * 255)},${Math.round(o.g * 255)},${Math.round(o.b * 255)}`;
  d.addColorStop(0, `rgba(255,255,255,.95)`); d.addColorStop(.18, `rgba(${rgb},.8)`); d.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = d; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return R[k] = new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0 });
}
function halosJ() {   // un rond de lumière jaune, doux, qui s'ajoute à l'image (la nuit seulement)
  const R = moteurJeu(); if (R.halo) return R.halo;
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  d.addColorStop(0, "rgba(255,226,140,.9)"); d.addColorStop(.4, "rgba(255,200,90,.35)"); d.addColorStop(1, "rgba(255,190,80,0)"); g.fillStyle = d; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return R.halo = new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0 });
}
function dioramaJ() {   // l'île : dessinée si les planches sont là, sinon en volumes
  const R = moteurJeu(); if (R.ile) return R.ile;
  if (R.flat === undefined) chargerFlat(R);
  if (R.flat === "attente" && performance.now() - R.tFlat > 8000) R.flat = "non";
  if (R.flat === "attente") return null;
  if (R.flat === "ok") { R.rendu.shadowMap.enabled = false; R.heros.userData.lueur.visible = false; return dioramaFlat(); }
  return dioramaVolumes();
}
function estomperJ(R, d, fx, fy) {   // un arbre ou une maison qui cache le héros devient transparent, pour qu'on le voie toujours
  const hx = (fx - fy) / Math.SQRT2, hy = (fx + fy) / Math.SQRT2 * SIN_CAM, hp = fx + fy;   // le héros à l'écran (y vers le bas)
  d.devant.forEach(s => {
    const u = s.userData, sx = (u.x - u.z) / Math.SQRT2, bas = (u.x + u.z) / Math.SQRT2 * SIN_CAM + s.center.y * s.scale.y, haut = bas - s.scale.y;
    const cache = u.x + u.z > hp + .01 && Math.abs(sx - hx) < s.scale.x * .42 + .25 && haut < hy - .1 && bas > hy - 1.1;
    const m = matDecor(R, u.nom, u.miroir, cache); if (s.material !== m) s.material = m;
  });
}
// ---------- les habitants et les cachettes, posés sur l'île (ils bougent, ils ne sont pas fondus avec le décor) ----------
function habitantsJ(R) {
  if (R.pnj) return R.pnj;
  R.pnj = PNJ.map(n => {   // un petit personnage tout rond, avec un chapeau à sa couleur
    const g = new THREE.Group(), c = new THREE.Group(), o = (geo, col, x, y, z) => { const m = new THREE.Mesh(geo, mat3(col)); m.position.set(x, y, z); m.castShadow = true; c.add(m); return m; };
    o(new THREE.CapsuleGeometry(.24, .2, 6, 12), n.corps, 0, .38, 0);
    o(new THREE.SphereGeometry(.22, 14, 10), COUL.peau, 0, .8, 0);
    o(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, -.08, .83, .2); o(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, .08, .83, .2);
    o(new THREE.CylinderGeometry(.34, .34, .04, 16), n.chapeau, 0, .98, 0); o(new THREE.ConeGeometry(.2, .32, 12), n.chapeau, 0, 1.15, 0).rotation.z = .15;
    g.add(c); g.scale.setScalar(.85); g.position.set(n.x, 0, n.y); R.scene.add(g); return { n, g, c };   // à la taille du héros
  });
  return R.pnj;
}
const STYLE_CACHETTE = { foret: [0x2a5c4a, 0x1f4a3e], lande: [0x9a6fb0, 0x87a05a], village: [0x5e9a4e, 0x79a85f], desert: [0xb08850, 0x9a7444], bayou: [0x8a9a4a, 0x6e8a44], cabane: [0xd9822b, 0xc9573f] };
function cachettesJ3D(R, t) {   // un buisson par créature encore cachée : il frémit quand on approche, et deux yeux brillent de temps en temps
  const l = ciblesJ(), cle = l.map(q => q.k + q.x + "," + q.y).join("|");
  if (R.cleCach !== cle) {
    (R.cach || []).forEach(c => R.scene.remove(c.g)); R.cleCach = cle;
    R.cach = l.map(q => {
      const z = zoneJ(q.x, q.y), neige = tuileJ(q.x, q.y) === "n", [c1, c2] = neige ? [COUL.neige, COUL.neige2] : STYLE_CACHETTE[z], g = new THREE.Group(), b = new THREE.Group();
      [[.36, 0, .3, 0, c1], [.28, -.24, .24, .12, c2], [.27, .24, .25, -.08, c2], [.22, .05, .55, .05, c1]].forEach(([r, x, y, zz, c]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), mat3(c)); m.position.set(x, y, zz); m.castShadow = true; b.add(m); });
      if (z === "bayou") for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(.04, .6, 4), mat3(0xb8a46a)); m.position.set(-.25 + i * .12, .45, -.1); m.rotation.z = (i - 2) * .12; b.add(m); }
      const yeux = new THREE.Group(); [-.09, .09].forEach(x => { const m = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), mat3(0xffe14a, 1.6)); m.position.set(x, .36, .33); yeux.add(m); }); b.add(yeux);
      const etincelles = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(.045), mat3(0xfff3a0, 1.4)); g.add(m); return m; });
      b.scale.setScalar(1.2); g.add(b); g.position.set(q.x, 0, q.y); R.scene.add(g);
      return { q, g, b, yeux, etincelles, phase: Math.random() * 6 };
    });
  }
  R.cach.forEach(c => {   // tout près : le buisson tremble ; les yeux clignent ; de petites étincelles tournent autour
    const d = Math.abs(c.q.x - JEU.x) + Math.abs(c.q.y - JEU.y), fort = JEU.revele && JEU.revele.q === c.q || (JEU.revele && JEU.revele.q.k === c.q.k);
    c.b.rotation.z = Math.sin(t / 70 + c.phase) * (fort ? .12 : d <= 3 ? .07 : .025);
    c.yeux.visible = fort || Math.sin(t / 900 + c.phase) > .75;
    c.etincelles.forEach((e, i) => { const a = t / 600 + i * 2.1 + c.phase; e.position.set(Math.cos(a) * .45, .5 + Math.sin(t / 300 + i) * .15, Math.sin(a) * .45); e.rotation.y = t / 300; });
  });
}
function cachettesFlat(R, t) {   // un buisson dessiné par créature encore cachée : il frémit quand on approche, deux yeux brillent dans le trou
  const l = ciblesJ(), cle = l.map(q => q.k + q.x + "," + q.y).join("|");
  if (R.cleCach !== cle) {
    (R.cach || []).forEach(c => R.scene.remove(c.g)); R.cleCach = cle;
    R.cach = l.map(q => {
      const z = zoneJ(q.x, q.y), eau = tuileJ(q.x, q.y) === "~", g = new THREE.Group();
      const nom = eau ? (z === "bayou" ? "cach_bayou" : "nenuphar") : tuileJ(q.x, q.y) === "n" || autour(q.x, q.y, "n") >= 3 ? "cach_neige" : CACHETTE_FLAT[z];
      const b = poserDecor(R, g, nom, 0, 0, eau && nom === "nenuphar" ? { haut: .7, pied: 0 } : { haut: 1.1, pied: .16 });   // dans l'eau : des nénuphars qui bougent
      b.material = b.material.clone();   // pas teintée la nuit : on doit bien la voir
      const yeux = new THREE.Sprite(yeuxJ()); yeux.scale.set(.3, .15, 1); yeux.position.set(.06, .3, .06); g.add(yeux);
      const etincelles = [0, 1, 2].map(() => { const e = new THREE.Sprite(etincelleJ()); e.scale.set(.2, .2, 1); g.add(e); return e; });
      g.position.set(q.x, 0, q.y); R.scene.add(g); texCrea(q.k);
      return { q, g, b, yeux, etincelles, phase: Math.random() * 6 };
    });
  }
  R.cach.forEach(c => {
    const d = Math.abs(c.q.x - JEU.x) + Math.abs(c.q.y - JEU.y), fort = !!(JEU.revele && JEU.revele.q.k === c.q.k);
    c.b.material.rotation = Math.sin(t / 70 + c.phase) * (fort ? .07 : d <= 3 ? .045 : .012);
    c.yeux.visible = !fort && Math.sin(t / 900 + c.phase) > .75;
    c.etincelles.forEach((e, i) => { const a = t / 600 + i * 2.1 + c.phase; e.position.set(Math.cos(a) * .45, .55 + Math.sin(t / 300 + i) * .15, Math.sin(a) * .45); });
  });
}
function yeuxJ() {   // deux yeux jaunes qui brillent dans le noir
  const R = moteurJeu(); if (R.yeux) return R.yeux;
  const c = document.createElement("canvas"); c.width = 64; c.height = 32; const g = c.getContext("2d");
  [18, 46].forEach(x => { g.fillStyle = "rgba(255,225,74,.35)"; g.beginPath(); g.arc(x, 16, 14, 0, 7); g.fill(); g.fillStyle = "#ffe14a"; g.beginPath(); g.ellipse(x, 16, 6, 8, 0, 0, 7); g.fill(); g.fillStyle = "#2a1d24"; g.fillRect(x - 1.5, 10, 3, 12); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return R.yeux = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
}
function etincelleJ() {   // une petite étoile qui brille
  const R = moteurJeu(); if (R.etoile) return R.etoile;
  const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d");
  g.fillStyle = "#fff6b0"; g.beginPath(); [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => { const a = i * Math.PI / 4, r = i % 2 ? 4 : 15; g.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); }); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return R.etoile = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
}
// Les créatures animées : jeu-crea-<clé>.webp, 4 lignes de 4 images (apparition, attente, action, disparition ;
// pour Sporran : attente, attente, disparition, réapparition). Elle sort de sa cachette quand on la trouve.
const TEX_CREA = {};
function texCrea(k) {
  if (TEX_CREA[k] !== undefined) return TEX_CREA[k];
  TEX_CREA[k] = null;
  new THREE.TextureLoader().load(IMG_JEU + "jeu-crea-" + (k === "catsith" ? k : TRAQUES[k].cle) + ".webp", t => { t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / 4, 1 / 4); TEX_CREA[k] = t; });
  return null;
}
// taille de l'image (en cases) : le dessin occupe environ les 3/4 de l'image ; le héros fait 1,2
const TAILLE_CREA = { mothman: 2, nessie: 2.3, thunderbird: 2.3, barghest: 2, faery: 1.15, lutins: 1.35, jackalope: 1.2, yeti: 2.2, gargouille: 1.5,
  chupacabra: 1.45, kraken: 2.1, swamp: 2, catsith: 1.25 };
const LIGNES_CREA = k => k === "catsith" ? { arrive: 3, attente: 0, action: 1, part: 2 } : { arrive: 0, attente: 1, action: 2, part: 3 };
function partirCrea(q) { const R = moteurJeu(); if (R.creaEtat && R.creaEtat.k === q.k) Object.assign(R.creaEtat, { part: performance.now() }); }
function creatureJ(R, t) {
  const rv = JEU.revele;
  if (rv && (!R.creaEtat || R.creaEtat.k !== rv.q.k || R.creaEtat.part)) R.creaEtat = { k: rv.q.k, x: rv.q.x, z: rv.q.y, t0: rv.t0 };
  const e = R.creaEtat, tex = e && texCrea(e.k);
  if (!R.crea) {
    const m = () => new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, alphaTest: .03 }));
    R.crea = m(); R.crea2 = m(); [R.crea, R.crea2].forEach(c => { c.center.set(.5, .1); c.visible = false; R.scene.add(c); });
  }
  const c = R.crea, PART = 1250;
  if (e && !tex && !e.part && !rv) R.creaEtat = null;
  if (!e || !tex || (e.part && t - e.part > PART) || (!e.part && !rv) || (!e.part && t < e.t0)) { c.visible = R.crea2.visible = false; if (e && (e.part && t - e.part > PART || !rv && !e.part)) R.creaEtat = null; return; }
  if (!e.tex2) e.tex2 = tex.clone();
  const L = LIGNES_CREA(e.k), dt = Math.max(0, t - e.t0), cle = e.k === "catsith" ? "catsith" : TRAQUES[e.k].cle, S = TAILLE_CREA[cle] || 1.7;
  let ligne, x, boucle = true, echelle = 1, op = 1;
  // un cycle d'environ 5,5 s : 2 tours d'attente (450 ms par image), puis l'action (400 ms par image) ; l'arrivée et le départ prennent 1 s
  let bouge = 0;
  if (e.part) { const p = t - e.part; ligne = L.part; x = Math.min(3, p / 250); boucle = false; op = 1 - lisse(Math.max(0, (p - 850) / 350)); }
  else if (dt < 1000) { ligne = L.arrive; x = dt / 250; boucle = false; const f = Math.min(1, dt / 600); echelle = .55 + .45 * (1 + 2.2 * (f - 1) ** 3 + 1.2 * (f - 1) ** 2); }   // un petit rebond en sortant
  else { const w = (dt - 1000) % 5200; bouge = 1; if (w < 3600) { ligne = L.attente; x = (w / 450) % 4; } else { ligne = L.action; x = (w - 3600) / 400; boucle = false; } }
  const col = Math.min(3, Math.floor(x)), suivante = boucle ? (col + 1) % 4 : Math.min(3, col + 1), r = 1 - (ligne + 1) / 4;
  const souffle = bouge * Math.sin(dt / 700) * .025;   // entre les images, elle respire doucement
  c.scale.set(S * echelle * (1 - souffle * .5), S * echelle * (1 + souffle), 1); c.position.set(e.x + .14, 0, e.z + .14); c.visible = true; c.material.opacity = op;
  fonduImages(c, R.crea2, tex, e.tex2, [col / 4, r], [suivante / 4, r], suivante === col ? 0 : x % 1);
  R.crea2.position.copy(c.position); R.crea2.material.opacity *= op;
}
const ANGLE = { bas: 0, droite: Math.PI / 2, haut: Math.PI, gauche: -Math.PI / 2 };
const _c = new THREE.Color();
function lumiereJ(R, zone, vite) {   // la lumière glisse doucement vers celle de la région où l'on marche
  const A = AMB[zone], k = vite ? 1 : .04;
  R.ciel.color.lerp(_c.setHex(A.ciel[0]), k); R.ciel.groundColor.lerp(_c.setHex(A.ciel[1]), k); R.ciel.intensity += (A.ciel[2] - R.ciel.intensity) * k;
  R.soleil.color.lerp(_c.setHex(A.soleil[0]), k); R.soleil.intensity += (A.soleil[1] - R.soleil.intensity) * k;
  R.rendu.setClearColor(0, 0);   // hors de l'île, on voit le fond sombre de l'app (CSS de #jeu)
  R.nuit += (A.nuit - R.nuit) * k; R.heros.userData.lueur.intensity = 1.2 + 2 * R.nuit;
  if (R.matsFlat && Math.abs((R.nuitFlat ?? -1) - R.nuit) > .01) {   // le décor dessiné se teinte de bleu la nuit, les lampadaires s'allument
    R.nuitFlat = R.nuit; R.matsFlat.forEach(m => m.color.setRGB(1 - .36 * R.nuit, 1 - .32 * R.nuit, 1 - .12 * R.nuit)); halosJ().opacity = Math.min(.95, .95 * R.nuit);
  }
  $("jeu").classList.toggle("nuit", R.nuit > .5);
}
function boucleJeu(t) {
  JEU.raf = 0; if ($("jeu").hidden) return;
  JEU.raf = requestAnimationFrame(boucleJeu);
  const R = moteurJeu(), cv = $("jeuCanvas"), W = cv.clientWidth, H = cv.clientHeight, premier = !JEU.t;
  const taille = R.rendu.getSize(new THREE.Vector2()); if (taille.x !== W || taille.y !== H) R.rendu.setSize(W, H, false);
  // un pas en cours ? on avance en douceur, sinon on repart si le joystick est tenu
  let fx = JEU.x, fy = JEU.y, bond = 0;
  if (JEU.pas) { const k = Math.min(1, (t - JEU.pas.t0) / DUREE_PAS); fx = JEU.pas.de[0] + (JEU.x - JEU.pas.de[0]) * k; fy = JEU.pas.de[1] + (JEU.y - JEU.pas.de[1]) * k; bond = Math.sin(k * Math.PI) * .12;
    if (k >= 1) { const t0 = JEU.pas.t0; finPas(); fx = JEU.x; fy = JEU.y; bond = 0;
      if (JEU.tenu) { pasTenu(); if (JEU.pas) JEU.pas.t0 = Math.max(t0 + DUREE_PAS, t - DUREE_PAS * .5); } } }   // le pas suivant part sans temps mort
  if (!JEU.pas && JEU.tenu) pasTenu();
  const d = dioramaJ(), h = R.heros, sol = d && d.flat ? 0 : hautSol(tuileJ(Math.round(fx), Math.round(fy)));
  if (!d) { R.rendu.setClearColor(0, 0); R.rendu.clear(); return; }   // les planches du décor arrivent
  lumiereJ(R, zoneJ(Math.round(fx), Math.round(fy)), premier);
  h.position.set(fx, Math.max(0, sol) + bond, fy);
  if (h.userData.dessin.visible) {   // le dessin regarde toujours la caméra : on change seulement d'image
    const nav = JEU.bateau && JEU.bateau.a;   // en bateau : assis sur le pont, sans marcher
    imageHeros(h, t, !nav && !!(JEU.pas || JEU.tenu)); h.position.y = nav ? .22 + Math.sin(t / 600) * .03 : Math.max(0, sol);   // pas de petit saut : les images de marche bougent déjà
    h.visible = !nav; if (d.flat) bateauJ(R, fx, fy, t);   // à bord, le héros est dans la cabine : on ne voit plus que le bateau (17/10)
    h.userData.dessin.material.color.setRGB(1 - .18 * R.nuit, 1 - .22 * R.nuit, 1 - .08 * R.nuit);
  } else {
    const cible = ANGLE[JEU.dir], da = Math.atan2(Math.sin(cible - h.rotation.y), Math.cos(cible - h.rotation.y)); h.rotation.y += da * .35;
    h.userData.corps.scale.y = 1 + Math.sin(t / 260) * .015;
  }
  // caméra isométrique qui suit le héros
  const demi = d.flat ? ZOOM.demi : 4.2, ratio = W / Math.max(1, H);   // la moitié de la largeur vue, en cases (on la change en pinçant l'écran)
  Object.assign(R.camera, { left: -demi, right: demi, top: demi / ratio, bottom: -demi / ratio }); R.camera.updateProjectionMatrix();
  const dt = premier || !R.cam ? 1e9 : t - JEU.t, kc = 1 - Math.exp(-dt / 110);   // la caméra rattrape le héros en douceur
  R.cam = premier || !R.cam ? [fx, fy] : [R.cam[0] + (fx - R.cam[0]) * kc, R.cam[1] + (fy - R.cam[1]) * kc];
  if (Math.hypot(fx - R.cam[0], fy - R.cam[1]) > 3) R.cam = [fx, fy];   // téléporté : on ne glisse pas à travers l'île
  R.camera.position.set(R.cam[0] + 10, HAUT_CAM[d.flat ? "flat" : "volumes"], R.cam[1] + 10); R.camera.lookAt(R.cam[0], 0, R.cam[1]);
  R.soleil.position.set(fx - 5, 12, fy + 3); R.soleil.target.position.set(fx, 0, fy);
  if (premier || t - (JEU.tLampes || 0) > 300) {   // les 4 lumières vont aux lampadaires les plus proches
    JEU.tLampes = t;
    const proches = d.lampes.map(l => [l, (l[0] - fx) ** 2 + (l[1] - fy) ** 2]).sort((a, b) => a[1] - b[1]).slice(0, R.lampes.length);
    R.lampes.forEach((l, i) => { const p = proches[i]; if (p) l.position.set(p[0][0], 1.3, p[0][1]); l.userData.ok = !!p && p[1] < 100; });
  }
  R.lampes.forEach(l => l.intensity = l.userData.ok ? .4 + 2.8 * R.nuit : 0);
  d.anim.forEach(f => f(t));
  if (d.flat) { cachettesFlat(R, t); estomperJ(R, d, fx, fy); vueZoneJ(R, d); boutonBateauJ(); } else cachettesJ3D(R, t);
  creatureJ(R, t);
  habitantsJ(R).forEach(({ n, g, c }) => {   // les habitants respirent, et se tournent vers toi quand tu approches
    c.position.y = Math.abs(Math.sin(t / 500 + n.x)) * .04;
    if (Math.abs(n.x - fx) + Math.abs(n.y - fy) <= 3) { const a = Math.atan2(fx - n.x, fy - n.y), da = Math.atan2(Math.sin(a - g.rotation.y), Math.cos(a - g.rotation.y)); g.rotation.y += da * .15; }
  });
  const rv = JEU.revele; R.signe.visible = !!rv;
  if (rv) R.signe.position.set(rv.q.x, (R.crea && R.crea.visible ? 2.1 : 1.25) + Math.abs(Math.sin(t / 220)) * .2, rv.q.y);
  R.rendu.render(R.scene, R.camera);
  if (t - (JEU.tDet || 0) > 180) { JEU.tDet = t; detecteurJ(t); }
  JEU.t = t;
}
function detecteurJ(t) {
  const l = ciblesJ(); if (!l.length) { allumerJ(0); return; }
  const d = Math.min(...l.map(q => Math.abs(q.x - JEU.x) + Math.abs(q.y - JEU.y)));
  const n = JEU.revele ? 5 : d <= 2 ? 5 : d <= 4 ? 4 : d <= 7 ? 3 : d <= 11 ? 2 : 1;
  allumerJ(n);
  const periode = 1600 - n * 260;
  if (t - JEU.dernierBip > periode) { JEU.dernierBip = t; if (audio && sonActif) note(480 + 180 * n, 0, .07, { type: "square", vol: .04, filtre: 2600 }); }
}
function allumerJ(n) { document.querySelectorAll("#jeuLeds i").forEach((l, i) => l.classList.toggle("on", i < 5 ? i < n : n >= 5)); }
// Le détecteur dessiné : l'image éteinte en fond, et chaque voyant découpé dans l'image allumée (position et taille en fraction de l'image).
const VOYANTS = [[0.1326, 0.6553, 0.1627, 0.155], [0.2689, 0.6545, 0.1627, 0.155], [0.4182, 0.6521, 0.1644, 0.1567], [0.5612, 0.6562, 0.1539, 0.1467], [0.7072, 0.6561, 0.1627, 0.155], [0.6327, 0.0278, 0.1749, 0.1667]];
(function detecteurDessine() {
  const img = new Image(); img.onload = () => {
    const boite = $("jeuLeds"); boite.classList.add("dessine"); boite.style.setProperty("--img", `url("${img.src}")`);
    if (boite.children.length < 6) boite.appendChild(document.createElement("i"));
    [...boite.children].forEach((l, i) => { const [x, y, w, h] = VOYANTS[i];
      Object.assign(l.style, { left: x * 100 + "%", top: y * 100 + "%", width: w * 100 + "%", height: h * 100 + "%",
        backgroundSize: `${200 / w}% ${100 / h}%`, backgroundPosition: `${(1 + x) / (2 - w) * 100}% ${y / (1 - h) * 100}%` }); });
  };
  img.src = IMG_JEU + "jeu-detecteur.webp";
})();

// ---------- joystick, boutons A et B, clavier ----------
// La vue est en biais : les 4 directions de marche sont les 4 diagonales de l'écran. Le joystick choisit la plus proche
// (en haut à droite = « haut », en bas à droite = « droite », en bas à gauche = « bas », en haut à gauche = « gauche »).
const CAP = { haut: 45, gauche: 135, bas: 225, droite: 315 };
const stick = $("jeuStick"), pommeau = $("jeuBouton"); let doigtStick = null;
function bougerStick(e) {
  const r = stick.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), max = r.width * .3, k = d > max ? max / d : 1;
  pommeau.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  if (!JEU) return;
  if (d < r.width * .17) { JEU.tenu = JEU.tenu2 = null; return; }   // une grande zone morte au centre : un doigt posé ne fait pas marcher
  const a = (Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360, ecart = c => Math.abs(((a - c + 540) % 360) - 180);
  let [p, q] = Object.keys(CAP).sort((k, l) => ecart(CAP[k]) - ecart(CAP[l]));   // la diagonale la plus proche, puis sa voisine
  if (JEU.tenu && JEU.tenu !== p && ecart(CAP[JEU.tenu]) < 60) { q = p; p = JEU.tenu; }   // on garde la direction tant qu'on n'a pas franchement tourné le pouce
  const ep = ecart(CAP[p]), zigzag = JEU.zigzag ? ep > 20 : ep > 34, change = p !== JEU.tenu || zigzag !== !!JEU.zigzag;
  JEU.tenu = p; JEU.tenu2 = ecart(CAP[q]) <= 90 ? q : null; JEU.zigzag = zigzag;
  if (change) pasTenu();
}
function lacherStick() { doigtStick = null; stick.classList.remove("actif"); pommeau.style.transform = ""; if (JEU) JEU.tenu = JEU.tenu2 = null; }
// Le zoom : on pince l'écran à deux doigts (ou la molette) pour rapprocher ou éloigner la caméra. Le choix est gardé.
const ZOOM = { demi: 5, min: 3.2, max: 8, doigts: new Map(), d0: 0, z0: 0 };
try { const z = parseFloat(localStorage.getItem("cryptids-zoom")); if (z >= ZOOM.min && z <= ZOOM.max) ZOOM.demi = z; } catch (e) {}
function zoomer(z) { ZOOM.demi = Math.min(ZOOM.max, Math.max(ZOOM.min, z)); try { localStorage.setItem("cryptids-zoom", ZOOM.demi.toFixed(2)); } catch (e) {} }
const ecranJeu = $("jeuCanvas").parentElement, ecartDoigts = () => { const [a, b] = [...ZOOM.doigts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
ecranJeu.addEventListener("pointerdown", e => { if (e.target.closest("button, .joystick, #jeuLeds")) return; ZOOM.doigts.set(e.pointerId, [e.clientX, e.clientY]);
  if (ZOOM.doigts.size === 2) { ZOOM.d0 = ecartDoigts(); ZOOM.z0 = ZOOM.demi; } });
ecranJeu.addEventListener("pointermove", e => { if (!ZOOM.doigts.has(e.pointerId)) return; ZOOM.doigts.set(e.pointerId, [e.clientX, e.clientY]);
  if (ZOOM.doigts.size === 2 && ZOOM.d0 > 20) { e.preventDefault(); zoomer(ZOOM.z0 * ZOOM.d0 / Math.max(20, ecartDoigts())); } });
["pointerup", "pointercancel", "pointerleave"].forEach(t => ecranJeu.addEventListener(t, e => ZOOM.doigts.delete(e.pointerId)));
ecranJeu.addEventListener("wheel", e => { e.preventDefault(); zoomer(ZOOM.demi * Math.exp(e.deltaY * .0015)); }, { passive: false });
["gesturestart", "gesturechange"].forEach(t => document.addEventListener(t, e => { if (!$("jeu").hidden) e.preventDefault(); }));   // Safari : pas de zoom de la page pendant le jeu
stick.addEventListener("pointerdown", e => { e.preventDefault(); doigtStick = e.pointerId; stick.setPointerCapture(e.pointerId); stick.classList.add("actif"); bougerStick(e); });
stick.addEventListener("pointermove", e => { if (e.pointerId === doigtStick) bougerStick(e); });
["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => stick.addEventListener(ev, e => { if (e.pointerId === doigtStick) lacherStick(); }));
$("jeuA").addEventListener("pointerdown", e => { e.preventDefault(); if (!(JEU && JEU.revele)) boutonA(); });
$("jeuA").addEventListener("click", () => { if (JEU && JEU.revele && performance.now() - JEU.revele.t0 > 350) trouveJ(); });   // ouvrir la caméra demande un vrai clic sur iPhone
$("jeuB").addEventListener("pointerdown", e => { e.preventDefault(); boutonB(); });
$("jeuBateau").addEventListener("pointerup", e => { e.preventDefault(); bateauBoutonJ(); });   // au lever du doigt : appuyé, le même toucher appuyait aussi sur le menu qui apparaît dessous
const TOUCHES = { ArrowUp: "haut", ArrowDown: "bas", ArrowLeft: "gauche", ArrowRight: "droite", z: "haut", s: "bas", q: "gauche", d: "droite", w: "haut", a: "gauche" };
addEventListener("keydown", e => {
  if (!JEU || $("jeu").hidden) return;
  if (TOUCHES[e.key]) { e.preventDefault(); JEU.tenu = TOUCHES[e.key]; JEU.tenu2 = null; JEU.zigzag = false; pasTenu(); }
  else if (!e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); boutonA(); }
  else if (!e.repeat && (e.key === "Escape" || e.key === "Backspace")) { e.preventDefault(); boutonB(); }
});
addEventListener("keyup", e => { if (JEU && TOUCHES[e.key] === JEU.tenu) JEU.tenu = null; });
$("jeuQuitter").addEventListener("click", () => { fermerJeu(); enBoss = false; majAccueil(); montrer("accueil"); });

window.__jeu = { bateau: () => bateauBoutonJ(), zoom: () => ZOOM.demi, etat: () => JEU && { x: JEU.x, y: JEU.y, dir: JEU.dir, zone: zoneJ(JEU.x, JEU.y), revele: JEU.revele && JEU.revele.q.k, bateau: JEU.bateau, boutonBateau: !$("jeuBateau").hidden && $("jeuBateau").textContent, cibles: ciblesJ() },
  aller: (x, y, dir) => { JEU.x = x; JEU.y = y; JEU.pas = null; if (dir) JEU.dir = dir; arriverJ(true); }, pnj: PNJ, libreSol, pas: d => essayerPas(d), A: () => boutonA(), B: () => boutonB(),
  sousBati: () => { sousBatiment(0, 0); return [...SOUS_BATI].filter(k => { const [x, y] = k.split(",").map(Number); return !!(TUILES[tuileJ(x, y)] || {}).libre; }); },
  decor: () => R3 && R3.ile && R3.ile.flat ? { objets: R3.ile.groupe.children.length, dessins: R3.rendu.info.render.calls } : null,
  carte: CARTE, zone: zoneJ, accessibles: () => casesAccessibles().length, trouver: k => { JEU.revele = { q: { k }, t0: 0 }; trouveJ(); } };
