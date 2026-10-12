import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ===================== À PERSONNALISER =====================
   Une traque par QR code : l'adresse se termine par ?m=1 … ?m=12
   membres : la ou les créatures de la traque (les lutins sont deux, capturés l'un après l'autre)
     ar       : vidéo de la créature dans la caméra (couleur en haut, transparence en bas)
     ratio    : largeur / hauteur de l'image
     taille   : hauteur de l'image en mètres dans le parc
     altitude : hauteur au-dessus du sol (mètres)
   image : animation du grimoire ; ombre : silhouette ; relache : vidéo de relâche ; figurine : modèle 3D HIGH */
const TRAQUES = {
  "1":  { cle: "mothman", nom: "Michmuche, le Mothman", indice: "aime la lumière",
          texte: "Un papillon de nuit géant aux grands yeux rouges. On ne sait pas d'où il vient, mais il apparaît pour prévenir d'un danger. Il est très timide et ne résiste jamais à une lampe allumée.",
          membres: [{ ar: "ar-mothman.mp4", ratio: 1.237, taille: 1.57, pied: 0.199, altitude: 0.2 }] },
  "2":  { cle: "nessie", nom: "Ness, le monstre du loch", indice: "vit dans l'eau",
          texte: "Elle vit au fond d'un lac très profond et ne sort que son long cou pour dire bonjour. Elle adore faire des farces et personne n'arrive à la prendre en photo, car elle plonge toujours juste avant le clic !",
          membres: [{ ar: "ar-nessie.mp4", ratio: 0.994, taille: 2.68, pied: 0.04, altitude: 0 }] },
  "3":  { cle: "thunderbird", nom: "Huhuk, le Thunderbird", indice: "crée de l'électricité", son: "cri-thunderbird.m4a",
          texte: "Un oiseau immense qui vole au-dessus des nuages. Quand il bat des ailes, on entend le tonnerre, et quand il cligne des yeux, on voit des éclairs.",
          membres: [{ ar: "ar-thunderbird.mp4", ratio: 0.979, taille: 2.12, pied: 0.103, altitude: 0.3 }] },
  "4":  { cle: "barghest", nom: "Whitby, le Barghest", indice: "vit dans les endroits sombres",
          texte: "Un gros chien fantôme, noir et tout ébouriffé, qui se promène la nuit sur les landes. Il a l'air impressionnant, mais il cherche surtout quelqu'un pour lui lancer un bâton.",
          membres: [{ ar: "ar-barghest.mp4", ratio: 1.014, taille: 1.70, pied: 0.011, altitude: 0 }] },
  "5":  { cle: "faery", nom: "Loupiote, la Faery", indice: "adore la musique",
          texte: "Une toute petite fée qui brille comme une veilleuse. Elle éclaire le chemin de ceux qui ont un peu peur du noir ou qui se sont perdus.",
          membres: [{ ar: "ar-faery.mp4", ratio: 1.006, taille: 1.96, pied: 0.198, altitude: 0.5 }] },
  "6":  { cle: "lutins", nom: "Kumquat & Kiwi, les lutins", indice: "se cachent dans les jardins et adorent les marrons",
          texte: "Deux lutins inséparables : l'un orange et farceur, l'autre vert et râleur. Kumquat invente des farces, Kiwi ronchonne, et ils finissent toujours par rire ensemble.",
          membres: [{ nom: "Kiwi", ar: "ar-lutin_green.mp4", ratio: 1.011, taille: 1.22, pied: 0.036, altitude: 0 },
                    { nom: "Kumquat", ar: "ar-lutin_orange.mp4", ratio: 1.01, taille: 1.31, pied: 0.043, altitude: 0 }] },
  "7":  { cle: "jackalope", nom: "Bucky, le Jackalope", indice: "court plus vite que le vent",
          texte: "Un lapin malicieux qui porte de petits bois de cerf sur la tête. Il adore la musique et reprend les chansons des voyageurs. Mais il court si vite que personne n'a jamais réussi à le rattraper.",
          membres: [{ ar: "ar-jackalope.mp4", ratio: 1.416, taille: 2.33, pied: 0.356, altitude: 0 }] },
  "8":  { cle: "yeti", nom: "Migou, le Yeti", indice: "laisse d'énormes traces de pas",
          texte: "Un géant tout blanc et tout doux qui vit dans les montagnes enneigées. Il laisse d'énormes traces de pas et fait les meilleurs câlins du monde.",
          membres: [{ ar: "ar-yeti.mp4", ratio: 1.0, taille: 1.61, pied: 0.066, altitude: 0 }] },
  "9":  { cle: "gargouille", nom: "Ardoise, la Gargouille", indice: "aime se percher tout en haut",
          texte: "Perchée sur le toit, elle reste immobile comme une pierre toute la journée. La nuit, elle s'étire, bâille et surveille le quartier pour que tout le monde dorme tranquille. Mais attention, elle crache de l'eau sur ceux qui font trop de bruit !",
          membres: [{ ar: "ar-gargouille.mp4", ratio: 1.119, taille: 1.32, pied: 0.048, altitude: 0.2 }] },
  "10": { cle: "chupacabra", nom: "Moca, le Chupacabra", indice: "a toujours un petit creux",
          texte: "Une petite créature à piquants qui vient des pays chauds. On la dit farouche, mais elle est surtout très gourmande et raffole du lait de chèvre.",
          membres: [{ ar: "ar-chupacabra.mp4", ratio: 1.421, taille: 2.62, pied: 0.32, altitude: 0 }] },
  "11": { cle: "kraken", nom: "Bloop, le Kraken", indice: "collectionne les trésors",
          texte: "Une pieuvre géante qui habite tout au fond de l'océan. Elle collectionne les trésors des bateaux pirates qui ont coulé. Avec ses huit bras, elle peut chatouiller huit poissons à la fois.",
          membres: [{ ar: "ar-kraken.mp4", ratio: 1.022, taille: 1.39, pied: 0.035, altitude: 0.1 }] },
  "12": { cle: "swamp", nom: "Gadoo, le monstre des marais", indice: "adore les flaques de boue",
          texte: "Un bonhomme tout vert, couvert d'algues et de mousse. Son jeu préféré est de sauter dans les flaques de boue, et il n'a jamais besoin de prendre de bain !",
          membres: [{ ar: "ar-swamp.mp4", ratio: 1.067, taille: 1.43, pied: 0.034, altitude: 0 }] }
};
const GARDIEN = { cle: "catsith", nom: "Sporran, le Cat sìth",
  texte: "Un grand chat noir d'Écosse avec une tache blanche en forme de cœur sur le poitrail. Certains disent que c'est en fait une sorcière transformée. Il adore se glisser sans bruit dans les collines et ronronne si fort qu'on le prend pour le vent." };
const INTRO = [
  "Chapristi ! On m'a volé mon précieux grimoire contenant l'ensemble des cryptides. J'ai pu le retrouver, mais certains se sont égarés et perdus dans notre monde. Aide-moi à les sauver.",
  "Quoi !! Tu ne sais pas ce que c'est qu'un cryptide ?\nUn cryptide est une petite créature souvent craintive, qui vit cachée. Elles sont difficiles à voir avec des yeux d'humains.",
  "Tiens ! Prends cet œil magique pour les trouver. Une fois fait, capture-les avec le sceau magique ou en tapotant l'écran. Nous les relâcherons ensemble dans leur environnement.",
  "Tu gagneras des figurines à collectionner pour chaque sauvetage.\nAllez vite, dépêche-toi !"
];
const YEUX = 1.2;   // hauteur du téléphone (mètres)
/* =========================================================== */
// les fichiers de chaque créature suivent son nom
for (const t of Object.values(TRAQUES)) { t.membres.forEach(m => m.id = m.ar.replace("ar-", "").replace(".mp4", "")); t.image = "solo-" + t.cle + ".webp"; t.ombre = "ombre-" + t.cle + ".png"; t.relache = "relache-" + t.cle + ".mp4"; }
GARDIEN.image = "grimoire-catsith.webp"; GARDIEN.ombre = "ombre-catsith.png"; GARDIEN.relache = "relache-catsith.mp4";
const FIGURINES = { mothman: ["figurine-mothman.glb"], nessie: ["figurine-nessie.glb"], thunderbird: ["figurine-thunderbird.glb"], barghest: ["figurine-barghest.glb"],
  faery: ["figurine-faery.glb"], lutins: ["figurine-lutin_green.glb", "figurine-lutin_orange.glb"], jackalope: ["figurine-jackalope.glb"], yeti: ["figurine-yeti.glb"],
  gargouille: ["figurine-gargouille.glb"], chupacabra: ["figurine-chupacabra.glb"], kraken: ["figurine-kraken.glb"], swamp: ["figurine-swamp.glb"], catsith: ["figurine-catsith.glb"] };

const $ = id => document.getElementById(id);
const ids = Object.keys(TRAQUES);
const DEG = Math.PI / 180;
document.querySelectorAll(".ecran").forEach(e => { if (e.id !== "intro" && e.id !== "carteParents") e.prepend($("tpl-decor").content.cloneNode(true)); });
const montrer = (id) => { ["entree", "accueil", "parents", "carteParents", "partie", "intro", "victoire", "grimoire"].forEach(k => $(k).hidden = k !== id); if (id && typeof changerAmbiance === "function") changerAmbiance("menu"); };

/* ===================== Sauvegarde (sur ce téléphone) ===================== */
const CLES = { merci: "cryptidsParc-merci", partie: "cryptidsParc-partie", pris: "cryptidsParc-pris", relache: "cryptidsParc-relaches", mode: "cryptidsParc-mode", membres: "cryptidsParc-membres", intro: "cryptidsParc-intro-vue", son: "cryptidsParc-son" };
const lire = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const pris = () => lire(CLES.pris, []).filter(k => TRAQUES[k]);
const relaches = () => lire(CLES.relache, []);
const ajouter = (cle, val) => { const l = lire(cle, []); if (!l.includes(val)) { l.push(val); ecrire(cle, l); } };
const mode = () => lire(CLES.mode, "qr");
// une partie = une sélection de créatures à sauver (la collection du grimoire, elle, se garde d'une partie à l'autre)
const partie = () => lire(CLES.partie, null);
const enCours = () => { const p = partie(); return p && p.pris.length < p.liste.length ? p : null; };
function majPartie(f) { const p = partie(); if (!p) return; f(p); ecrire(CLES.partie, p); }
try { ["monstresPris", "chasseMonstres-inventaire-v2", "chasseMonstres-relaches-v1"].forEach(k => localStorage.removeItem(k)); } catch (e) {}

/* ===================== Sons : musique et bruitages fabriqués par code ===================== */
let audio = null, maitre = null, musiqueOn = false, sonActif = lire(CLES.son, true);
const tampons = {};
function initAudio() {
  if (audio) { audio.resume(); return; }
  try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  maitre = audio.createGain(); maitre.gain.value = sonActif ? 1 : 0; maitre.connect(audio.destination);
  audio.resume();
  charger("sigil", "sigil.m4a");
  lancerMusique();
}
async function charger(nom, url) { try { const r = await fetch(url); tampons[nom] = await audio.decodeAudioData(await r.arrayBuffer()); } catch (e) {} }
function jouerTampon(nom, vol = 1, pan = 0) { if (!audio || !sonActif || !tampons[nom]) return; const s = audio.createBufferSource(), g = audio.createGain(); g.gain.value = vol; s.buffer = tampons[nom];
  let n = s.connect(g); if (audio.createStereoPanner) { const p = audio.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); n = n.connect(p); } n.connect(maitre); s.start(); }
function note(freq, debut, duree, { type = "sine", vol = .2, attaque = .01, sortie = maitre, filtre = 0 } = {}) {
  if (!audio) return; const t = audio.currentTime + debut, o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attaque); g.gain.exponentialRampToValueAtTime(.0008, t + duree);
  let n = o; if (filtre) { const f = audio.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filtre; o.connect(f); n = f; }
  n.connect(g).connect(sortie); o.start(t); o.stop(t + duree + .05);
}
function souffle(debut, duree, de, a, vol = .25) {
  if (!audio) return; const t = audio.currentTime + debut, n = audio.sampleRate * duree, b = audio.createBuffer(1, n, audio.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain(); s.buffer = b; f.type = "bandpass"; f.Q.value = 2;
  f.frequency.setValueAtTime(de, t); f.frequency.exponentialRampToValueAtTime(a, t + duree);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + duree * .3); g.gain.linearRampToValueAtTime(0, t + duree);
  s.connect(f).connect(g).connect(maitre); s.start(t);
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const SFX = {
  clic: () => { note(hz(81), 0, .25, { vol: .16 }); note(hz(88), .05, .3, { vol: .1 }); note(hz(93), .1, .35, { vol: .05 }); },
  valider: () => { [69, 74, 78, 81].forEach((m, i) => note(hz(m + 12), i * .06, .6, { vol: .12, type: "triangle" })); souffle(0, .35, 800, 4000, .08); },
  sceau: () => { souffle(0, .8, 400, 6000, .22); [62, 69, 74, 81, 86].forEach((m, i) => note(hz(m), i * .05, 1, { vol: .1, type: "triangle" })); note(hz(38), 0, 1, { vol: .3 }); },
  rate: () => { note(hz(50), 0, .3, { vol: .15, type: "square", filtre: 500 }); note(hz(49), .12, .35, { vol: .12, type: "square", filtre: 500 }); },
  oeil: () => { souffle(0, .9, 300, 3000, .2); [62, 66, 69, 74].forEach((m, i) => note(hz(m), .15 + i * .09, 1, { vol: .08, type: "triangle" })); },
  revele: () => { [74, 78, 81, 86, 90].forEach((m, i) => note(hz(m), i * .07, 1.4, { vol: .09 })); souffle(0, .6, 2000, 6000, .08); },
  proche: () => note(hz(86), 0, .5, { vol: .05 }),
  capture: () => { jouerTampon("sigil", .9); note(55, 0, 1.8, { vol: .35, type: "sine" }); },
  victoire: () => [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => note(hz(m), i * .11, .9, { vol: .12, type: "triangle" })),
  relache: () => {
    [38, 45, 50].forEach(m => note(hz(m), 0, 5.5, { type: "sawtooth", vol: .07, attaque: 2.2, filtre: 420 }));   // nappe grave
    note(hz(61), .4, 5, { type: "triangle", vol: .04, attaque: 2.5 });                                          // note étrange (triton)
    souffle(0, 3.2, 300, 5200, .14);                                                                             // souffle qui monte
    [74, 77, 73, 70, 69].forEach((m, i) => { const d = 1.6 + i * .55;                                            // clochettes en mineur
      note(hz(m), d, 2.4, { vol: .07 }); note(hz(m), d + .32, 2, { vol: .03 }); note(hz(m), d + .64, 1.6, { vol: .015 }); });
  },
  figurine: () => [72, 76, 79, 84, 88, 91].forEach((m, i) => note(hz(m), i * .06, 1.6, { vol: .08 })),
  page: () => { souffle(0, .25, 1500, 600, .1); }
};
const sfx = nom => { if (audio && sonActif && SFX[nom]) SFX[nom](); };
// musique d'ambiance : nappe mystérieuse et clochettes en ré mineur
// Musique façon conte macabre : valse de célesta, chœur « aah », pizzicatos (menus) ; même couleur mais plus rythmée pour la traque
let busMenu = null, busChasse = null, ambiance = "menu", tMenu = 0, tChasse = 0, nMenu = 0, nChasse = 0;
function choeur(m, d, dur, vol, sortie, voyelle = "a") {   // voix « aaah » / « ouuh » : dents de scie filtrées en formants
  const t = audio.currentTime + d, f = voyelle === "a" ? [730, 1090] : [320, 800];
  const g = audio.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .35); g.gain.linearRampToValueAtTime(0, t + dur);
  g.connect(sortie);
  [0, 7, -5].forEach(det => {
    const o = audio.createOscillator(), lfo = audio.createOscillator(), lg = audio.createGain();
    o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = det; lfo.frequency.value = 4.8 + Math.random(); lg.gain.value = 9; lfo.connect(lg).connect(o.detune);
    f.forEach(fc => { const bp = audio.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fc; bp.Q.value = 5; o.connect(bp); bp.connect(g); });
    o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  });
}
function timbale(d, sortie, vol = .35) {
  const t = audio.currentTime + d, o = audio.createOscillator(), g = audio.createGain();
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + .4);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(g).connect(sortie); o.start(t); o.stop(t + .65);
}
function balai(d, sortie, vol = .05) {
  const t = audio.currentTime + d, n = audio.sampleRate * .12, b = audio.createBuffer(1, n, audio.sampleRate), x = b.getChannelData(0);
  for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = audio.createBufferSource(), h = audio.createBiquadFilter(), g = audio.createGain(); h.type = "highpass"; h.frequency.value = 3000; g.gain.value = vol;
  s.buffer = b; s.connect(h).connect(g).connect(sortie); s.start(t);
}
const celesta = (m, d, l, sortie, vol = .07) => { note(hz(m), d, .6 + l * .35, { vol, sortie }); note(hz(m) * 2, d, .35, { vol: vol * .3, sortie }); note(hz(m) * 2.76, d, .2, { vol: vol * .12, sortie }); };
const pizz = (m, d, sortie, vol = .2) => note(hz(m), d, .35, { type: "triangle", vol, sortie });
const VALSE = {   // ré mineur, 3/4 — [note, temps]
  chords: [[50,53,57],[50,53,57],[49,53,57],[48,53,57],[46,50,53],[43,46,50],[40,43,46],[45,49,52],
           [50,53,57],[50,53,57],[43,46,50],[40,43,47],[46,50,53],[45,49,52],[50,53,57],[45,49,52]],
  melodie: [[[69,2],[74,1]],[[77,1],[76,1],[74,1]],[[73,2],[74,1]],[[76,3]],[[77,2],[79,1]],[[82,1],[81,1],[79,1]],[[76,2],[77,1]],[[76,3]],
            [[69,1],[74,1],[77,1]],[[81,1],[79,1],[77,1]],[[79,1],[82,1],[86,1]],[[85,3]],[[86,1],[82,1],[79,1]],[[76,1],[73,1],[69,1]],[[74,3]],[[0,1],[69,1],[73,1]]]
};
const MARCHE = {  // même tonalité, 4/4 plus vif — accords par mesure
  chords: [[50,53,57],[46,50,53],[43,46,50],[45,49,52],[50,53,57],[46,50,53],[52,55,58],[45,49,52]],
  motif: [81, 82, 81, 80, 81, 0, 77, 0]   // petit motif chromatique au célesta
};
function lancerMusique() {
  if (musiqueOn || !audio) return; musiqueOn = true;
  busMenu = audio.createGain(); busMenu.gain.value = .22; busMenu.connect(maitre);
  busChasse = audio.createGain(); busChasse.gain.value = 0; busChasse.connect(maitre);
  const echo = audio.createDelay(); echo.delayTime.value = .36; const retour = audio.createGain(); retour.gain.value = .3;
  busMenu.connect(echo); busChasse.connect(echo); echo.connect(retour); retour.connect(echo); retour.connect(maitre);
  tMenu = tChasse = audio.currentTime + .1; programmer();
}
function programmer() {
  if (!musiqueOn) return;
  const tv = .6;     // valse : 100 battements par minute
  while (tMenu < audio.currentTime + 1.5) {
    const i = nMenu % 16, d = tMenu - audio.currentTime, ch = VALSE.chords[i];
    pizz(ch[0] - 12, d, busMenu, .24);
    [1, 2].forEach(k => ch.forEach(m => pizz(m, d + k * tv, busMenu, .045)));
    if (i % 4 === 0) choeur(ch[0] + 12, d, tv * 12, .05, busMenu, i % 8 ? "o" : "a");
    let pos = 0; VALSE.melodie[i].forEach(([m, l]) => { if (m) celesta(m + 12, d + pos * tv, l, busMenu); pos += l; });
    if (i === 7 || i === 15) fantome(d + tv, busMenu);
    tMenu += tv * 3; nMenu++;
  }
  const tc = .47;    // traque : 128 battements par minute
  while (tChasse < audio.currentTime + 1.5) {
    const i = nChasse % 8, d = tChasse - audio.currentTime, ch = MARCHE.chords[i];
    for (let k = 0; k < 8; k++) pizz((k % 2 ? ch[0] : ch[0] - 12) + (k % 4 === 3 ? 7 : 0), d + k * tc / 2, busChasse, k % 2 ? .1 : .16);   // ostinato en croches
    timbale(d, busChasse, .3); timbale(d + tc * 2, busChasse, .15);
    balai(d + tc, busChasse); balai(d + tc * 3, busChasse);
    if (i % 2 === 0) choeur(ch[2] + 12, d, tc * 8, .04, busChasse, "o");
    if (i >= 4) MARCHE.motif.forEach((m, k) => { if (m) celesta(m, d + k * tc / 2, .5, busChasse, .06); });
    else ch.forEach((m, k) => celesta(m + 24, d + k * tc, .4, busChasse, .035));
    tChasse += tc * 4; nChasse++;
  }
  setTimeout(programmer, 400);
}
function fantome(d, sortie) {   // glissando de « theremin »
  const t = audio.currentTime + d, o = audio.createOscillator(), g = audio.createGain(), vib = audio.createOscillator(), vg = audio.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(hz(74), t); o.frequency.linearRampToValueAtTime(hz(81), t + .8); o.frequency.linearRampToValueAtTime(hz(69), t + 2.4);
  vib.frequency.value = 5.5; vg.gain.value = 8; vib.connect(vg).connect(o.frequency);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + .5); g.gain.linearRampToValueAtTime(0, t + 2.5);
  o.connect(g).connect(sortie); o.start(t); vib.start(t); o.stop(t + 2.6); vib.stop(t + 2.6);
}
function changerAmbiance(type) {   // "menu", "chasse" ou "silence" (pendant les vidéos)
  ambiance = type; if (!busMenu) return; const t = audio.currentTime;
  busMenu.gain.cancelScheduledValues(t); busChasse.gain.cancelScheduledValues(t);
  busMenu.gain.setTargetAtTime(type === "menu" ? .22 : 0, t, .4); busChasse.gain.setTargetAtTime(type === "chasse" ? .16 : 0, t, .6);
}
function majBoutonSon() { $("son").classList.toggle("coupe", !sonActif); $("son").textContent = sonActif ? "♪" : "✕"; }
$("son").addEventListener("click", () => { sonActif = !sonActif; ecrire(CLES.son, sonActif); initAudio(); if (maitre) maitre.gain.value = sonActif ? 1 : 0; majBoutonSon(); });
majBoutonSon();
["pointerdown", "touchend"].forEach(ev => document.addEventListener(ev, () => initAudio(), { once: true, capture: true }));
document.addEventListener("click", e => { const b = e.target.closest("button, a"); if (!b) return; initAudio();
  if (!b.closest("#son, #sceau, #suiteIntro")) sfx(b.matches("#commencer, #cestParti, #reprendre, [data-mode], .principal, .mini, .orange") ? "valider" : "clic"); }, true);
document.addEventListener("pointerdown", e => { const b = e.target.closest("button, a, .choix-carte"); if (!b) return;
  b.classList.remove("appuye"); void b.offsetWidth; b.classList.add("appuye"); setTimeout(() => b.classList.remove("appuye"), 450); if (navigator.vibrate) navigator.vibrate(12); }, true);

/* ===================== Accueil, parents ===================== */
const LIBELLES = { qr: "Mode : QR codes cachés", interieur: "Mode : géolocalisation en intérieur (5 m)", exterieur: "Mode : carte du parc" };
function majModes() {
  majAccueil(); $("modeParents").textContent = LIBELLES[mode()];
  document.querySelectorAll(".carte-mode").forEach(c => { c.classList.toggle("actif", c.dataset.mode === mode()); c.classList.toggle("eteint", c.dataset.mode !== mode()); });
}
$("ouvrirParents").addEventListener("click", () => { majModes(); montrer("parents"); });
$("fermerParents").addEventListener("click", () => { majModes(); montrer("accueil"); });
document.querySelectorAll(".carte-mode").forEach(b => b.addEventListener("click", e => {
  if (e.target.closest("a")) return;   // le lien de la planche reste un lien
  ecrire(CLES.mode, b.dataset.mode); majModes(); sfx("valider");
  if (b.dataset.mode === "exterieur") return setTimeout(ouvrirCarteParents, 400);
  setTimeout(() => { majAccueil(); montrer("accueil"); }, 900);
}));
$("raz").addEventListener("click", () => {
  const b = $("raz");
  if (!b.dataset.ok) { b.dataset.ok = "1"; b.textContent = "Touchez encore pour tout effacer"; setTimeout(() => { delete b.dataset.ok; b.textContent = "Remettre toute l'aventure à zéro"; }, 4000); return; }
  [CLES.pris, CLES.relache, CLES.membres, CLES.intro, CLES.partie].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  delete b.dataset.ok; b.textContent = "Aventure remise à zéro";
});
majModes();
$("entree").addEventListener("click", () => { initAudio(); changerAmbiance("menu"); sfx("valider"); majAccueil(); montrer("accueil"); });

/* ===================== Introduction ===================== */
let pageIntro = 0, ecrit = null;
function taire() { try { speechSynthesis.cancel(); } catch (e) {} }
function parler(texte) {
  return;   // voix de synthèse retirée à la demande
  if (!sonActif || !window.speechSynthesis) return;
  try {
    taire(); const u = new SpeechSynthesisUtterance(texte.replace(/\n/g, " "));
    u.lang = "fr-FR"; u.pitch = 1.35; u.rate = .95; u.volume = 1;
    const v = speechSynthesis.getVoices().find(x => /^fr/i.test(x.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function afficherIntro(i) {
  const txt = INTRO[i], p = $("texteIntro"); clearInterval(ecrit); p.textContent = ""; let n = 0;
  parler(txt);
  ecrit = setInterval(() => { n += 2; p.textContent = txt.slice(0, n); if (n >= txt.length) clearInterval(ecrit); }, 28);
  $("suiteIntro").textContent = i === INTRO.length - 1 ? "À l'aventure !" : "Suite";
  sfx("page");
}
function lancerAventure() { initAudio(); ouvrirOeil(); }
$("commencer").addEventListener("click", () => { initAudio(); pageIntro = 0; montrer("intro"); afficherIntro(0); });
function apresIntro() { clearInterval(ecrit); taire(); ecrire(CLES.intro, true); preparerChoix(); montrer("partie"); }

/* ===================== Nouvelle partie : combien de cryptides ? ===================== */
let nombre = Math.max(2, Math.min(12, lire("cryptidsParc-nombre", 6))), tirage = [];
const melanger = l => { l = l.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
function tirer() { tirage = melanger(ids).slice(0, nombre).sort((a, b) => a - b); }
let choixLibre = false, coches = new Set(lire("cryptidsParc-coches", ids));
function dessinerChoix() {
  $("grilleChoix").innerHTML = ids.map(k => '<button type="button" class="choix-carte' + (coches.has(k) ? " coche" : "") + '" data-k="' + k + '"><img alt="" src="' + TRAQUES[k].ombre + '"><span>' + TRAQUES[k].nom.split(",")[0] + '</span></button>').join("");
}
function basculer(libre) {
  if (mode() === "exterieur") return majChoix();
  choixLibre = libre; $("blocHasard").hidden = libre; $("blocChoix").hidden = !libre;
  $("ongletHasard").classList.toggle("cyan", !libre); $("ongletChoix").classList.toggle("cyan", libre);
  if (libre) dessinerChoix(); else tirer();
  majChoix();
}
$("ongletHasard").addEventListener("click", () => basculer(false));
$("ongletChoix").addEventListener("click", () => basculer(true));
$("grilleChoix").addEventListener("click", e => { const b = e.target.closest(".choix-carte"); if (!b) return;
  const k = b.dataset.k; coches.has(k) ? coches.delete(k) : coches.add(k); b.classList.toggle("coche", coches.has(k)); majChoix(); });
$("toutCocher").addEventListener("click", () => { coches = new Set(ids); dessinerChoix(); majChoix(); });
$("toutDecocher").addEventListener("click", () => { coches = new Set(); dessinerChoix(); majChoix(); });
function majChoix() {
  const parc = mode() === "exterieur";
  document.querySelector("#partie .onglets").hidden = parc; $("blocParc").hidden = !parc;
  if (parc) {
    $("blocHasard").hidden = $("blocChoix").hidden = true; $("aCacher").hidden = true;
    tirage = places(); nombre = tirage.length;
    $("listeParc").innerHTML = tirage.map(k => "<li>" + TRAQUES[k].nom.split(",")[0] + "</li>").join("");
    $("duree").textContent = tirage.length ? tirage.length + " cryptide" + (tirage.length > 1 ? "s" : "") + " caché" + (tirage.length > 1 ? "s" : "") + " dans le parc"
      : "Aucune créature n'est cachée : un parent doit d'abord les placer sur la carte.";
    $("cestParti").disabled = !tirage.length; return;
  }
  if (choixLibre) { tirage = ids.filter(k => coches.has(k)); nombre = tirage.length; ecrire("cryptidsParc-coches", tirage); }
  $("cestParti").disabled = tirage.length < 2;
  $("nombre").textContent = nombre; $("moins").disabled = nombre <= 2; $("plus").disabled = nombre >= 12;
  const min = nombre * 4, max = nombre * 7;
  $("duree").textContent = nombre < 2 ? "Choisis au moins 2 cryptides" : nombre + " cryptides · environ " + min + " à " + max + " minutes";
  document.querySelectorAll("[data-n]").forEach(b => b.classList.toggle("cyan", +b.dataset.n === nombre));
  if (mode() === "qr") {
    $("aCacher").hidden = false;
    $("listeQr").innerHTML = tirage.map(k => "<li><b>n° " + k + "</b> " + TRAQUES[k].nom.split(",")[0] + "</li>").join("");
  } else $("aCacher").hidden = true;
}
function preparerChoix() {
  const p = enCours();
  $("reprise").hidden = !p;
  if (p) $("repriseTexte").textContent = "Partie en cours : " + p.pris.length + " / " + p.liste.length + " cryptides sauvés.";
  basculer(choixLibre);
}
$("moins").addEventListener("click", () => { nombre = Math.max(2, nombre - 1); tirer(); majChoix(); });
$("plus").addEventListener("click", () => { nombre = Math.min(12, nombre + 1); tirer(); majChoix(); });
document.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { nombre = +b.dataset.n; tirer(); majChoix(); }));
$("retirer").addEventListener("click", () => { tirer(); majChoix(); });
$("fermerPartie").addEventListener("click", () => { majAccueil(); montrer("accueil"); });
$("reprendre").addEventListener("click", () => lancerAventure(false));
$("cestParti").addEventListener("click", () => {
  ecrire("cryptidsParc-nombre", nombre);
  ecrire(CLES.partie, { liste: tirage, pris: [], membres: {}, debut: Date.now() });
  history.replaceState(null, "", location.pathname); prochaineTraque.lu = true;
  lancerAventure(true);
});
function majAccueil() {
  const p = enCours();
  $("modeActuel").textContent = LIBELLES[mode()] + (p ? " · partie en cours " + p.pris.length + " / " + p.liste.length : "");
}
$("passerIntro").addEventListener("click", apresIntro);
$("suiteIntro").addEventListener("click", () => {
  const p = $("texteIntro");
  if (p.textContent.length < INTRO[pageIntro].length) { clearInterval(ecrit); p.textContent = INTRO[pageIntro]; return; }   // termine la phrase
  if (pageIntro < INTRO.length - 1) { afficherIntro(++pageIntro); return; }
  apresIntro();
});

/* ===================== Grimoire ===================== */
function carte(t, k) {
  const p = pris().includes(k), r = relaches().includes(t.cle);
  let actions = "";
  if (p) actions = r ? '<button class="mini cyan" data-fig="' + t.cle + '">Figurine</button> <button class="mini" data-rel="' + k + '">Revoir</button>'
                     : '<button class="mini" data-rel="' + k + '">Relâcher</button>';
  return '<div class="carte' + (p ? " prise" : "") + (r ? " libre" : "") + '">' +
    '<img alt="" loading="lazy" src="' + (p ? t.image : t.ombre) + '"' + (p ? "" : ' class="ombre"') + '>' +
    '<div class="nom">' + (p ? t.nom : "???") + '</div>' +
    '<div class="astuce">' + (p ? (r ? "Relâché dans son monde" : "Sauvé !") : "<b>Indice :</b> " + t.indice) + '</div>' + actions + '</div>';
}
function dessinerGrimoire() {
  const n = pris().length, tousLibres = ids.every(k => relaches().includes(TRAQUES[k].cle));
  $("compteGrimoire").textContent = n + " / " + ids.length + " cryptides sauvés";
  $("grille").innerHTML =
    '<div class="carte gardien prise"><img alt="" src="' + GARDIEN.image + '"><div class="nom">' + GARDIEN.nom + '</div><div class="astuce">' + GARDIEN.texte + '</div>' +
    (tousLibres ? '<button class="mini cyan" data-fig="catsith">Figurine de Sporran</button>' + (lire(CLES.merci, false) ? ' <button class="mini" data-merci="1">Revoir son message</button>' : '') : '<div class="astuce"><b>Relâche tous les cryptides pour gagner sa figurine.</b></div>') + '</div>' +
    ids.map(k => carte(TRAQUES[k], k)).join("");
}
let retourGrimoire = "accueil";
document.querySelectorAll(".ouvrir-grimoire").forEach(b => b.addEventListener("click", () => {
  retourGrimoire = !$("scene").hidden ? "scene" : (!$("victoire").hidden ? "victoire" : "accueil");
  dessinerGrimoire(); $("grimoire").hidden = false; sfx("page");
}));
$("fermerGrimoire").addEventListener("click", () => { $("grimoire").hidden = true; if (retourGrimoire === "accueil") montrer("accueil"); });
$("grille").addEventListener("click", e => {
  const r = e.target.closest("[data-rel]"), f = e.target.closest("[data-fig]");
  if (r) relacher(r.dataset.rel); if (f) ouvrirFigurine(f.dataset.fig);
});

/* ===================== Relâcher ===================== */
let figurineAMontrer = null;
function relacher(k) {
  changerAmbiance("silence");
  const t = TRAQUES[k], v = $("videoRelache"), img = $("envol");
  $("relache").hidden = false; $("voirFigurine").hidden = true; figurineAMontrer = t.cle;
  $("titreRelache").textContent = t.nom.split(",")[0] + (t.membres.length > 1 ? " retournent dans leur monde…" : " retourne dans son monde…");
  sfx("relache");
  let fini = false, envole = false;
  const fin = () => {
    if (fini) return; fini = true;
    const nouveau = !relaches().includes(t.cle); ajouter(CLES.relache, t.cle);
    $("titreRelache").textContent = nouveau ? "Figurine débloquée !" : t.nom.split(",")[0] + (t.membres.length > 1 ? " sont libres !" : " est libre !");
    $("voirFigurine").hidden = false; if (nouveau) sfx("figurine"); dessinerGrimoire();
    if (ids.every(k => relaches().includes(TRAQUES[k].cle)) && !lire(CLES.merci, false)) merciEnAttente = true;
  };
  const envol = () => { if (envole) return; envole = true; v.hidden = true; img.hidden = false; img.src = t.image; img.classList.remove("part"); void img.offsetWidth; img.classList.add("part"); setTimeout(fin, 2600); };
  img.hidden = true; v.hidden = true;
  v.src = t.relache; v.hidden = false; v.muted = !sonActif; v.currentTime = 0;
  v.onended = fin; v.onerror = envol;
  v.play().catch(() => { v.muted = true; v.play().catch(envol); });
}
// tous les cryptides sont libres : Sporran remercie le joueur dans son monde
let merciEnAttente = false;
function merci() {
  changerAmbiance("silence");
  const v = $("videoRelache"); ecrire(CLES.merci, true);
  $("relache").hidden = false; $("envol").hidden = true; $("voirFigurine").hidden = true; figurineAMontrer = "catsith";
  $("titreRelache").textContent = "Sporran te remercie !"; sfx("victoire");
  let fini = false;
  const fin = () => { if (fini) return; fini = true; $("titreRelache").textContent = "Merci d'avoir sauvé tous les cryptides ! Figurine de Sporran débloquée !"; $("voirFigurine").hidden = false; sfx("figurine"); dessinerGrimoire(); };
  v.src = "merci-catsith.mp4"; v.hidden = false; v.muted = !sonActif; v.currentTime = 0; v.onended = fin; v.onerror = fin;
  v.play().catch(() => { v.muted = true; v.play().catch(fin); });
}
function fermerVideo(versFigurine) {
  if (merciEnAttente && !versFigurine) { merciEnAttente = false; const v = $("videoRelache"); v.pause(); return setTimeout(merci, 300); }
  changerAmbiance("menu"); const v = $("videoRelache"); v.pause(); v.removeAttribute("src"); v.load(); $("relache").hidden = true; }
$("fermerRelache").addEventListener("click", () => fermerVideo(false));
$("grille").addEventListener("click", e => { if (e.target.closest("[data-merci]")) merci(); });
document.querySelectorAll(".croix").forEach(b => b.addEventListener("click", () => {
  const cible = b.dataset.ferme;
  if (cible === "relache") return fermerVideo();
  if (cible === "figurine") return $("fermerFigurine").click();
  if (cible === "grimoire") return $("fermerGrimoire").click();
  if (cible === "parents") return $("fermerParents").click();
  if (cible === "partie") return $("fermerPartie").click();
  if (cible === "carteParents") return $("finiCarte").click();
  if (cible === "intro") { clearInterval(ecrit); taire(); return montrer("accueil"); }
  if (cible === "victoire") { majAccueil(); return montrer("accueil"); }
}));
$("voirFigurine").addEventListener("click", () => { fermerVideo(true); ouvrirFigurine(figurineAMontrer); });

/* ===================== Figurine 360° ===================== */
let fig = null;
function ouvrirFigurine(cle) {
  const nom = cle === "catsith" ? GARDIEN.nom : Object.values(TRAQUES).find(t => t.cle === cle).nom;
  $("figurine").hidden = false; $("figNom").textContent = nom; $("figChargement").hidden = false; sfx("figurine");
  if (!fig) {
    const toile = $("figCanvas"), rendu = new THREE.WebGLRenderer({ canvas: toile, alpha: true, antialias: true });
    rendu.setPixelRatio(Math.min(devicePixelRatio, 2)); rendu.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .01, 50);
    scene.add(new THREE.HemisphereLight(0xe8fbff, 0x20343a, 2.2));
    const cle1 = new THREE.DirectionalLight(0xffffff, 2.4); cle1.position.set(2, 3, 3); scene.add(cle1);
    const contre = new THREE.DirectionalLight(0x6fe8ff, 2.2); contre.position.set(-3, 2, -3); scene.add(contre);
    const socle = new THREE.Mesh(new THREE.CylinderGeometry(.5, .56, .07, 48), new THREE.MeshStandardMaterial({ color: 0x173a42, roughness: .5, metalness: .3 }));
    socle.position.y = -.04; scene.add(socle);
    const plateau = new THREE.Group(); scene.add(plateau);
    fig = { rendu, scene, camera, plateau, angle: 0, vitesse: .4, glisse: null, inclinaison: .15, actif: false };
    const taille = () => { const w = toile.clientWidth, h = toile.clientHeight; rendu.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    addEventListener("resize", taille); fig.taille = taille;
    toile.addEventListener("pointerdown", e => { fig.glisse = { x: e.clientX, y: e.clientY, a: fig.angle, i: fig.inclinaison, t: performance.now() }; toile.setPointerCapture(e.pointerId); fig.vitesse = 0; });
    toile.addEventListener("pointermove", e => { if (!fig.glisse) return; const dx = e.clientX - fig.glisse.x, dy = e.clientY - fig.glisse.y;
      const prec = fig.angle; fig.angle = fig.glisse.a + dx * .012; fig.inclinaison = Math.max(-.3, Math.min(.6, fig.glisse.i + dy * .004)); fig.elan = fig.angle - prec; });
    toile.addEventListener("pointerup", () => { fig.glisse = null; fig.vitesse = Math.max(-6, Math.min(6, (fig.elan || 0) * 60)); });
    let t0 = performance.now();
    const boucleFig = () => {
      if (!fig.actif) return;
      const t = performance.now(), dt = (t - t0) / 1000; t0 = t;
      if (!fig.glisse) { fig.vitesse += (.4 - fig.vitesse) * Math.min(1, dt * 1.5); fig.angle += fig.vitesse * dt; }
      fig.plateau.rotation.y = fig.angle;
      const d = 3.3 / Math.min(1, fig.camera.aspect * 1.5); fig.camera.position.set(0, .5 + Math.sin(fig.inclinaison) * d, Math.cos(fig.inclinaison) * d); fig.camera.lookAt(0, .5, 0);
      fig.rendu.render(fig.scene, fig.camera); requestAnimationFrame(boucleFig);
    };
    fig.boucle = boucleFig;
  }
  fig.taille(); fig.plateau.clear(); fig.angle = 0; fig.vitesse = .4;
  if (!fig.actif) { fig.actif = true; requestAnimationFrame(fig.boucle); }
  const fichiers = FIGURINES[cle]; let restants = fichiers.length;
  fichiers.forEach((f, i) => new GLTFLoader().load(f, g => {
    const o = g.scene, b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const ech = 1.1 / Math.max(s.y, s.x * 1.1, s.z * 1.1);
    o.position.set(-c.x, -b.min.y, -c.z); const env = new THREE.Group(); env.add(o); env.scale.setScalar(ech * (fichiers.length > 1 ? .7 : 1));
    if (fichiers.length > 1) env.position.x = (i ? 1 : -1) * .3;
    fig.plateau.add(env);
    if (--restants === 0) $("figChargement").hidden = true;
  }, undefined, () => { $("figChargement").textContent = "La figurine n'a pas pu se charger."; }));
}
$("fermerFigurine").addEventListener("click", () => { $("figurine").hidden = true; fig.actif = false; fig.plateau.clear(); dessinerGrimoire();
  if (merciEnAttente) { merciEnAttente = false; setTimeout(merci, 300); } });

/* ===================== Sigil (préchargé) ===================== */
let sigilBlob = null;
fetch("sigil.webp").then(r => r.blob()).then(b => sigilBlob = b).catch(() => {});

/* ===================== Moteur de l'œil magique ===================== */
let moteur = null, traque = null, membreIdx = 0, gyroOK = false, gyro = false, positionGPS = null, cibleGPS = null, cap = null;
const toile = $("vue");

function initMoteur() {
  if (moteur) return;
  const rendu = new THREE.WebGLRenderer({ canvas: toile, alpha: true, antialias: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, .05, 100);
  const etincelles = [];
  const tex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.4, "rgba(190,250,255,.6)"); r.addColorStop(1, "rgba(190,250,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.visible = false; scene.add(s); etincelles.push(s); }
  moteur = { rendu, scene, camera, etincelles, creature: null, horloge: new THREE.Clock() };
  const taille = () => { rendu.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener("resize", taille); taille(); moteur.taille = taille;
  requestAnimationFrame(boucle);
}

// une créature = un plan qui joue sa vidéo (couleur en haut, transparence en bas)
function creerCreature(m) {
  const v = document.createElement("video");
  v.src = m.ar; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.crossOrigin = "anonymous"; v.preload = "auto";
  // iPhone : la vidéo doit être dans la page pour être décodée
  v.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none"; document.body.appendChild(v);
  v.play().catch(() => {});
  const couleur = new THREE.VideoTexture(v), alpha = new THREE.VideoTexture(v);
  couleur.colorSpace = THREE.SRGBColorSpace;
  couleur.repeat.set(1, .5); couleur.offset.set(0, .5); alpha.repeat.set(1, .5); alpha.offset.set(0, 0);
  const mat = new THREE.MeshBasicMaterial({ map: couleur, alphaMap: alpha, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0 });
  const plan = new THREE.Mesh(new THREE.PlaneGeometry(m.taille * m.ratio, m.taille), mat);
  plan.position.y = m.taille * (.5 - (m.pied || 0));   // pieds posés au sol
  const pivot = new THREE.Group(), corps = new THREE.Group(); corps.add(plan); pivot.add(corps); moteur.scene.add(pivot);
  return { m, v, plan, mat, pivot, corps, angle: null, trouve: false, tReveal: 0, tApparition: performance.now(), pris: false, tPris: 0, pret: false,
           detruire() { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); moteur.scene.remove(pivot); couleur.dispose(); alpha.dispose(); mat.dispose(); plan.geometry.dispose(); } };
}

const quatEcran = new THREE.Quaternion(), qRedresse = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5)), eulerTel = new THREE.Euler(), axeZ = new THREE.Vector3(0, 0, 1);
function orientation(e) {
  if (e.alpha == null || e.beta == null || !moteur) return;
  gyro = true;
  if (typeof e.webkitCompassHeading === "number") cap = e.webkitCompassHeading; else if (e.absolute && e.alpha != null) cap = 360 - e.alpha;
  const ecran = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  eulerTel.set(e.beta * DEG, e.alpha * DEG, -e.gamma * DEG, "YXZ");
  moteur.camera.quaternion.setFromEuler(eulerTel).multiply(qRedresse).multiply(quatEcran.setFromAxisAngle(axeZ, -ecran * DEG));
}
const lacetCamera = () => { const f = new THREE.Vector3(0, 0, -1).applyQuaternion(moteur.camera.quaternion); return Math.atan2(-f.x, -f.z); };

// place la créature hors du champ : il faut se retourner pour la trouver
function placer(c, angleImpose) {
  c.distance = 3.2;   // même distance pour toutes : elles paraissent toutes de la même taille
  // capteurs autorisés mais première mesure pas encore arrivée : on attend, sinon la créature se retrouverait collée devant l'objectif
  if (angleImpose == null && !gyro && gyroOK && !c.attente) { c.angle = null; c.attente = performance.now(); return; }
  c.angle = angleImpose != null ? angleImpose : lacetCamera() + (Math.random() < .5 ? -1 : 1) * (100 + Math.random() * 70) * DEG;
}
const centre = new THREE.Vector3(), dansCam = new THREE.Vector3(), proj = new THREE.Vector3();
function situation(c) {
  centre.copy(c.pivot.position); centre.y += c.m.taille * (.5 - (c.m.pied || 0));
  dansCam.copy(centre).applyMatrix4(moteur.camera.matrixWorldInverse); proj.copy(centre).project(moteur.camera);
  return { devant: dansCam.z < 0, x: proj.x, y: proj.y, gauche: dansCam.x < 0 };
}

let tDebutRecherche = 0, dernierPing = 0, lacetDoigt = 0, doigtX = null;
const axeY = new THREE.Vector3(0, 1, 0);
function aideDoigt() { $("consigne").textContent = "Fais glisser ton doigt sur l'écran pour regarder autour de toi, et écoute le tintement !"; }
// la vidéo peut être bloquée (mode économie d'énergie de l'iPhone) : chaque toucher la relance
addEventListener("pointerdown", () => { const c = moteur && moteur.creature; if (c && c.v.paused) c.v.play().catch(() => {}); }, true);
toile.addEventListener("pointerdown", e => { doigtX = e.clientX; });
addEventListener("pointermove", e => { if (doigtX == null || gyro) return; lacetDoigt += (e.clientX - doigtX) * .006; doigtX = e.clientX; });
addEventListener("pointerup", () => { doigtX = null; }); addEventListener("pointercancel", () => { doigtX = null; });
function boucle() {
  requestAnimationFrame(boucle);
  if ($("scene").hidden) return;
  const dt = Math.min(moteur.horloge.getDelta(), .1), t = performance.now(), c = moteur.creature;
  if (!gyro) moteur.camera.quaternion.setFromAxisAngle(axeY, lacetDoigt);   // sans capteur : on tourne la vue avec le doigt
  if (c && c.angle == null && c.attente && (gyro || t - c.attente > 2500)) {
    if (!gyro) { gyroOK = false; aideDoigt(); }
    placer(c);
  }
  if (c && c.angle != null) {
    const sol = -YEUX + (c.m.altitude || 0), a = c.angle + Math.sin(t / 4000) * .05;
    c.pivot.position.set(-Math.sin(a) * c.distance, sol, -Math.cos(a) * c.distance);
    c.pivot.lookAt(moteur.camera.position.x, c.pivot.position.y, moteur.camera.position.z);
    const s = situation(c), visible = s.devant && Math.abs(s.x) < .75 && Math.abs(s.y) < 1.1;
    // révélation : la créature n'apparaît que lorsqu'on la regarde
    if (!c.trouve && visible && t - c.tApparition > 900 && c.v.readyState >= 2) {
      c.trouve = true; c.tReveal = t; c.tCri = t; sfx("revele"); setTimeout(() => jouerTampon("cri-" + c.m.id, 1, s.x), 350);
      $("consigne").textContent = "Le voilà ! Touche-le ou utilise le sceau magique.";
      $("nomMonstre").textContent = c.m.nom || traque.nom.split(",")[0]; $("gauche").hidden = $("droite").hidden = true;
      jaillir(c, 26);
    }
    if (!c.pris) c.mat.opacity = c.trouve ? Math.min(1, (t - c.tReveal) / 700) : 0;
    if (c.trouve && !c.pris && visible && t - c.tCri > 7000) { c.tCri = t; jouerTampon("cri-" + c.m.id, .8, s.x); }
    // indices : petit tintement de plus en plus fréquent quand on s'approche, flèches après un moment
    if (!c.trouve) {
      const ecart = Math.abs(Math.atan2(Math.sin(c.angle - lacetCamera()), Math.cos(c.angle - lacetCamera())));
      const periode = 600 + ecart / Math.PI * 2400;
      if (t - dernierPing > periode) { dernierPing = t; sfx("proche"); }
      const aide = !visible;   // flèches bleues dès le début
      $("gauche").hidden = !aide || !s.gauche; $("droite").hidden = !aide || s.gauche;
    }
    $("sceau").disabled = !c.trouve || c.pris;
    $("sceau").classList.toggle("pret", c.trouve && !c.pris && visible && Math.abs(s.x) < .45);
    if (c.pris) {
      const k = Math.min(1, (t - c.tPris) / 1300);
      c.corps.scale.setScalar(Math.max(.01, 1 - k)); c.corps.rotation.y += dt * 12 * k; c.corps.position.y = c.m.taille * .5 * k; c.mat.opacity = 1 - k;
    }
  }
  // étincelles
  moteur.etincelles.forEach(s => { if (!s.visible) return; s.vie -= dt; if (s.vie <= 0) { s.visible = false; return; }
    s.position.addScaledVector(s.vit, dt); s.vit.y -= dt * .3; s.material.opacity = Math.min(1, s.vie * 2); });
  moteur.rendu.render(moteur.scene, moteur.camera);
}
function jaillir(c, n) {
  for (let i = 0; i < n; i++) { const s = moteur.etincelles.find(x => !x.visible); if (!s) break;
    s.visible = true; s.vie = .8 + Math.random() * .8; s.scale.setScalar(.05 + Math.random() * .08);
    s.position.copy(c.pivot.position).add(new THREE.Vector3((Math.random() - .5) * c.m.taille * .8, Math.random() * c.m.taille, (Math.random() - .5) * .4));
    s.vit = new THREE.Vector3((Math.random() - .5) * .8, Math.random() * .9, (Math.random() - .5) * .8); }
}

/* ---------- Capture ---------- */
const rayon = new THREE.Raycaster(), doigt = new THREE.Vector2();
toile.addEventListener("pointerdown", e => {
  const c = moteur && moteur.creature; if (!c || !c.trouve || c.pris) return;
  doigt.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  rayon.setFromCamera(doigt, moteur.camera);
  if (rayon.intersectObject(c.plan, false).length) capturer();
});
$("sceau").addEventListener("click", () => {
  const c = moteur && moteur.creature; if (!c || !c.trouve || c.pris) return;
  const s = situation(c);
  if (s.devant && Math.abs(s.x) < .6 && Math.abs(s.y) < 1) { sfx("sceau"); capturer(); }
  else { sfx("rate"); $("consigne").textContent = "Vise la créature avec l'œil pour utiliser le sceau !"; }
});
function capturer() {
  const c = moteur.creature; c.pris = true; c.tPris = performance.now();
  if (navigator.vibrate) navigator.vibrate(120);
  sfx("capture");
  centre.copy(c.pivot.position); centre.y += c.m.taille / 2; centre.project(moteur.camera);
  const s = $("sigil"); s.style.left = ((centre.x + 1) / 2 * innerWidth) + "px"; s.style.top = ((1 - centre.y) / 2 * innerHeight) + "px";
  if (sigilBlob) { if (s.src) URL.revokeObjectURL(s.src); s.src = URL.createObjectURL(sigilBlob); s.hidden = false; }
  setTimeout(() => $("eclair").classList.add("flash"), 2100);
  setTimeout(() => { s.hidden = true; $("eclair").classList.remove("flash"); apresCapture(); }, 2900);
}
function apresCapture() {
  moteur.creature.detruire(); moteur.creature = null;
  majPartie(p => { p.membres[traque.id] = membreIdx + 1; });
  if (membreIdx + 1 < traque.membres.length) {          // les lutins : au tour du second
    const fait = traque.membres[membreIdx].nom, suivant = traque.membres[membreIdx + 1].nom;
    membreIdx++; bandeau(fait + " est sauvé ! Mais " + suivant + " se cache encore… Cherche-le !", 3200);
    sfx("victoire"); setTimeout(lancerMembre, 1500); return;
  }
  ajouter(CLES.pris, traque.id); majPartie(p => { if (!p.pris.includes(traque.id)) p.pris.push(traque.id); }); sfx("victoire");
  $("portrait").src = traque.image; $("ficheNom").textContent = traque.nom; $("ficheTexte").textContent = traque.texte;
  const p = partie() || { liste: ids, pris: pris() }, n = p.pris.length, total = p.liste.length;
  $("compteur").textContent = n >= total ? "" : n + " / " + total + " cryptides sauvés dans cette aventure.";
  $("final").hidden = n < total; $("continuer").hidden = n >= total; $("rejouer").hidden = n < total;
  $("scene").hidden = true; montrer("victoire");
}
function bandeau(texte, duree) { $("bandeau").textContent = texte; $("bandeau").hidden = false; setTimeout(() => $("bandeau").hidden = true, duree); }

/* ---------- Ouverture de l'œil (caméra, mouvements) ---------- */
function erreur(msg) { bandeau(msg, 6000); }
async function ouvrirOeil() {
  initAudio(); sfx("oeil"); taire(); changerAmbiance("chasse");
  let attente = Promise.resolve("granted");
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function")
    attente = DeviceOrientationEvent.requestPermission().catch(() => "denied");
  montrer(null); $("scene").hidden = false; initMoteur();
  if (!$("camera").srcObject) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) erreur("La caméra n'est pas accessible : ouvre l'application dans Safari, à une adresse en https.");
    else try {
      const flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      $("camera").srcObject = flux; await $("camera").play().catch(() => {});
    } catch (e) { erreur("Caméra refusée. Autorise la caméra pour ce site dans les réglages de Safari, puis recharge la page."); }
  }
  gyroOK = (await attente) === "granted" && "DeviceOrientationEvent" in window;
  if (!gyroOK) bandeau("Capteurs de mouvement non autorisés : fais glisser ton doigt pour regarder autour de toi. (Pour les réactiver : ferme Safari complètement et rouvre l'application.)", 7000);
  if (gyroOK && !orientation.branche) { addEventListener("deviceorientation", orientation); orientation.branche = true; }
  moteur.taille();
  prochaineTraque();
}
function prochaineTraque() {
  $("viseur").hidden = true; $("radar").hidden = true; $("gauche").hidden = $("droite").hidden = true;
  if (mode() === "exterieur") return carteJeu();
  const demande = new URLSearchParams(location.search).get("m");
  const p = partie() || { liste: ids, pris: [] };
  if (demande && p.liste.includes(demande) && !p.pris.includes(demande) && !prochaineTraque.lu) { prochaineTraque.lu = true; return demarrerTraque(demande); }
  prochaineTraque.lu = true;
  const restantes = p.liste.filter(k => !p.pris.includes(k));
  if (!restantes.length) { $("nomMonstre").textContent = "Œil magique"; $("consigne").textContent = "Aventure terminée ! Ouvre ton grimoire ou lance une nouvelle aventure."; return; }
  if (mode() === "qr") return scanner();
  demarrerTraque(restantes[Math.floor(Math.random() * restantes.length)]);
}
function demarrerTraque(k, extra) {
  traque = Object.assign({ id: k }, TRAQUES[k], extra || {});
  membreIdx = Math.min(((partie() || {}).membres || {})[k] || 0, traque.membres.length - 1);
  history.replaceState(null, "", "?m=" + k);
  $("nomMonstre").textContent = "???";
  lancerMembre();
}
function lancerMembre() {
  const m = traque.membres[membreIdx];
  if (audio && !tampons["cri-" + m.id]) charger("cri-" + m.id, "cri-" + m.id + ".m4a");
  if (mode() === "exterieur" && !traque.gpsFait) return chercherGPS();
  const c = creerCreature(m); moteur.creature = c; placer(c, traque.angleGPS);
  tDebutRecherche = performance.now();
  $("nomMonstre").textContent = traque.membres.length > 1 ? m.nom + " (" + (membreIdx + 1) + "/2)" : "???";
  if (gyro || gyroOK) $("consigne").textContent = "Une créature se cache tout près… Tourne sur toi-même et écoute le tintement !"; else aideDoigt();
}

/* ---------- Mode QR : lecture des codes ---------- */
function scanner() {
  $("viseur").hidden = false; $("nomMonstre").textContent = "Œil magique";
  $("consigne").textContent = "Vise le QR code d'une créature cachée.";
  const video = $("camera"), c = document.createElement("canvas"), g = c.getContext("2d", { willReadFrequently: true });
  const lireQR = () => {
    if ($("scene").hidden || $("viseur").hidden) return;
    if (video.videoWidth && window.jsQR) {
      const l = 480, h = Math.round(l * video.videoHeight / video.videoWidth);
      c.width = l; c.height = h; g.drawImage(video, 0, 0, l, h);
      const code = jsQR(g.getImageData(0, 0, l, h).data, l, h, { inversionAttempts: "dontInvert" });
      if (code && code.data) {
        let k = null; try { k = new URL(code.data, location.href).searchParams.get("m"); } catch (e) {}
        if (k && TRAQUES[k]) {
          if (navigator.vibrate) navigator.vibrate(80);
          const p = partie() || { liste: ids, pris: [] };
          if (!p.liste.includes(k)) $("consigne").textContent = "Cette créature ne fait pas partie de cette aventure. Cherche un autre QR code.";
          else if (p.pris.includes(k)) $("consigne").textContent = TRAQUES[k].nom.split(",")[0] + " est déjà sauvé ! Cherche un autre QR code.";
          else { $("viseur").hidden = true; sfx("oeil"); demarrerTraque(k); return; }
        } else $("consigne").textContent = "Ce QR code n'appartient pas au grimoire.";
      }
    }
    setTimeout(lireQR, 220);
  };
  lireQR();
}

/* ---------- Mode extérieur : points GPS dans un rayon de 10 m ---------- */
const R = 6371000;
function versPoint(o, dist, brg) { const d = dist / R, b = brg * DEG, la1 = o.lat * DEG, lo1 = o.lon * DEG;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
  const lo2 = lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return { lat: la2 / DEG, lon: lo2 / DEG }; }
function distance(a, b) { const dla = (b.lat - a.lat) * DEG, dlo = (b.lon - a.lon) * DEG;
  const h = Math.sin(dla / 2) ** 2 + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dlo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function relevement(a, b) { const y = Math.sin((b.lon - a.lon) * DEG) * Math.cos(b.lat * DEG);
  const x = Math.cos(a.lat * DEG) * Math.sin(b.lat * DEG) - Math.sin(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.cos((b.lon - a.lon) * DEG);
  return (Math.atan2(y, x) / DEG + 360) % 360; }
let origine = null, suiviGPS = null;
function chercherGPS() {
  if (!navigator.geolocation) { traque.gpsFait = true; bandeau("Pas de GPS sur ce téléphone : la créature se cache autour de toi.", 4000); return lancerMembre(); }
  $("radar").hidden = false; $("radarTexte").textContent = "Recherche du GPS…";
  $("consigne").textContent = "Suis la boussole : plus tu es chaud, plus la créature est proche.";
  if (!suiviGPS) suiviGPS = navigator.geolocation.watchPosition(p => {
    positionGPS = { lat: p.coords.latitude, lon: p.coords.longitude, precision: p.coords.accuracy };
    if (!origine) origine = positionGPS;
  }, () => { if (!positionGPS) { traque.gpsFait = true; $("radar").hidden = true; bandeau("Le GPS ne répond pas : la créature se cache autour de toi.", 4000); lancerMembre(); } },
  { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
  cibleGPS = null;
}
function majRadar() {
  if (!positionGPS) return;
  if (!cibleGPS) cibleGPS = versPoint(origine || positionGPS, 4 + Math.random() * 6, Math.random() * 360);
  const d = distance(positionGPS, cibleGPS), brg = relevement(positionGPS, cibleGPS);
  const seuil = Math.max(3.5, Math.min(8, positionGPS.precision * .7));
  const mots = d < seuil ? "Brûlant !" : d < seuil + 3 ? "Chaud" : d < seuil + 6 ? "Tiède" : "Froid";
  $("radarTexte").textContent = mots + " · " + Math.round(d) + " m";
  const rel = cap != null ? brg - cap : brg;
  $("radarFleche").style.transform = "rotate(" + rel + "deg)";
  if (d < seuil && moteur) {
    // la créature est dans cette direction : on la fait apparaître (cachée, à trouver du regard)
    traque.gpsFait = true; $("radar").hidden = true;
    traque.angleGPS = cap != null ? lacetCamera() - (brg - cap) * DEG : null;
    lancerMembre();
  }
}

/* ===================== V2 : carte du parc ===================== */
const CLE_LIEUX = "cryptidsParc-lieux";
const lieux = () => { const l = lire(CLE_LIEUX, {}); for (const k in l) if (!TRAQUES[k]) delete l[k]; return l; };
const places = () => { const l = lieux(); return ids.filter(k => l[k]); };
const nomCourt = k => TRAQUES[k].nom.split(",")[0];
const tuiles = () => L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 20, maxNativeZoom: 19, attribution: "© OpenStreetMap" });
const iconeCreature = (k, classe) => L.divIcon({ className: "", html: '<div class="marqueur ' + (classe || "") + '"><img alt="" src="' + TRAQUES[k].ombre + '"></div>', iconSize: [46, 46], iconAnchor: [23, 23] });
const iconeMoi = () => L.divIcon({ className: "", html: '<div class="moi"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });

// --- parents : poser les créatures ---
let carteP = null, marqueursP = {}, choisie = null, moiP = null, precP = null, suiviP = null, posParent = null;
function ouvrirCarteParents() {
  montrer("carteParents");
  if (!window.L) { $("aideCarte").textContent = "La carte n'a pas pu se charger : vérifiez la connexion internet."; return; }
  const l = lieux(), pts = Object.values(l);
  if (!carteP) {
    carteP = L.map("carteP", { zoomControl: false }).setView(pts[0] || [46.6, 2.4], pts.length ? 18 : 5);
    tuiles().addTo(carteP);
    carteP.on("click", e => poser(choisie, [e.latlng.lat, e.latlng.lng]));
  }
  setTimeout(() => { carteP.invalidateSize(); if (pts.length > 1) carteP.fitBounds(L.latLngBounds(pts).pad(.25), { maxZoom: 19 }); }, 60);
  if (!choisie) choisie = ids.find(k => !l[k]) || ids[0];
  dessinerPuces(); dessinerMarqueursP(); majAideCarte();
  if (navigator.geolocation && suiviP == null) suiviP = navigator.geolocation.watchPosition(p => {
    const ll = [p.coords.latitude, p.coords.longitude], premier = !posParent; posParent = ll;
    if (!moiP) { precP = L.circle(ll, { radius: p.coords.accuracy, color: "#3aa0ff", weight: 1, fillOpacity: .08, interactive: false }).addTo(carteP);
      moiP = L.marker(ll, { icon: iconeMoi(), interactive: false, zIndexOffset: -100 }).addTo(carteP); }
    moiP.setLatLng(ll); precP.setLatLng(ll).setRadius(p.coords.accuracy);
    if (premier && !Object.keys(lieux()).length) carteP.setView(ll, 18);
  }, () => { if (!Object.keys(lieux()).length) majAideCarte("Position introuvable : déplacez la carte jusqu'au parc (deux doigts pour zoomer)."); },
  { enableHighAccuracy: true, maximumAge: 2000 });
}
function dessinerPuces() {
  const l = lieux();
  $("puces").innerHTML = ids.map(k => '<button type="button" class="puce' + (l[k] ? " placee" : "") + (k === choisie ? " choisie" : "") + '" data-k="' + k + '"><img alt="" src="' + TRAQUES[k].ombre + '"><span>' + nomCourt(k) + '</span></button>').join("");
  const b = $("puces").querySelector(".choisie"); if (b) b.scrollIntoView({ inline: "center", block: "nearest" });
  $("retirerLieu").hidden = !l[choisie];
}
function dessinerMarqueursP() {
  Object.values(marqueursP).forEach(m => m.remove()); marqueursP = {};
  const l = lieux();
  for (const k in l) {
    const m = L.marker(l[k], { icon: iconeCreature(k, k === choisie ? "choisi" : ""), draggable: true, zIndexOffset: k === choisie ? 1000 : 0 }).addTo(carteP);
    m.on("click", () => { choisie = k; dessinerPuces(); dessinerMarqueursP(); majAideCarte(); });
    m.on("dragend", () => { const p = m.getLatLng(); poser(k, [p.lat, p.lng], true); });
    marqueursP[k] = m;
  }
}
function majAideCarte(msg) {
  const l = lieux(), n = Object.keys(l).length, nom = nomCourt(choisie);
  let t = msg || (l[choisie] ? nom + " est caché ici. Touchez la carte pour le déplacer, ou choisissez une autre créature."
                             : "Touchez la carte là où " + nom + " doit se cacher.");
  // deux créatures trop proches se déclencheraient ensemble
  const ks = Object.keys(l);
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++)
    if (distance({ lat: l[ks[i]][0], lon: l[ks[i]][1] }, { lat: l[ks[j]][0], lon: l[ks[j]][1] }) < 15) { t = "⚠ " + nomCourt(ks[i]) + " et " + nomCourt(ks[j]) + " sont à moins de 15 m : éloignez-les un peu. " + t; i = ks.length; break; }
  $("aideCarte").textContent = t + " (" + n + " / " + ids.length + " cachées)";
}
function poser(k, ll, glisse) {
  if (!k) return;
  const l = lieux(); l[k] = ll; ecrire(CLE_LIEUX, l); sfx("valider"); if (navigator.vibrate) navigator.vibrate(20);
  if (!glisse) { const suivante = ids.slice(ids.indexOf(k) + 1).concat(ids).find(x => !l[x]); if (suivante) choisie = suivante; }
  dessinerPuces(); dessinerMarqueursP(); majAideCarte();
}
$("puces").addEventListener("click", e => { const b = e.target.closest(".puce"); if (!b) return; choisie = b.dataset.k;
  const l = lieux(); if (l[choisie] && carteP) carteP.panTo(l[choisie]); dessinerPuces(); dessinerMarqueursP(); majAideCarte(); });
$("centrerMoi").addEventListener("click", () => { if (posParent && carteP) carteP.setView(posParent, 19); else majAideCarte("Position pas encore trouvée…"); });
$("retirerLieu").addEventListener("click", () => { const l = lieux(); delete l[choisie]; ecrire(CLE_LIEUX, l); dessinerPuces(); dessinerMarqueursP(); majAideCarte(); });
$("effacerLieux").addEventListener("click", () => {
  const b = $("effacerLieux");
  if (!b.dataset.ok) { b.dataset.ok = "1"; b.textContent = "Toucher encore pour tout effacer"; setTimeout(() => { delete b.dataset.ok; b.textContent = "Tout effacer"; }, 4000); return; }
  delete b.dataset.ok; b.textContent = "Tout effacer"; ecrire(CLE_LIEUX, {}); choisie = ids[0]; dessinerPuces(); dessinerMarqueursP(); majAideCarte();
});
$("finiCarte").addEventListener("click", () => { if (suiviP != null) { navigator.geolocation.clearWatch(suiviP); suiviP = null; } majModes(); montrer("accueil"); });
$("modifierCarte").addEventListener("click", ouvrirCarteParents);

// --- enfants : suivre la carte jusqu'à une brume ---
let carteJ = null, moiJ = null, precJ = null, calquesJ = [], suiviJ = null, toucheCarte = 0;
const restantesParc = () => { const p = partie() || { liste: [], pris: [] }, l = lieux(); return p.liste.filter(k => !p.pris.includes(k) && l[k]); };
function brumeDe(k) {   // la brume est décalée de quelques mètres : il faut chercher autour
  const p = partie(); p.brume = p.brume || {};
  if (!p.brume[k]) { p.brume[k] = [Math.random() * 360, 2 + Math.random() * 5]; ecrire(CLES.partie, p); }
  const [la, lo] = lieux()[k], q = versPoint({ lat: la, lon: lo }, p.brume[k][1], p.brume[k][0]); return [q.lat, q.lon];
}
function carteJeu() {
  traque = null; $("viseur").hidden = true; $("radar").hidden = true; $("gauche").hidden = $("droite").hidden = true;
  const restantes = restantesParc();
  if (!restantes.length) { $("carteJeu").hidden = true; $("nomMonstre").textContent = "Œil magique"; $("consigne").textContent = "Aventure terminée ! Ouvre ton grimoire ou lance une nouvelle aventure."; return; }
  $("carteJeu").hidden = false; $("nomMonstre").textContent = "Carte du parc";
  $("consigne").textContent = "Marche jusqu'à une brume magique : une créature s'y cache !";
  if (!window.L) return erreur("La carte n'a pas pu se charger : vérifie la connexion internet.");
  if (!carteJ) {
    carteJ = L.map("carteJ", { zoomControl: false }).setView(brumeDe(restantes[0]), 18); tuiles().addTo(carteJ);
    carteJ.on("dragstart zoomstart", () => toucheCarte = performance.now());
  }
  calquesJ.forEach(c => c.remove()); calquesJ = []; moiJ = precJ = null;
  const p = partie(), l = lieux(), points = [];
  p.liste.forEach(k => { if (!l[k]) return;
    if (p.pris.includes(k)) { calquesJ.push(L.marker(l[k], { icon: iconeCreature(k, "sauve"), interactive: false }).addTo(carteJ)); return; }
    const c = brumeDe(k); points.push(c);
    calquesJ.push(L.circle(c, { radius: 12, color: "#4ff3ff", weight: 2, fillColor: "#4ff3ff", fillOpacity: .2, interactive: false }).addTo(carteJ));
    calquesJ.push(L.marker(c, { icon: L.divIcon({ className: "", html: '<div class="mystere">?</div>', iconSize: [34, 34], iconAnchor: [17, 17] }), interactive: false }).addTo(carteJ));
  });
  setTimeout(() => { carteJ.invalidateSize(); const b = positionGPS ? points.concat([[positionGPS.lat, positionGPS.lon]]) : points;
    if (b.length > 1) carteJ.fitBounds(L.latLngBounds(b).pad(.2), { maxZoom: 19 }); else carteJ.setView(b[0], 18); }, 80);
  if (!navigator.geolocation) return erreur("Pas de GPS sur ce téléphone.");
  if (suiviJ == null) suiviJ = navigator.geolocation.watchPosition(p => {
    positionGPS = { lat: p.coords.latitude, lon: p.coords.longitude, precision: p.coords.accuracy }; majJoueur();
  }, () => erreur("Le GPS ne répond pas : autorise la localisation pour ce site (Réglages › Safari › Position)."), { enableHighAccuracy: true, maximumAge: 1000 });
  else majJoueur();
}
function majJoueur() {
  if (!positionGPS || $("carteJeu").hidden || !carteJ || traque) return;
  const ll = [positionGPS.lat, positionGPS.lon];
  if (!moiJ) { precJ = L.circle(ll, { radius: positionGPS.precision, color: "#3aa0ff", weight: 1, fillOpacity: .1, interactive: false }).addTo(carteJ);
    moiJ = L.marker(ll, { icon: iconeMoi(), interactive: false, zIndexOffset: 1000 }).addTo(carteJ); calquesJ.push(precJ, moiJ); }
  moiJ.setLatLng(ll); precJ.setLatLng(ll).setRadius(positionGPS.precision);
  if (performance.now() - toucheCarte > 8000) carteJ.panTo(ll, { animate: true });
  const l = lieux(); let proche = null, dmin = 1e9;
  restantesParc().forEach(k => { const d = distance(positionGPS, { lat: l[k][0], lon: l[k][1] }); if (d < dmin) { dmin = d; proche = k; } });
  if (!proche) return;
  const seuil = Math.max(6, Math.min(12, positionGPS.precision * .8));
  if (dmin < seuil) return entrerBrume(proche);
  $("consigne").textContent = (dmin < seuil + 8 ? "Tu brûles ! " : dmin < seuil + 20 ? "Tu chauffes… " : "") + "Brume la plus proche : " + Math.round(dmin) + " m";
}
function entrerBrume(k) {
  $("carteJeu").hidden = true; sfx("oeil"); if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
  const l = lieux()[k], brg = relevement(positionGPS, { lat: l[0], lon: l[1] });
  // la créature apparaît dans la direction de sa cachette (si la boussole est disponible)
  demarrerTraque(k, { gpsFait: true, angleGPS: cap != null ? lacetCamera() - (brg - cap) * DEG : null });
}
$("recentrer").addEventListener("click", () => { toucheCarte = 0; if (positionGPS && carteJ) carteJ.setView([positionGPS.lat, positionGPS.lon], 19); });

$("continuer").addEventListener("click", () => { montrer(null); $("scene").hidden = false; history.replaceState(null, "", location.pathname); prochaineTraque.lu = true; prochaineTraque(); });
$("rejouer").addEventListener("click", () => { $("scene").hidden = true; preparerChoix(); montrer("partie"); });
$("quitter").addEventListener("click", () => {
  if (moteur && moteur.creature) { moteur.creature.detruire(); moteur.creature = null; }
  $("scene").hidden = true; $("viseur").hidden = true; $("radar").hidden = true; $("carteJeu").hidden = true;
  if (suiviJ != null) { navigator.geolocation.clearWatch(suiviJ); suiviJ = null; }
  majAccueil(); montrer("accueil");
});

// lien direct vers une traque (QR code scanné avec l'appareil photo) : l'aventure commence tout de suite
const demandeInitiale = new URLSearchParams(location.search).get("m");
if (demandeInitiale && TRAQUES[demandeInitiale]) {
  const p = enCours();
  $("intro-accueil").textContent = p && p.liste.includes(demandeInitiale) && !p.pris.includes(demandeInitiale)
    ? "Une créature se cache tout près d'ici… Reprends ton aventure pour la sauver !"
    : "Une créature se cache tout près d'ici… Commence l'aventure pour la sauver !";
}

// pour les tests sur ordinateur
window.__test = { ouvrir: () => { montrer(null); $("scene").hidden = false; initMoteur(); prochaineTraque(); }, capturer: () => capturer(),
  regarder: () => { const c = moteur.creature; if (c) c.angle = lacetCamera(); },
  etat: () => { const c = moteur && moteur.creature; return { angle: c && c.angle, lacet: moteur && lacetCamera(), gyro, gyroOK, trouve: c && c.trouve, consigne: $("consigne").textContent }; } };
