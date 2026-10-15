
/* ===================== Aventure virtuelle : jeu vidéo en 3D isométrique (vue de dessus en biais, façon Dofus) ===================== */
// Chaque map est une grille de lettres : une lettre = une case (voir TUILES). Le décor en 3D est construit à partir de la grille
// (dioramaJ). Maps provisoires en attendant celles de Sam : un plan dessiné à la main suffit, on le recopie en lettres.
const TUILES = {
  ".": { libre: true }, ",": { libre: true }, "=": { libre: true }, ":": { libre: true }, "*": { libre: true }, "b": { libre: true },
  "<": { libre: true }, ">": { libre: true }, "P": { libre: true },
  "T": {}, "~": {}, "#": {}, "f": {}, "R": {}, "H": {}, "D": {}, "L": {}, "S": {}, "o": {}
};   // . herbe  , hautes herbes  = chemin  : sable  * fleurs  b pont  < > sorties  P départ
     // T arbre  ~ eau  # rocher  f barrière  R toit  H mur  D porte  L lampadaire  S panneau  o pierre levée
const MAPS = [
  { nom: "La forêt des Murmures", panneau: "Forêt des Murmures. Au nord : le village de Sporran.", grille: [
    "TTTTTTTTT>>TTTTTTTTT",
    "TTT,,,...==...,,,TTT",
    "TT,,,,...==..*.,,,TT",
    "T,,,..T..==..T...,,T",
    "T,,..TTT.==.TTT...,T",
    "T....TTT.==.TTT....T",
    "T*.......==.......*T",
    "T..~~~...==...,,,..T",
    "T.~~~~~..==..,,,,,.T",
    "T.~~~~~..==..,,,,,.T",
    "T..~~~...==...,,,..T",
    "T*.......==S.......T",
    "TT..TT...==...TT..TT",
    "T,,.TT...==...TT.,,T",
    "T,,,.....==.....,,,T",
    "T,,,..*..==..*..,,,T",
    "TT,......==......,TT",
    "TTT..TT..==..TT..TTT",
    "TT...TT..==..TT...TT",
    "T.*......==......*.T",
    "T........P.......*.T",
    "TTTTTTTTTTTTTTTTTTTT"] },
  { nom: "Le village de Sporran", panneau: "Village de Sporran. Au nord : le lac aux Brumes.", grille: [
    "TTTTTTTTT>>TTTTTTTTT",
    "T*.......==.......*T",
    "T.RRRR...==...RRRR.T",
    "T.RRRR..L==L..RRRR.T",
    "T.HHDH...==...HDHH.T",
    "T...=....==....=...T",
    "Tff.=....==....=.ffT",
    "T...=....==....=...T",
    "T==================T",
    "T..L.....==S....L..T",
    "T.RRRRR..==..RRRRR.T",
    "T.RRRRR..==..RRRRR.T",
    "T.HHDHH..==..HHDHH.T",
    "T...=....==....=...T",
    "T*..======.=====..*T",
    "Tfff.....==.....fffT",
    "T,,,..L..==..L..,,,T",
    "T,,,,....==....,,,,T",
    "T.,,..*..==..*..,,.T",
    "TT.......==.......TT",
    "TTT......==......TTT",
    "TTTTTTTTT<<TTTTTTTTT"] },
  { nom: "Le lac aux Brumes", panneau: "Lac aux Brumes. Au nord : le cercle de pierres.", grille: [
    "TTTTTTTTT>>TTTTTTTTT",
    "T#.......==.......#T",
    "T..,,....==....,,..T",
    "T.,,,::::==::::,,,.T",
    "T::::~~~~bb~~~~::::T",
    "T:~~~~~~~bb~~~~~~~:T",
    "T~~~~~~~~bb~~~~~~~~T",
    "T~~~~~~~~bb~~~~~~~~T",
    "T~~~##~~~bb~~~~##~~T",
    "T~~~~~~~~bb~~~~~~~~T",
    "T:~~~~~~~bb~~~~~~~:T",
    "T::~~~~~~bb~~~~~~::T",
    "T.::~~~~~bb~~~~~::.T",
    "T.,,:::::==:::::,,.T",
    "T.,,,....==S....,,.T",
    "T#.......==.......#T",
    "T...*....==....*...T",
    "T..#.....==.....#..T",
    "T.,,,....==....,,,.T",
    "TT,,,....==....,,,TT",
    "TTT......==......TTT",
    "TTTTTTTTT<<TTTTTTTTT"] },
  { nom: "Le cercle de pierres", nuit: true, finale: true, panneau: "Le cercle de pierres. Ici se cachent les derniers cryptides.", grille: [
    "TTTTTTTTTTTTTTTTTTTT",
    "TTTTTTT,,,,,,TTTTTTT",
    "TTTT,,,,....,,,,TTTT",
    "TTT,,..o....o..,,TTT",
    "TT,,.o........o.,,TT",
    "TT,..............,TT",
    "TT,.o....**....o.,TT",
    "TT,......**......,TT",
    "TT,.o..........o.,TT",
    "TT,,..o......o..,,TT",
    "TTT,,...o..o...,,TTT",
    "TTTT,,...==...,,TTTT",
    "TTTTT,...==...,TTTTT",
    "TTTTTT..L==L..TTTTTT",
    "TTTTTT...==...TTTTTT",
    "TTTTTT,..==..,TTTTTT",
    "TTTTTT,,.==.,,TTTTTT",
    "TTTTTTT..==..TTTTTTT",
    "TTTTTTT..==S.TTTTTTT",
    "TTTTTTT..==..TTTTTTT",
    "TTTTTTT..==..TTTTTTT",
    "TTTTTTTTT<<TTTTTTTTT"] }
];
const FINALE = MAPS.findIndex(m => m.finale);
const DIRS = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] };
const DUREE_PAS = 190;   // ms pour avancer d'une case
let JEU = null;

// ---------- la grille ----------
const tuileJ = (m, x, y) => (MAPS[m].grille[y] || "")[x] || "T";
const libreJ = (m, x, y) => !!(TUILES[tuileJ(m, x, y)] || {}).libre;
function trouverJ(m, ch) { const g = MAPS[m].grille; for (let y = 0; y < g.length; y++) { const x = g[y].indexOf(ch); if (x >= 0) return [x, y]; } return null; }
function entreeJ(m, porte) {   // la case où l'on arrive : à côté de la sortie `porte`, ou le départ
  const p = porte && trouverJ(m, porte); if (!p) return trouverJ(m, "P") || [1, 1];
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const c = tuileJ(m, p[0] + dx, p[1] + dy); if (TUILES[c] && TUILES[c].libre && c !== "<" && c !== ">") return [p[0] + dx, p[1] + dy]; }
  return p;
}
const accessiblesJ = {};
function casesAccessibles(m) {   // toutes les cases où l'on peut aller à pied depuis l'entrée de la map
  if (accessiblesJ[m]) return accessiblesJ[m];
  const d = entreeJ(m, m ? "<" : null), vu = new Set([d + ""]), file = [d];
  while (file.length) { const [x, y] = file.shift(); for (const [dx, dy] of Object.values(DIRS)) { const n = [x + dx, y + dy];
    if (!vu.has(n + "") && libreJ(m, n[0], n[1])) { vu.add(n + ""); file.push(n); } } }
  return accessiblesJ[m] = [...vu].map(s => s.split(",").map(Number));
}

// ---------- où se cache chaque créature (son habitat) ----------
function autour(m, x, y, chars) { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && chars.includes(tuileJ(m, x + dx, y + dy))) n++; return n; }
function scoreJ(cle, m, x, y) {
  const c = tuileJ(m, x, y), pres = s => autour(m, x, y, s) > 0;
  switch (cle) {
    case "mothman": return pres("L") ? 3 : c === "=" ? 1 : 0;
    case "nessie": case "kraken": return pres("~") ? 3 : 0;
    case "swamp": return (pres("~") ? 2 : 0) + (c === "," ? 2 : 0);
    case "thunderbird": return c === "." && autour(m, x, y, "T~#fRHDLSo") === 0 ? 2 : 0;
    case "barghest": return (pres("T") ? 2 : 0) + (c === "," ? 1 : 0);
    case "faery": return c === "*" ? 3 : pres("*") ? 1 : 0;
    case "lutins": return c === "," ? 3 : 0;
    case "jackalope": return c === "," ? 2 : c === "." ? 1 : 0;
    case "yeti": return pres("#") ? 3 : c === ":" ? 1 : 0;
    case "gargouille": return pres("oRH") ? 3 : 0;
    case "chupacabra": return pres("HD") ? 3 : pres("f") ? 2 : 0;
  }
  return 0;
}
function cachettesJ(cle, m, prises) {   // les meilleures cases de la map pour cette créature, loin du départ et des autres
  const dep = [entreeJ(m, m ? "<" : null), trouverJ(m, ">")].filter(Boolean);
  const ok = casesAccessibles(m).filter(([x, y]) => !"<>Pb".includes(tuileJ(m, x, y))
    && dep.every(([a, b]) => Math.abs(a - x) + Math.abs(b - y) >= 5) && prises.every(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y)) >= 3));
  let best = 0; ok.forEach(([x, y]) => best = Math.max(best, scoreJ(cle, m, x, y)));
  return { score: best, cases: ok.filter(([x, y]) => scoreJ(cle, m, x, y) === best) };
}
const auHasardJ = l => l[Math.floor(Math.random() * l.length)];
function placerJeu(p) {   // répartit les créatures de l'aventure dans les maps (la finale garde les plus difficiles)
  const j = p.jeu, reste = p.liste.filter(k => !p.pris.includes(k) && !j.pos[k]);
  if (!reste.length) return;
  const prises = m => Object.values(j.pos).filter(q => q[0] === m).map(q => [q[1], q[2]]);
  const dejaFinale = Object.values(j.pos).filter(q => q[0] === FINALE).length;
  const nFinale = Math.max(0, (p.liste.length <= 4 ? 1 : 2) - dejaFinale);
  const tri = reste.slice().sort((a, b) => (DIFF[TRAQUES[b].cle] || 2) - (DIFF[TRAQUES[a].cle] || 2));
  const pourFinale = new Set(tri.slice(0, Math.min(nFinale, reste.length - (reste.length > 1 ? 1 : 0))));
  reste.forEach(k => {
    const cle = TRAQUES[k].cle, maps = pourFinale.has(k) ? [FINALE] : MAPS.map((_, i) => i).filter(i => i !== FINALE);
    let choix = null;
    maps.forEach(m => { const c = cachettesJ(cle, m, prises(m)); if (!c.cases.length) return;
      const charge = prises(m).length, note = c.score * 10 - charge * 4 + Math.random();
      if (!choix || note > choix.note) choix = { m, note, c }; });
    if (choix) { const [x, y] = auHasardJ(choix.c.cases); j.pos[k] = [choix.m, x, y]; }
  });
}
function cacherBoss(p) {
  const pr = Object.entries(p.jeu.pos).filter(([k, q]) => q[0] === FINALE && !p.pris.includes(k)).map(([, q]) => [q[1], q[2]]);
  const c = cachettesJ("gargouille", FINALE, pr.concat(JEU ? [[JEU.x, JEU.y]] : []));
  const l = c.cases.length ? c.cases : casesAccessibles(FINALE);
  p.jeu.boss = [FINALE].concat(auHasardJ(l));
}
const resteAvantFinale = p => p.liste.some(k => !p.pris.includes(k) && p.jeu.pos[k] && p.jeu.pos[k][0] !== FINALE);
function ciblesJ() {   // les créatures cachées dans la map où l'on est
  const p = partie(); if (!p || !p.jeu) return [];
  if (enBoss) return p.jeu.boss && p.jeu.boss[0] === JEU.m ? [{ k: "catsith", x: p.jeu.boss[1], y: p.jeu.boss[2] }] : [];
  return p.liste.filter(k => !p.pris.includes(k) && p.jeu.pos[k] && p.jeu.pos[k][0] === JEU.m).map(k => ({ k, x: p.jeu.pos[k][1], y: p.jeu.pos[k][2] }));
}

// ---------- ouverture, sauvegarde ----------
function ouvrirJeu() {
  initAudio(); taire(); fermerPixel(); arreterGPS(); montrer(null); $("scene").hidden = true; $("victoire").hidden = true;
  changerAmbiance("chasse");
  let p = partie();
  if (!p) { p = { liste: [], pris: [], membres: {}, debut: Date.now() }; ecrire(CLES.partie, p); }
  if (!p.jeu) { const d = entreeJ(0, null); p.jeu = { m: 0, x: d[0], y: d[1], dir: "haut", pos: {} }; }
  placerJeu(p);
  if (enBoss && !p.jeu.boss) { const d = entreeJ(FINALE, "<"); Object.assign(p.jeu, { m: FINALE, x: d[0], y: d[1], dir: "haut" }); }
  ecrire(CLES.partie, p);
  JEU = { m: p.jeu.m, x: p.jeu.x, y: p.jeu.y, dir: p.jeu.dir || "bas", pas: null, tenu: null, revele: null, raf: 0, t: 0,
    dernierBip: 0, eloigne: null };
  if (enBoss && !p.jeu.boss) { cacherBoss(p); ecrire(CLES.partie, p); bossPhase = 0; }
  $("jeu").hidden = false; allumerJ(0);
  arriverJ(true);
  if (!JEU.raf) JEU.raf = requestAnimationFrame(boucleJeu);
}
function sauverJ() { majPartie(p => { if (p.jeu) Object.assign(p.jeu, { m: JEU.m, x: JEU.x, y: JEU.y, dir: JEU.dir }); }); }
function fermerJeu() {
  if (JEU) { cancelAnimationFrame(JEU.raf); JEU.raf = 0; JEU.tenu = null; sauverJ(); }
  $("jeu").hidden = true;
}
function arriverJ(debut) {   // on entre dans une map : son nom, et combien de cryptides s'y cachent
  const n = ciblesJ().length, M = MAPS[JEU.m];
  $("jeuLieu").textContent = M.nom;
  const txt = enBoss ? (n ? "Sporran se cache quelque part par ici…" : "") : n ? n + (n > 1 ? " cryptides se cachent ici" : " cryptide se cache ici") : "Aucun cryptide ici. Cherche ailleurs !";
  titreJ(M.nom, txt); if (!debut) sfx("page");
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
function essayerPas(dir) {
  if (!JEU || JEU.pas || JEU.revele) return;
  JEU.dir = dir; const [dx, dy] = DIRS[dir], x = JEU.x + dx, y = JEU.y + dy, c = tuileJ(JEU.m, x, y);
  if (!libreJ(JEU.m, x, y)) { if (performance.now() - (JEU.tCogne || 0) > 350) { JEU.tCogne = performance.now(); sfx("clic"); } return; }
  if (c === ">" && JEU.m + 1 === FINALE && !enBoss && resteAvantFinale(partie())) {
    if (performance.now() - (JEU.tCogne || 0) > 1500) { JEU.tCogne = performance.now(); sfx("rate");
      dialogueJ("Un sceau magique ferme le passage. Sauve d'abord tous les cryptides cachés avant le cercle de pierres !"); }
    return;
  }
  JEU.pas = { de: [JEU.x, JEU.y], t0: performance.now() }; JEU.x = x; JEU.y = y;
}
function finPas() {
  JEU.pas = null; const c = tuileJ(JEU.m, JEU.x, JEU.y);
  if (c === ">" || c === "<") {
    const m = JEU.m + (c === ">" ? 1 : -1); if (!MAPS[m]) return;
    const d = entreeJ(m, c === ">" ? "<" : ">"); JEU.m = m; JEU.x = d[0]; JEU.y = d[1]; JEU.dir = c === ">" ? "haut" : "bas"; JEU.eloigne = null;
    sauverJ(); arriverJ(); return;
  }
  sauverJ();
  // tout près d'une cachette : la créature surgit (« ! » au-dessus de sa cachette) ; A ouvre l'œil magique pour la capturer
  const q = ciblesJ().find(q => Math.abs(q.x - JEU.x) + Math.abs(q.y - JEU.y) <= 1);
  if (JEU.eloigne && Math.abs(JEU.eloigne[0] - JEU.x) + Math.abs(JEU.eloigne[1] - JEU.y) >= 3) JEU.eloigne = null;
  if (q && !JEU.eloigne) { JEU.revele = { q, t0: performance.now() }; sfx("revele"); if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    dialogueJ(q.k === "catsith" ? "Sporran est là ! Appuie sur A pour l'attraper !" : "Un cryptide se cache ici ! Appuie sur A pour ouvrir l'œil magique et le capturer.", 60000); }
}
function boutonA() {
  if (!JEU) return;
  if (JEU.revele) return trouveJ();
  const [dx, dy] = DIRS[JEU.dir];
  if (tuileJ(JEU.m, JEU.x + dx, JEU.y + dy) === "S") { sfx("page"); return dialogueJ(texteSigne(), 6000); }
  sfx("clic"); dialogueJ(["Rien par ici…", "Le détecteur t'aide : plus il s'allume, plus un cryptide est proche !"][Math.random() < .5 ? 0 : 1], 2200);
}
function texteSigne() {
  const p = partie(), l = enBoss ? [] : ciblesJ().map(q => TRAQUES[q.k].indice);
  const txt = MAPS[JEU.m].panneau;
  if (enBoss) return txt + " Sporran rôde autour des pierres levées…";
  return l.length ? txt + " Indices : " + l.map(s => "« " + s + " »").join(", ") + "." : txt + " Aucun cryptide ne se cache ici.";
}
function boutonB() {
  if (!JEU) return;
  if (JEU.revele) return fuirJ();
  $("jeuDialogue").hidden = true;
}

// ---------- capture : on repasse à l'œil magique (RA), comme sur la carte GPS ----------
function trouveJ() {   // appelé depuis un « clic » ou une touche : iOS n'autorise la caméra et les capteurs qu'à ce moment-là
  const r = JEU && JEU.revele; if (!r) return;
  const k = r.q.k; JEU.revele = null; $("jeuDialogue").hidden = true;
  if (k === "catsith" && bossPhase < 2) return fuiteBoss();
  fermerJeu(); sfx("oeil");
  bandeau(k === "catsith" ? "Tu as débusqué Sporran ! Ouvre l'œil magique…" : "Débusqué ! Cherche-le autour de toi avec l'œil magique…", 2400);
  ouvrirOeil(() => k === "catsith" ? demarrerBossAR() : demarrerTraque(k, { gpsFait: true, angleGPS: null }));
}
function fuirJ() {
  JEU.revele = null; JEU.eloigne = [JEU.x, JEU.y]; sfx("clic");
  dialogueJ("Tu t'éloignes sans bruit… Le cryptide reste caché ici. Reviens quand tu veux !", 3000);
}
function fuiteBoss() {   // comme sur la carte GPS : Sporran file ailleurs deux fois avant de se laisser attraper
  bossPhase++; sfx("fuite");
  const p = partie(); cacherBoss(p); ecrire(CLES.partie, p);
  dialogueJ(bossPhase === 1 ? "Hé hé ! Trop lent ! Attrape-moi si tu peux !" : "Encore raté ! Dernière chance, petit humain !", 3400);
}

import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
// ---------- rendu en 3D isométrique (three.js) : formes rondes et douces, couleurs de forêt de pins au crépuscule ----------
// Chaque map devient un petit diorama : les cases de la grille donnent le sol, et chaque lettre pose son objet (arbre, maison…).
const COUL = { herbe: 0x86b26a, herbe2: 0x79a85f, hautes: 0x4e8b55, chemin: 0xe2b77c, sable: 0xf0d6a0, terre: 0x8a5a3b, fond: 0x2e6470, eau: 0x5cc2c9,
  pin: 0x2c6450, pin2: 0x3b7d5c, feuillu: 0x7fb85c, feuillu2: 0x9cc96b, tronc: 0x7a5134, rocher: 0xa3a1ac, pierre: 0x8e85ad, rune: 0x5ff0d0,
  mur: 0xf3e2c4, toits: [0xc9573f, 0x6b569b, 0x3f8790, 0xd99a3c], porte: 0x6e4630, vitre: 0xffd36e, bois: 0xc98d4b, lampe: 0x3d3a4a, lumiere: 0xffe08a,
  capuche: 0x6f52a8, capuche2: 0x58408a, peau: 0xf5c9a2, yeux: 0x2a1d24, botte: 0x4a3326, cristal: 0x5ff0d0, scelle: 0xff6b6b,
  fleurs: [0xff8fa3, 0xfff1d6, 0xffc94d, 0xb48ee8] };
const M3 = {};   // matériaux partagés, mats et doux (pas de reflets)
const mat3 = (c, e) => M3[c + "/" + (e || 0)] || (M3[c + "/" + (e || 0)] = new THREE.MeshLambertMaterial({ color: c, emissive: e ? c : 0x000000, emissiveIntensity: e || 0 }));
const hautSol = c => c === "~" || c === "b" ? -.34 : 0;
let R3 = null;   // le moteur du jeu : rendu, scène, caméra, lumières, héros, et un diorama par map
function moteurJeu() {
  if (R3) return R3;
  const rendu = new THREE.WebGLRenderer({ canvas: $("jeuCanvas"), antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 100);
  const ciel = new THREE.HemisphereLight(0xd8ecff, 0x7a5a40, 1.6), soleil = new THREE.DirectionalLight(0xfff0d6, 2.2);
  soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024); Object.assign(soleil.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 40 });
  soleil.shadow.bias = -.002; scene.add(ciel, soleil, soleil.target);
  const heros = creerHeros(); scene.add(heros);
  const signe = new THREE.Sprite(new THREE.SpriteMaterial({ map: texteSprite("!"), depthTest: false })); signe.scale.set(.7, .7, 1); signe.visible = false; signe.renderOrder = 9; scene.add(signe);
  return R3 = { rendu, scene, camera, ciel, soleil, heros, signe, maps: {}, actuelle: -1 };
}
function texteSprite(ch) {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.strokeStyle = "#2a1d24"; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#e0453a"; g.font = "bold 84px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 64, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function creerHeros() {   // un enfant tout rond en ciré à capuche violet, avec sa lanterne
  const g = new THREE.Group(), corps = new THREE.Group(); g.add(corps);
  const m = (geo, c, x, y, z, e) => { const o = new THREE.Mesh(geo, mat3(c, e)); o.position.set(x, y, z); o.castShadow = true; corps.add(o); return o; };
  m(new THREE.CapsuleGeometry(.2, .22, 6, 14), COUL.capuche, 0, .36, 0);
  m(new THREE.SphereGeometry(.25, 18, 14), COUL.capuche2, 0, .74, -.04);          // la capuche
  m(new THREE.SphereGeometry(.2, 18, 14), COUL.peau, 0, .73, .06);               // le visage
  m(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, -.075, .76, .245); m(new THREE.SphereGeometry(.035, 8, 6), COUL.yeux, .075, .76, .245);
  m(new THREE.SphereGeometry(.07, 10, 8), COUL.botte, -.09, .06, .02); m(new THREE.SphereGeometry(.07, 10, 8), COUL.botte, .09, .06, .02);
  m(new THREE.CylinderGeometry(.01, .01, .14, 4), COUL.lampe, .27, .5, .08);
  m(new THREE.BoxGeometry(.12, .15, .12), COUL.lumiere, .27, .37, .08, 1.2);       // la lanterne
  const lueur = new THREE.PointLight(0xffd27a, 1.2, 3, 1.6); lueur.position.set(.27, .4, .1); corps.add(lueur);
  g.userData = { corps, lueur };
  return g;
}
function prisme(w, d, h) {   // un toit à deux pentes, faîtage le long de x
  const x = w / 2, z = d / 2, p = [-x, 0, -z, x, 0, -z, x, h, 0, -x, h, 0, -x, 0, z, x, 0, z];
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  geo.setIndex([0, 3, 2, 0, 2, 1, 4, 5, 2, 4, 2, 3, 0, 4, 3, 1, 2, 5, 0, 1, 5, 0, 5, 4]); geo.computeVertexNormals(); return geo;
}
function dioramaJ(m) {   // construit la map m en 3D, une seule fois
  const R = moteurJeu(); if (R.maps[m]) return R.maps[m];
  const G = MAPS[m].grille, H = G.length, W = G[0].length, groupe = new THREE.Group(), anim = [], rnd = hasard(311 + m * 53), nuit = !!MAPS[m].nuit;
  const ajoute = (o, x, y, z, ombre) => { o.position.set(x, y, z); if (ombre !== false) o.castShadow = true; groupe.add(o); return o; };
  // le sol : une seule géométrie (dessus de chaque case, et flancs de terre là où le sol descend)
  const pos = [], col = [], c3 = new THREE.Color();
  const quad = (a, b, c, d, hex) => { c3.setHex(hex); for (const p of [a, b, c, a, c, d]) { pos.push(...p); col.push(c3.r, c3.g, c3.b); } };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = G[y][x], h = hautSol(ch), x0 = x - .5, x1 = x + .5, z0 = y - .5, z1 = y + .5;
    const dessus = "=<>".includes(ch) ? COUL.chemin : ch === ":" ? COUL.sable : h < 0 ? COUL.fond : rnd() < .5 ? COUL.herbe : COUL.herbe2;
    quad([x0, h, z0], [x0, h, z1], [x1, h, z1], [x1, h, z0], dessus);
    [[0, -1, [x0, z0], [x1, z0]], [0, 1, [x1, z1], [x0, z1]], [-1, 0, [x0, z1], [x0, z0]], [1, 0, [x1, z0], [x1, z1]]].forEach(([dx, dy, a, b]) => {
      const n = G[y + dy] && G[y + dy][x + dx], nh = n === undefined ? -1.1 : hautSol(n);
      if (nh < h) { quad([a[0], nh, a[1]], [b[0], nh, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], COUL.terre); if (h === 0 && n !== undefined) quad([a[0], h - .06, a[1]], [b[0], h - .06, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], dessus); }
      else if (n === undefined) quad([a[0], -1.1, a[1]], [b[0], -1.1, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], COUL.terre);
    });
  }
  const sol = new THREE.BufferGeometry(); sol.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sol.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); sol.computeVertexNormals();
  const msol = new THREE.Mesh(sol, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); msol.receiveShadow = true; groupe.add(msol);
  // l'eau : une surface claire, un peu transparente, au-dessus du fond
  const eauPos = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ("~b".includes(G[y][x])) eauPos.push([x, y]);
  if (eauPos.length) {
    const ge = new THREE.BufferGeometry(), p = []; eauPos.forEach(([x, y]) => p.push(x - .5, -.1, y - .5, x - .5, -.1, y + .5, x + .5, -.1, y + .5, x - .5, -.1, y - .5, x + .5, -.1, y + .5, x + .5, -.1, y - .5));
    ge.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); ge.computeVertexNormals();
    const me = new THREE.MeshLambertMaterial({ color: COUL.eau, transparent: true, opacity: .78, side: THREE.DoubleSide, emissive: COUL.eau, emissiveIntensity: .12 });
    const eau = new THREE.Mesh(ge, me); eau.receiveShadow = true; eau.userData.vivant = true; groupe.add(eau); anim.push(t => { me.emissiveIntensity = .1 + .06 * Math.sin(t / 700); });
  }
  // herbes hautes et fleurs : des milliers de petits brins, dessinés en une fois
  const brins = [], fleurs = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (G[y][x] === ",") for (let i = 0; i < 9; i++) brins.push([x + (rnd() - .5) * .85, y + (rnd() - .5) * .85, .7 + rnd() * .6]);
    if (G[y][x] === "*") for (let i = 0; i < 7; i++) fleurs.push([x + (rnd() - .5) * .8, y + (rnd() - .5) * .8, COUL.fleurs[(rnd() * 4) | 0]]);
  }
  const mat4 = new THREE.Matrix4(), q = new THREE.Quaternion(), un = new THREE.Vector3(1, 1, 1);
  if (brins.length) { const ib = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, .42, 5).translate(0, .21, 0), mat3(COUL.hautes), brins.length);
    brins.forEach(([x, z, s], i) => { q.setFromAxisAngle(new THREE.Vector3(rnd() - .5, 0, rnd() - .5).normalize(), (rnd() - .5) * .5); ib.setMatrixAt(i, mat4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(s, s, s))); });
    ib.castShadow = true; groupe.add(ib); }
  if (fleurs.length) { const ifl = new THREE.InstancedMesh(new THREE.SphereGeometry(.065, 8, 6), new THREE.MeshLambertMaterial(), fleurs.length);
    fleurs.forEach(([x, z, c], i) => { ifl.setMatrixAt(i, mat4.compose(new THREE.Vector3(x, .07, z), q.identity(), un)); ifl.setColorAt(i, c3.setHex(c)); }); groupe.add(ifl); }
  // maisons : chaque bloc de toits et de murs devient une maison
  const vu = new Set(); let nMaison = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!"RHD".includes(G[y][x]) || vu.has(x + "," + y)) continue;
    const bloc = [], file = [[x, y]]; vu.add(x + "," + y);
    while (file.length) { const [a, b] = file.pop(); bloc.push([a, b]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (a + dx) + "," + (b + dy);
      if (!vu.has(k) && "RHD".includes((G[b + dy] || "")[a + dx] || "")) { vu.add(k); file.push([a + dx, b + dy]); } }); }
    const xs = bloc.map(c => c[0]), ys = bloc.map(c => c[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = x1 - x0 + 1 - .1, d = y1 - y0 + 1 - .1, cx = (x0 + x1) / 2, cz = (y0 + y1) / 2, hm = 1.05, toit = COUL.toits[nMaison++ % 4];
    ajoute(new THREE.Mesh(new THREE.BoxGeometry(w, hm, d), mat3(COUL.mur)), cx, hm / 2, cz).receiveShadow = true;
    ajoute(new THREE.Mesh(prisme(w + .3, d + .3, .75), mat3(toit)), cx, hm, cz);
    ajoute(new THREE.Mesh(new THREE.BoxGeometry(.22, .5, .22), mat3(COUL.terre)), cx + w * .3, hm + .5, cz - d * .15);
    bloc.filter(([a, b]) => b === y1).forEach(([a]) => {
      if (G[y1][a] === "D") ajoute(new THREE.Mesh(new THREE.BoxGeometry(.36, .62, .06), mat3(COUL.porte)), a, .31, cz + d / 2 + .02, false);
      else ajoute(new THREE.Mesh(new THREE.BoxGeometry(.3, .28, .05), mat3(COUL.vitre, nuit ? 1.4 : .5)), a, .62, cz + d / 2 + .02, false);
    });
  }
  // les autres objets, case par case
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = G[y][x], jx = (rnd() - .5) * .16, jz = (rnd() - .5) * .16, s = .85 + rnd() * .3;
    if (ch === "T") {
      const arbre = new THREE.Group(); arbre.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, .45, 7), mat3(COUL.tronc)), { castShadow: true }));
      arbre.children[0].position.y = .22;
      if (rnd() < .65) [[.46, .55, .5], [.36, .5, .8], [.24, .42, 1.08]].forEach(([r, hh, yy]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, hh, 9), mat3(rnd() < .5 ? COUL.pin : COUL.pin2)); c.position.y = yy; c.castShadow = true; arbre.add(c); });
      else [[.42, 0, .72, 0], [.3, -.16, .98, .08], [.26, .18, .92, -.06]].forEach(([r, ox, yy, oz]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat3(rnd() < .5 ? COUL.feuillu : COUL.feuillu2)); b.position.set(ox, yy, oz); b.castShadow = true; arbre.add(b); });
      arbre.scale.setScalar(s); arbre.rotation.y = rnd() * 6; ajoute(arbre, x + jx, 0, y + jz, false);
    }
    if (ch === "#") { const r = ajoute(new THREE.Mesh(new THREE.DodecahedronGeometry(.36, 1), mat3(COUL.rocher)), x + jx, .16, y + jz); r.scale.set(s, .72 * s, s); r.rotation.y = rnd() * 6; }
    if (ch === "o") {
      const p = ajoute(new THREE.Mesh(new THREE.CapsuleGeometry(.2, .85, 4, 8), mat3(COUL.pierre)), x, .62, y); p.scale.set(1.1, 1, .7); p.rotation.set((rnd() - .5) * .12, rnd() * 3, (rnd() - .5) * .12);
      const r = ajoute(new THREE.Mesh(new THREE.BoxGeometry(.12, .2, .02), new THREE.MeshLambertMaterial({ color: COUL.rune, emissive: COUL.rune })), x, .75, y + .16, false); r.userData.vivant = true;
      anim.push(t => { r.material.emissiveIntensity = (nuit ? 1.4 : .3) + Math.sin(t / 500 + x) * .4; });
    }
    if (ch === "f") {
      const g = new THREE.Group();
      [-.38, .38].forEach(o => { const pt = new THREE.Mesh(new THREE.BoxGeometry(.1, .5, .1), mat3(COUL.bois)); pt.position.set(o, .25, 0); pt.castShadow = true; g.add(pt); });
      [.2, .38].forEach(hh => { const r = new THREE.Mesh(new THREE.BoxGeometry(1, .07, .05), mat3(COUL.bois)); r.position.y = hh; r.castShadow = true; g.add(r); });
      if (!(G[y][x - 1] === "f" || G[y][x + 1] === "f")) g.rotation.y = Math.PI / 2; ajoute(g, x, 0, y, false);
    }
    if (ch === "L") {
      ajoute(new THREE.Mesh(new THREE.CylinderGeometry(.04, .06, 1.35, 6), mat3(COUL.lampe)), x, .67, y);
      ajoute(new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), mat3(COUL.lumiere, nuit ? 2 : .8)), x, 1.42, y, false);
      if (nuit) { const l = new THREE.PointLight(0xffd27a, 3, 5, 1.4); l.position.set(x, 1.3, y); groupe.add(l); }
    }
    if (ch === "S") {
      ajoute(new THREE.Mesh(new THREE.BoxGeometry(.08, .6, .08), mat3(COUL.tronc)), x, .3, y);
      ajoute(new THREE.Mesh(new THREE.BoxGeometry(.6, .34, .07), mat3(COUL.bois)), x, .62, y + .02);
    }
    if (ch === "b") {
      ajoute(new THREE.Mesh(new THREE.BoxGeometry(.98, .08, .98), mat3(COUL.bois)), x, -.02, y).receiveShadow = true;
      if (G[y][x - 1] !== "b") ajoute(new THREE.Mesh(new THREE.BoxGeometry(.06, .3, 1), mat3(COUL.tronc)), x - .46, .13, y);
      if (G[y][x + 1] !== "b") ajoute(new THREE.Mesh(new THREE.BoxGeometry(.06, .3, 1), mat3(COUL.tronc)), x + .46, .13, y);
    }
    if ((ch === "<" || ch === ">") && G[y][x + 1] !== ch) {   // un cristal flotte au-dessus de chaque sortie
      const c = ajoute(new THREE.Mesh(new THREE.OctahedronGeometry(.18), new THREE.MeshLambertMaterial({ color: COUL.cristal, emissive: COUL.cristal, emissiveIntensity: .9 })), G[y][x - 1] === ch ? x - .5 : x, .9, y, false);
      c.userData.vivant = true; const sortie = ch;
      anim.push(t => { c.rotation.y = t / 600; c.position.y = .9 + Math.sin(t / 400) * .08;
        const scelle = sortie === ">" && m + 1 === FINALE && !enBoss && partie() && partie().jeu && resteAvantFinale(partie());
        c.material.color.setHex(scelle ? COUL.scelle : COUL.cristal); c.material.emissive.setHex(scelle ? COUL.scelle : COUL.cristal); });
    }
  }
  msol.userData.vivant = true; fusionnerJ(groupe);
  return R.maps[m] = { groupe, anim, nuit, W, H };
}
function fusionnerJ(groupe) {   // tous les objets immobiles de même couleur fondus en un seul : bien moins de travail pour le téléphone
  groupe.updateMatrixWorld(true);
  const parMat = new Map(), vieux = [];
  groupe.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.userData.vivant) return;
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld); g.deleteAttribute("uv"); if (!g.index) return;
    if (!parMat.has(o.material)) parMat.set(o.material, { g: [], ombre: false }); const e = parMat.get(o.material); e.g.push(g); e.ombre = e.ombre || o.castShadow; vieux.push(o); });
  vieux.forEach(o => o.parent.remove(o));
  parMat.forEach(({ g, ombre }, mat) => { const m = new THREE.Mesh(mergeGeometries(g), mat); m.castShadow = ombre; m.receiveShadow = true; groupe.add(m); });
}
function montrerMapJ(m) {
  const R = moteurJeu(), d = dioramaJ(m);
  if (R.actuelle === m) return d;
  if (R.maps[R.actuelle]) R.scene.remove(R.maps[R.actuelle].groupe);
  R.scene.add(d.groupe); R.actuelle = m;
  R.ciel.color.setHex(d.nuit ? 0x8a7fd0 : 0xd8ecff); R.ciel.groundColor.setHex(d.nuit ? 0x2a2046 : 0x7a5a40); R.ciel.intensity = d.nuit ? .9 : 1.6;
  R.soleil.color.setHex(d.nuit ? 0x9fb0ff : 0xfff0d6); R.soleil.intensity = d.nuit ? .55 : 2.2;
  R.heros.userData.lueur.intensity = d.nuit ? 3 : 1.2;
  $("jeu").classList.toggle("nuit", d.nuit);
  return d;
}
const ANGLE = { bas: 0, droite: Math.PI / 2, haut: Math.PI, gauche: -Math.PI / 2 };
function boucleJeu(t) {
  JEU.raf = 0; if ($("jeu").hidden) return;
  JEU.raf = requestAnimationFrame(boucleJeu);
  const R = moteurJeu(), cv = $("jeuCanvas"), W = cv.clientWidth, H = cv.clientHeight;
  const taille = R.rendu.getSize(new THREE.Vector2()); if (taille.x !== W || taille.y !== H) R.rendu.setSize(W, H, false);
  // un pas en cours ? on avance en douceur, sinon on repart si une flèche est tenue
  let fx = JEU.x, fy = JEU.y, bond = 0;
  if (JEU.pas) { const k = Math.min(1, (t - JEU.pas.t0) / DUREE_PAS); fx = JEU.pas.de[0] + (JEU.x - JEU.pas.de[0]) * k; fy = JEU.pas.de[1] + (JEU.y - JEU.pas.de[1]) * k; bond = Math.sin(k * Math.PI) * .12;
    if (k >= 1) { finPas(); fx = JEU.x; fy = JEU.y; bond = 0; } }
  if (!JEU.pas && JEU.tenu) essayerPas(JEU.tenu);
  const d = montrerMapJ(JEU.m), h = R.heros, sol = hautSol(tuileJ(JEU.m, Math.round(fx), Math.round(fy)));
  h.position.set(fx, Math.max(0, sol) + bond, fy);
  const cible = ANGLE[JEU.dir], da = Math.atan2(Math.sin(cible - h.rotation.y), Math.cos(cible - h.rotation.y)); h.rotation.y += da * .35;
  h.userData.corps.scale.y = 1 + Math.sin(t / 260) * .015;
  // caméra isométrique qui suit le héros
  const demi = 3.9, ratio = W / Math.max(1, H);
  Object.assign(R.camera, { left: -demi, right: demi, top: demi / ratio, bottom: -demi / ratio }); R.camera.updateProjectionMatrix();
  R.camera.position.set(fx + 10, 10.5, fy + 10); R.camera.lookAt(fx, 0, fy);
  R.soleil.position.set(fx - 5, 12, fy + 3); R.soleil.target.position.set(fx, 0, fy);
  d.anim.forEach(f => f(t));
  const rv = JEU.revele; R.signe.visible = !!rv;
  if (rv) R.signe.position.set(rv.q.x, 1.25 + Math.abs(Math.sin(t / 220)) * .2, rv.q.y);
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
function allumerJ(n) { document.querySelectorAll("#jeuLeds i").forEach((l, i) => l.classList.toggle("on", i < n)); }

// ---------- boutons (croix directionnelle, A, B) et clavier ----------
document.querySelectorAll("#jeu [data-dir]").forEach(b => {
  const go = e => { e.preventDefault(); JEU && (JEU.tenu = b.dataset.dir); b.classList.add("enfonce"); essayerPas(b.dataset.dir); };
  const stop = () => { if (JEU && JEU.tenu === b.dataset.dir) JEU.tenu = null; b.classList.remove("enfonce"); };
  b.addEventListener("pointerdown", go); ["pointerup", "pointercancel", "pointerleave"].forEach(ev => b.addEventListener(ev, stop));
});
$("jeuA").addEventListener("pointerdown", e => { e.preventDefault(); if (!(JEU && JEU.revele)) boutonA(); });
$("jeuA").addEventListener("click", () => { if (JEU && JEU.revele) trouveJ(); });   // ouvrir la caméra demande un vrai clic sur iPhone
$("jeuB").addEventListener("pointerdown", e => { e.preventDefault(); boutonB(); });
const TOUCHES = { ArrowUp: "haut", ArrowDown: "bas", ArrowLeft: "gauche", ArrowRight: "droite", z: "haut", s: "bas", q: "gauche", d: "droite", w: "haut", a: "gauche" };
addEventListener("keydown", e => {
  if (!JEU || $("jeu").hidden) return;
  if (TOUCHES[e.key]) { e.preventDefault(); JEU.tenu = TOUCHES[e.key]; essayerPas(JEU.tenu); }
  else if (!e.repeat && (e.key === " " || e.key === "Enter")) { e.preventDefault(); boutonA(); }
  else if (!e.repeat && (e.key === "Escape" || e.key === "Backspace")) { e.preventDefault(); boutonB(); }
});
addEventListener("keyup", e => { if (JEU && TOUCHES[e.key] === JEU.tenu) JEU.tenu = null; });
$("jeuQuitter").addEventListener("click", () => { fermerJeu(); enBoss = false; majAccueil(); montrer("accueil"); });

window.__jeu = { etat: () => JEU && { m: JEU.m, x: JEU.x, y: JEU.y, dir: JEU.dir, revele: JEU.revele && JEU.revele.q.k, cibles: ciblesJ() },
  aller: (m, x, y) => { JEU.m = m; JEU.x = x; JEU.y = y; JEU.pas = null; }, pas: d => essayerPas(d), A: () => boutonA(), B: () => boutonB(),
  maps: MAPS, accessibles: m => casesAccessibles(m).length, trouver: k => { JEU.revele = { q: { k }, t0: 0 }; trouveJ(); } };
