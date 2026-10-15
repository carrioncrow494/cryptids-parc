
/* ===================== Aventure virtuelle : jeu vidéo en pixel art (façon Pokémon / Zelda Game Boy) ===================== */
// Chaque map est une grille de lettres : une lettre = une case de 16 × 16 pixels (voir TUILES).
// Maps provisoires en attendant celles de Sam : quand il les fournira, on mettra le nom du fichier dans `image`.
// L'image remplace alors le dessin des cases, et la grille sert toujours pour les murs, les sorties et les cachettes.
const CASE = 16;
const TUILES = {
  ".": { libre: true }, ",": { libre: true }, "=": { libre: true }, ":": { libre: true }, "*": { libre: true }, "b": { libre: true },
  "<": { libre: true }, ">": { libre: true }, "P": { libre: true },
  "T": {}, "~": {}, "#": {}, "f": {}, "R": {}, "H": {}, "D": {}, "L": {}, "S": {}, "o": {}
};   // . herbe  , hautes herbes  = chemin  : sable  * fleurs  b pont  < > sorties  P départ
     // T arbre  ~ eau  # rocher  f barrière  R toit  H mur  D porte  L lampadaire  S panneau  o pierre levée
const MAPS = [
  { nom: "La forêt des Murmures", image: null, panneau: "Forêt des Murmures. Au nord : le village de Sporran.", grille: [
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
  { nom: "Le village de Sporran", image: null, panneau: "Village de Sporran. Au nord : le lac aux Brumes.", grille: [
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
  { nom: "Le lac aux Brumes", image: null, panneau: "Lac aux Brumes. Au nord : le cercle de pierres.", grille: [
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
  { nom: "Le cercle de pierres", image: null, nuit: true, finale: true, panneau: "Le cercle de pierres. Ici se cachent les derniers cryptides.", grille: [
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
    dernierBip: 0, eloigne: null, rendu: {} };
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

// ---------- dessin ----------
const PJ = { herbe: "#8fd16a", herbe2: "#7cc25a", herbe3: "#a6dd7d", hautes: "#4f9e45", hautes2: "#3b7f36", chemin: "#e2c48a", chemin2: "#cfae72",
  sable: "#f0dfa0", sable2: "#e0c985", eau: "#4fa3e0", eau2: "#7fc3f0", eau3: "#3a86c4", arbre: "#2f7a3a", arbre2: "#45a04a", arbre3: "#6cc05e", tronc: "#7a4b2a",
  contour: "#1d3324", rocher: "#9aa0a8", rocher2: "#6d737c", toit: "#d0564a", toit2: "#a83e36", mur: "#f4e6c6", mur2: "#d8c59c", porte: "#7a4b2a", vitre: "#ffe27a",
  barriere: "#d9b27a", fleurR: "#ff6b81", fleurB: "#ffffff", fleurJ: "#ffd84a", lampe: "#3a3f4a", lumiere: "#ffe9a0", pierre: "#a7a2b8", pierre2: "#77728a", panneau: "#b07a44" };
function dessinerMapJ(m, phase) {
  const g0 = MAPS[m].grille, W = g0[0].length * CASE, H = g0.length * CASE;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
  const r = hasard(1000 + m * 97), px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const sol = (c, x, y) => {   // le fond de chaque case
    if (c === "~") { px(x, y, CASE, CASE, PJ.eau); for (let i = 0; i < 3; i++) { const a = (r() * 12) | 0, b = (r() * 14) | 0; px(x + ((a + phase * 3) % 13), y + b, 3, 1, (i + phase) % 2 ? PJ.eau2 : PJ.eau3); } return; }
    if (c === "=" || c === "b") { px(x, y, CASE, CASE, PJ.chemin); for (let i = 0; i < 4; i++) px(x + ((r() * 15) | 0), y + ((r() * 15) | 0), 1, 1, PJ.chemin2); return; }
    if (c === ":") { px(x, y, CASE, CASE, PJ.sable); for (let i = 0; i < 4; i++) px(x + ((r() * 15) | 0), y + ((r() * 15) | 0), 1, 1, PJ.sable2); return; }
    px(x, y, CASE, CASE, PJ.herbe); for (let i = 0; i < 5; i++) { const a = (r() * 14) | 0, b = (r() * 14) | 0; px(x + a, y + b, 1, 2, r() < .5 ? PJ.herbe2 : PJ.herbe3); }
  };
  g0.forEach((ligne, j) => [...ligne].forEach((c, i) => {
    const x = i * CASE, y = j * CASE, h = (dx, dy, w, hh, col) => px(x + dx, y + dy, w, hh, col);
    sol(c === "b" ? "~" : "<>PSLfTo#RHD*,.".includes(c) ? "." : c, x, y);
    if (c === "b") { h(1, 0, 14, 16, PJ.chemin); h(1, 0, 1, 16, PJ.tronc); h(14, 0, 1, 16, PJ.tronc); for (let k = 2; k < 16; k += 4) h(2, k, 12, 1, PJ.chemin2); }
    if (c === "<" || c === ">") { h(0, 0, 16, 16, PJ.chemin); h(4, 6, 8, 4, PJ.chemin2); }
    if (c === ",") { for (let k = 0; k < 4; k++) { const a = (k % 2) * 8, b = (k >> 1) * 8; h(a + 1, b + 3, 6, 5, PJ.hautes2); h(a + 1, b + 1, 1, 4, PJ.hautes); h(a + 3, b, 1, 5, PJ.hautes); h(a + 5, b + 1, 1, 4, PJ.hautes); } }
    if (c === "*") { [[3, 3, PJ.fleurR], [10, 5, PJ.fleurB], [5, 10, PJ.fleurJ], [12, 12, PJ.fleurR]].forEach(([a, b, col]) => { h(a - 1, b, 3, 1, col); h(a, b - 1, 1, 3, col); h(a, b, 1, 1, PJ.fleurJ === col ? PJ.fleurR : PJ.fleurJ); }); }
    if (c === "T") { h(2, 13, 12, 2, "rgba(0,0,0,.25)"); h(6, 10, 4, 5, PJ.tronc); h(1, 2, 14, 10, PJ.contour); h(2, 1, 12, 11, PJ.arbre); h(3, 2, 8, 6, PJ.arbre2); h(4, 3, 3, 2, PJ.arbre3); h(1, 11, 14, 1, PJ.contour); }
    if (c === "#") { h(2, 4, 12, 10, PJ.contour); h(3, 3, 10, 10, PJ.rocher); h(3, 9, 10, 4, PJ.rocher2); h(5, 5, 3, 2, "#c5cad0"); }
    if (c === "o") { h(4, 13, 9, 2, "rgba(0,0,0,.3)"); h(4, 1, 8, 14, PJ.contour); h(5, 1, 6, 13, PJ.pierre); h(9, 2, 2, 12, PJ.pierre2); h(6, 4, 2, 1, "#c9c4da"); }
    if (c === "f") { h(0, 6, 16, 2, PJ.barriere); h(0, 11, 16, 2, PJ.barriere); h(2, 4, 2, 11, PJ.tronc); h(12, 4, 2, 11, PJ.tronc); }
    if (c === "R") { const haut = tuileJ(m, i, j - 1) !== "R"; h(0, 0, 16, 16, PJ.toit); for (let k = 3; k < 16; k += 4) h(0, k, 16, 1, PJ.toit2); if (haut) h(0, 0, 16, 2, PJ.toit2); }
    if (c === "H" || c === "D") { h(0, 0, 16, 16, PJ.mur); h(0, 14, 16, 2, PJ.mur2); h(0, 0, 16, 2, PJ.toit2);
      if (c === "D") { h(4, 4, 8, 12, PJ.contour); h(5, 5, 6, 11, PJ.porte); h(9, 10, 1, 1, PJ.vitre); } else { h(4, 5, 8, 6, PJ.contour); h(5, 6, 6, 4, PJ.vitre); h(8, 6, 1, 4, PJ.contour); } }
    if (c === "L") { h(6, 14, 5, 2, "rgba(0,0,0,.3)"); h(7, 4, 2, 11, PJ.lampe); h(5, 1, 6, 4, PJ.lampe); h(6, 2, 4, 2, PJ.lumiere); }
    if (c === "S") { h(7, 9, 2, 6, PJ.tronc); h(2, 3, 12, 7, PJ.contour); h(3, 4, 10, 5, PJ.panneau); h(5, 5, 6, 1, PJ.contour); h(5, 7, 4, 1, PJ.contour); }
  }));
  return cv;
}
function rendreMapJ(m) {
  const R = JEU.rendu; if (R[m]) return R[m];
  const M = MAPS[m];
  R[m] = [dessinerMapJ(m, 0), dessinerMapJ(m, 1)];
  if (M.image) { const i = new Image(); i.onload = () => { R[m] = [i, i]; }; i.src = M.image; }   // la map dessinée par Sam, si elle existe
  return R[m];
}
const DOS = ["....hhhh....", "...hhhhhhh..", "..hhhhhhhh..", "..hhhhhhhh..", "..hhhhhhhh..", "...hhhhhh...", "..pppppppp.l",
             ".pppppppppLL", ".pp.pppp.pLL", "....pppp..l.", "....p..p....", "...bb..bb..."];
function dessinerHeros(g, x, y, s, dir, marche) {
  const sp = dir === "haut" ? DOS : SPRITE, flip = dir === "gauche", w = 12 * s, h = 12 * s;
  const x0 = Math.round(x + (CASE * s - w) / 2), y0 = Math.round(y + CASE * s - h - s - (marche ? s : 0));
  g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(x0 + 2 * s, y + CASE * s - 2 * s, w - 4 * s, s * 1.5);
  sp.forEach((ligne, j) => [...ligne].forEach((ch, i) => { if (ch === ".") return; g.fillStyle = SPRITE_C[ch]; g.fillRect(x0 + (flip ? 11 - i : i) * s, y0 + j * s, s, s); }));
}
function boucleJeu(t) {
  JEU.raf = 0; if ($("jeu").hidden) return;
  JEU.raf = requestAnimationFrame(boucleJeu);
  const cv = $("jeuCanvas"), dpr = Math.min(devicePixelRatio || 1, 3), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
  // un pas en cours ? on avance en douceur, sinon on repart si une flèche est tenue
  let fx = JEU.x, fy = JEU.y, marche = false;
  if (JEU.pas) { const k = Math.min(1, (t - JEU.pas.t0) / DUREE_PAS); fx = JEU.pas.de[0] + (JEU.x - JEU.pas.de[0]) * k; fy = JEU.pas.de[1] + (JEU.y - JEU.pas.de[1]) * k; marche = k < .5;
    if (k >= 1) { finPas(); fx = JEU.x; fy = JEU.y; } }
  if (!JEU.pas && JEU.tenu) essayerPas(JEU.tenu);
  const s = Math.max(2, Math.round(W / (CASE * 10))), T = CASE * s, M = MAPS[JEU.m], mw = M.grille[0].length * T, mh = M.grille.length * T;
  let ox = Math.round(W / 2 - (fx + .5) * T), oy = Math.round(H / 2 - (fy + .5) * T);
  ox = mw <= W ? Math.round((W - mw) / 2) : Math.min(0, Math.max(W - mw, ox)); oy = mh <= H ? Math.round((H - mh) / 2) : Math.min(0, Math.max(H - mh, oy));
  g.fillStyle = "#1d3324"; g.fillRect(0, 0, W, H);
  g.drawImage(rendreMapJ(JEU.m)[Math.floor(t / 600) % 2], ox, oy, mw, mh);
  if (JEU.revele) {   // le cryptide surgit : herbes qui tremblent et « ! »
    const q = JEU.revele.q, x = ox + q.x * T, y = oy + q.y * T, b = Math.sin(t / 60) * s;
    g.fillStyle = "#fff"; g.fillRect(x + 6 * s, y - 9 * s + b, 4 * s, 9 * s); g.fillStyle = "#d0243c"; g.fillRect(x + 7 * s, y - 8 * s + b, 2 * s, 5 * s); g.fillRect(x + 7 * s, y - 2 * s + b, 2 * s, s);
  }
  dessinerHeros(g, ox + fx * T, oy + fy * T, s, JEU.dir, marche);
  if (M.nuit) { g.fillStyle = "rgba(20,10,60,.38)"; g.fillRect(0, 0, W, H);
    const cx = ox + (fx + .5) * T, cy = oy + (fy + .3) * T, l = g.createRadialGradient(cx, cy, 0, cx, cy, T * 3.2);
    l.addColorStop(0, "rgba(255,215,94,.28)"); l.addColorStop(1, "rgba(255,215,94,0)"); g.fillStyle = l; g.fillRect(0, 0, W, H); }
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
