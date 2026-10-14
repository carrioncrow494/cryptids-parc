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
  "Chapristi !!!\nOn m'a volé mon précieux grimoire contenant l'ensemble des Cryptides. J'ai pu le retrouver, mais certains se sont égarés et perdus. Aide-moi à les sauver.",
  "Quoi !! Tu ne sais pas ce qu'est un Cryptide ?\nUn Cryptide est une créature souvent craintive, qui vit cachée et qui est difficile à voir avec des yeux d'humains.",
  "Tiens ! Prends cet œil magique et ce détecteur pour les trouver. Une fois localisés, capture-les avec le sceau magique en tapotant l'écran. Nous les relâcherons ensemble dans leur environnement.",
  "Pour chaque sauvetage réussi, tu gagneras des figurines à collectionner.\n\nAllez vite, dépêche-toi !"
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
let audio = null, maitre = null, musiqueOn = false;
let volume = (v => v === true ? .8 : v === false ? 0 : Math.max(0, Math.min(1, +v || 0)))(lire(CLES.son, .8)), sonActif = volume > 0;
const gainVolume = () => volume * volume;   // courbe plus naturelle à l'oreille
const tampons = {};
function initAudio() {
  if (audio) { audio.resume(); return; }
  try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  maitre = audio.createGain(); maitre.gain.value = gainVolume(); maitre.connect(audio.destination);
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
  page: () => { souffle(0, .25, 1500, 600, .1); },
  tape: () => { note(hz(84 + Math.floor(Math.random() * 5)), 0, .14, { vol: .09, type: "triangle" }); },
  fuite: () => { souffle(0, .5, 3500, 500, .16); note(hz(79), 0, .2, { vol: .06, type: "square", filtre: 1800 }); note(hz(72), .1, .25, { vol: .06, type: "square", filtre: 1800 }); },
  hop: () => { note(hz(76), 0, .08, { vol: .05, type: "square", filtre: 2500 }); note(hz(83), .05, .1, { vol: .05, type: "square", filtre: 2500 }); }
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
$("son").addEventListener("click", e => { e.stopPropagation(); initAudio(); $("panneauSon").hidden = !$("panneauSon").hidden; });
$("volume").value = Math.round(volume * 100);
$("volume").addEventListener("input", () => {
  volume = $("volume").value / 100; sonActif = volume > 0; ecrire(CLES.son, volume); initAudio();
  if (maitre) maitre.gain.setTargetAtTime(gainVolume(), audio.currentTime, .03);
  document.querySelectorAll("video").forEach(v => { if (v.id !== "camera") v.muted = !sonActif; });
  majBoutonSon();
});
$("volume").addEventListener("change", () => sfx("clic"));
document.addEventListener("pointerdown", e => { if (!$("panneauSon").hidden && !e.target.closest("#panneauSon, #son")) $("panneauSon").hidden = true; }, true);
majBoutonSon();
["pointerdown", "touchend"].forEach(ev => document.addEventListener(ev, () => initAudio(), { once: true, capture: true }));
document.addEventListener("click", e => { const b = e.target.closest("button, a"); if (!b) return; initAudio();
  if (!b.closest("#son, #sceau, #suiteIntro")) sfx(b.matches("#commencer, #cestParti, #reprendre, [data-mode], .principal, .mini, .orange") ? "valider" : "clic"); }, true);
document.addEventListener("pointerdown", e => { const b = e.target.closest("button, a, .choix-carte"); if (!b) return;
  b.classList.remove("appuye"); void b.offsetWidth; b.classList.add("appuye"); setTimeout(() => b.classList.remove("appuye"), 450); if (navigator.vibrate) navigator.vibrate(12); }, true);

/* ===================== Accueil, parents ===================== */
const LIBELLES = { qr: "Mode : QR codes cachés", interieur: "Mode : intérieur (10 m)", exterieur: "Mode : extérieur (20 m)" };
function majModes() {
  majAccueil(); $("modeParents").textContent = LIBELLES[mode()];
  document.querySelectorAll(".carte-mode").forEach(c => { c.classList.toggle("actif", c.dataset.mode === mode()); c.classList.toggle("eteint", c.dataset.mode !== mode()); });
}
$("ouvrirParents").addEventListener("click", () => { majModes(); montrer("parents"); });
$("fermerParents").addEventListener("click", () => { majModes(); montrer("accueil"); });
document.querySelectorAll(".carte-mode").forEach(b => b.addEventListener("click", e => {
  if (e.target.closest("a")) return;   // le lien de la planche reste un lien
  ecrire(CLES.mode, b.dataset.mode); majModes(); sfx("valider");
  if (e.target.closest("[data-placer]")) return setTimeout(ouvrirCarteParents, 300);
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
let pageIntro = 0, ecrit = null, textesIntro = INTRO, finIntro = () => apresIntro();
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
  const txt = textesIntro[i], p = $("texteIntro"); clearInterval(ecrit); p.textContent = ""; let n = 0;
  parler(txt);
  ecrit = setInterval(() => { n += 2; p.textContent = txt.slice(0, n); if (n >= txt.length) clearInterval(ecrit); }, 28);
  $("suiteIntro").textContent = i === textesIntro.length - 1 ? (textesIntro === INTRO ? "À l'aventure !" : "Relever le défi !") : "Suite";
  sfx("page");
}
function lancerAventure() { initAudio(); ouvrirOeil(); }
$("commencer").addEventListener("click", () => { initAudio(); pageIntro = 0; textesIntro = INTRO; finIntro = apresIntro; montrer("intro"); afficherIntro(0); });
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
  if (mode() === "exterieur" && places().length) return majChoix();
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
  const parc = mode() === "exterieur" && places().length > 0;
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
  $("duree").textContent = nombre < 2 ? "Choisis au moins 2 cryptides" : nombre + " cryptides à sauver";
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
  $("defiAccueil").hidden = !bossDispo();
  $("modeActuel").textContent = LIBELLES[mode()] + (p ? " · partie en cours " + p.pris.length + " / " + p.liste.length : "");
}
$("passerIntro").addEventListener("click", () => finIntro());
$("suiteIntro").addEventListener("click", () => {
  const p = $("texteIntro");
  if (p.textContent.length < textesIntro[pageIntro].length) { clearInterval(ecrit); p.textContent = textesIntro[pageIntro]; return; }   // termine la phrase
  if (pageIntro < textesIntro.length - 1) { afficherIntro(++pageIntro); return; }
  finIntro();
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
const ECH_FIG = { thunderbird: 1.3 };   // Huhuk : ses grandes ailes le rendaient tout petit sur le socle
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
    const ech = 1.1 / Math.max(s.y, s.x * 1.1, s.z * 1.1) * (ECH_FIG[cle] || 1);
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
      $("consigne").textContent = "Le voilà ! Tapote-le vite pour remplir la jauge de capture !";
      $("nomMonstre").textContent = c.m.nom || traque.nom.split(",")[0]; $("gauche").hidden = $("droite").hidden = true;
      $("jauge").hidden = false; $("jaugeEtoiles").textContent = "★".repeat(c.diff) + "☆".repeat(Math.max(0, 4 - c.diff));
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
    if (c.trouve && !c.pris) {   // la jauge se vide doucement quand on ne tapote pas
      if (visible) c.jauge = Math.max(0, c.jauge - DRAIN[c.diff] * dt);
      $("jaugeBarre").style.width = (c.jauge * 100) + "%";
      $("gauche").hidden = visible || !s.gauche; $("droite").hidden = visible || s.gauche;
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
  if (rayon.intersectObject(c.plan, false).length) frapper();
});
$("sceau").addEventListener("click", () => {
  const c = moteur && moteur.creature; if (!c || !c.trouve || c.pris) return;
  const s = situation(c);
  if (s.devant && Math.abs(s.x) < .6 && Math.abs(s.y) < 1) frapper();
  else { sfx("rate"); $("consigne").textContent = "Vise la créature avec l'œil pour utiliser le sceau !"; }
});
function capturer() {
  const c = moteur.creature; c.pris = true; c.tPris = performance.now(); $("jaugeBarre").style.width = "100%";
  $("gauche").hidden = $("droite").hidden = true;
  if (navigator.vibrate) navigator.vibrate(120);
  sfx("capture");
  centre.copy(c.pivot.position); centre.y += c.m.taille / 2; centre.project(moteur.camera);
  const s = $("sigil"); s.style.left = ((centre.x + 1) / 2 * innerWidth) + "px"; s.style.top = ((1 - centre.y) / 2 * innerHeight) + "px";
  if (sigilBlob) { if (s.src) URL.revokeObjectURL(s.src); s.src = URL.createObjectURL(sigilBlob); s.hidden = false; }
  setTimeout(() => $("eclair").classList.add("flash"), 2100);
  setTimeout(() => { s.hidden = true; $("eclair").classList.remove("flash"); apresCapture(); }, 2900);
}
function apresCapture() {
  moteur.creature.detruire(); moteur.creature = null; $("jauge").hidden = true;
  if (traque.boss) return bossVaincu();
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
  $("titreVictoire").textContent = "Sauvé !"; $("defi").hidden = !(n >= total && bossDispo());
  $("final").textContent = $("defi").hidden ? TEXTE_FINAL : "Tous les cryptides sont sauvés ! Mais Sporran a un dernier défi pour toi…";
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
  $("viseur").hidden = true; $("radar").hidden = true; $("gauche").hidden = $("droite").hidden = true; $("jauge").hidden = true;
  if (enBoss) return mode() === "qr" ? demarrerBossAR() : ouvrirPixel();
  const demande = new URLSearchParams(location.search).get("m");
  const p = partie() || { liste: ids, pris: [] };
  if (demande && p.liste.includes(demande) && !p.pris.includes(demande) && !prochaineTraque.lu) { prochaineTraque.lu = true; return demarrerTraque(demande); }
  prochaineTraque.lu = true;
  const restantes = p.liste.filter(k => !p.pris.includes(k));
  if (!restantes.length) {
    if (bossDispo()) return lancerDefi();
    $("nomMonstre").textContent = "Œil magique"; $("consigne").textContent = "Aventure terminée ! Ouvre ton grimoire ou lance une nouvelle aventure."; return; }
  if (mode() === "qr") return scanner();
  ouvrirPixel();
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
  const c = creerCreature(m); c.diff = traque.boss ? 4 : (DIFF[traque.cle] || 2); c.jauge = 0; c.esquives = 0;
  moteur.creature = c; placer(c, traque.angleGPS);
  tDebutRecherche = performance.now();
  $("nomMonstre").textContent = traque.boss ? "Sporran" : traque.membres.length > 1 ? m.nom + " (" + (membreIdx + 1) + "/2)" : "???";
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

$("continuer").addEventListener("click", () => { montrer(null); $("scene").hidden = false; history.replaceState(null, "", location.pathname); prochaineTraque.lu = true; prochaineTraque(); });
$("rejouer").addEventListener("click", () => { $("scene").hidden = true; preparerChoix(); montrer("partie"); });
$("quitter").addEventListener("click", () => {
  if (moteur && moteur.creature) { moteur.creature.detruire(); moteur.creature = null; }
  $("scene").hidden = true; $("viseur").hidden = true; $("radar").hidden = true; fermerPixel(); arreterGPS(); $("jauge").hidden = true; enBoss = false;
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

/* ===================== V3 : chasse sur carte pixel art, détecteur, jauge, boss ===================== */
const CLE_BOSS = "cryptidsParc-boss";
const TEXTE_FINAL = $("final").textContent;
// difficulté de capture (1 = facile … 4 = boss)
const DIFF = { mothman: 2, nessie: 1, thunderbird: 3, barghest: 2, faery: 2, lutins: 1, jackalope: 3, yeti: 1, gargouille: 2, chupacabra: 3, kraken: 2, swamp: 1 };
const GAIN = { 1: .2, 2: .14, 3: .11, 4: .08 };            // jauge gagnée par tapotement
const DRAIN = { 1: .03, 2: .06, 3: .09, 4: .12 };          // jauge perdue par seconde
const ESQUIVES = { 1: [], 2: [.5], 3: [.35, .7], 4: [.25, .5, .75] };   // la créature s'échappe à ces niveaux de jauge
const SAUT = { 1: 1900, 2: 1500, 3: 1150, 4: 800 };       // sur la carte : temps entre deux sauts (ms)
const BOSS_MEMBRE = { nom: "Sporran", id: "catsith", ar: "ar-catsith.mp4", ratio: 1.0706, taille: 1.85, pied: 0.046, altitude: 0 };
const DEFI = [
  "Bravo !!! Tu as sauvé tous les Cryptides de mon grimoire. Je n'en reviens pas…",
  "Mais es-tu assez rapide pour attraper le plus malin de tous… MOI ?\nHé hé ! Je me cache tout près. Sors ton détecteur et attrape-moi si tu peux !"
];
let enBoss = false, bossPhase = 0;
function bossDispo() { return pris().length >= ids.length && !lire("cryptidsParc-boss", false); }   // déclarée tôt : utilisée dès l'accueil
const pixDe = k => k === "catsith" ? "pix-catsith.gif" : "pix-" + TRAQUES[k].cle + ".gif";
const rayonJeu = () => mode() === "interieur" ? 10 : 20;
const restantesJeu = () => { const p = partie(); return p ? p.liste.filter(k => !p.pris.includes(k)) : []; };

// ---------- défi de Sporran ----------
function lancerDefi() {
  fermerPixel(); $("scene").hidden = true; $("jauge").hidden = true;
  textesIntro = DEFI; finIntro = demarrerBoss; pageIntro = 0; montrer("intro"); afficherIntro(0);
}
function demarrerBoss() {
  clearInterval(ecrit); enBoss = true; bossPhase = 0; textesIntro = INTRO; finIntro = apresIntro;
  const p = partie(); if (p) { delete p.posBoss; ecrire(CLES.partie, p); }
  if (!$("camera").srcObject) return ouvrirOeil();     // l'œil magique n'est pas encore ouvert
  montrer(null); $("scene").hidden = false; changerAmbiance("chasse"); prochaineTraque();
}
function demarrerBossAR() {
  fermerPixel();
  traque = { id: "boss", boss: true, cle: "catsith", nom: GARDIEN.nom, texte: GARDIEN.texte, image: GARDIEN.image, membres: [BOSS_MEMBRE], gpsFait: true, angleGPS: null };
  membreIdx = 0; lancerMembre();
  $("consigne").textContent = "Sporran se cache autour de toi… Tourne sur toi-même !";
}
function bossVaincu() {
  ecrire(CLE_BOSS, true); enBoss = false; sfx("victoire");
  $("titreVictoire").textContent = "Défi relevé !";
  $("portrait").src = GARDIEN.image; $("ficheNom").textContent = GARDIEN.nom;
  $("ficheTexte").textContent = "Grrr… Tu m'as attrapé ! Tu as l'œil vif et les pattes rapides. Te voilà Gardien du grimoire, pour toujours !";
  $("compteur").textContent = ""; $("final").hidden = true; $("continuer").hidden = true; $("rejouer").hidden = false; $("defi").hidden = true;
  $("scene").hidden = true; montrer("victoire");
}
$("defi").addEventListener("click", lancerDefi);
$("defiAccueil").addEventListener("click", () => { initAudio(); if (!partie()) ecrire(CLES.partie, { liste: [], pris: [], membres: {}, debut: Date.now() }); lancerDefi(); });

// ---------- AR : tapoter pour remplir la jauge ----------
function frapper() {
  const c = moteur && moteur.creature; if (!c || !c.trouve || c.pris) return;
  c.jauge = Math.min(1, c.jauge + GAIN[c.diff]); jaillir(c, 5); sfx("tape"); if (navigator.vibrate) navigator.vibrate(15);
  $("jaugeBarre").style.width = (c.jauge * 100) + "%";
  if (c.jauge >= 1) { sfx("sceau"); return capturer(); }
  const seuils = ESQUIVES[c.diff];
  if (c.esquives < seuils.length && c.jauge >= seuils[c.esquives]) { c.esquives++; esquiver(c); }
}
function esquiver(c) {
  jaillir(c, 22); sfx("fuite");
  c.angle += (Math.random() < .5 ? -1 : 1) * (55 + Math.random() * 55) * DEG;
  c.tReveal = performance.now() + 250;   // réapparaît en fondu à sa nouvelle place
  $("consigne").textContent = (traque.boss ? "Hé hé ! Raté !" : "Oh ! Il s'est échappé !") + " Retrouve-le et continue à tapoter !";
  setTimeout(() => jouerTampon("cri-" + c.m.id, .8, 0), 400);
}

// ---------- carte pixel art ----------
const PAL = {
  herbe: "#2e4a2c", herbe2: "#35552f", herbe3: "#284126", parc: "#3b6b34", terrain: "#45803c", bois: "#1f3a24", quartier: "#36443a",
  cimetiere: "#33463a", eau: "#1d4e7a", eau2: "#2f74a8", route: "#4b4b55", bordure: "#2a2a30", marquage: "#c9b26a", dalle: "#6a6670",
  chemin: "#a6875a", chemin2: "#7a623e", parking: "#43434b", facade: "#3d2a3a", toit: "#6e4a63", toitClair: "#8a6280",
  arbre1: "#173a20", arbre2: "#24572c", arbre3: "#3a7a3a", tronc: "#4a3020", ombre: "#1a2a1c", mur: "#77727a", cloture: "#6b5236"
};
const PAL_RGB = Object.values(PAL).map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const EAU_RGB = PAL_RGB[Object.keys(PAL).indexOf("eau")];
let PXC = null, suiviPX = null, fixPX = null, tAttentePX = 0;
const M_LAT = 110540;
const versM = (lat, lon) => ({ x: (lon - PXC.origine[1]) * 111320 * Math.cos(PXC.origine[0] * DEG), y: -(lat - PXC.origine[0]) * M_LAT });
const versGeo = (x, y) => [PXC.origine[0] - y / M_LAT, PXC.origine[1] + x / (111320 * Math.cos(PXC.origine[0] * DEG))];
function hasard(graine) { let a = graine >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function ouvrirPixel() {
  traque = null; $("viseur").hidden = true; $("jauge").hidden = true; $("sceau").disabled = true; $("gauche").hidden = $("droite").hidden = true;
  if (!enBoss && !restantesJeu().length) { fermerPixel(); return prochaineTraque(); }
  $("pixel").hidden = false; $("detecteur").hidden = false;
  $("nomMonstre").textContent = enBoss ? "Sporran" : "Œil magique";
  if (!PXC) PXC = { carte: null, origine: null, joueur: { x: 0, y: 0 }, manuel: false, vise: null, cibles: [], revele: null, signal: 0, dernierBip: 0, raf: 0, t: 0 };
  PXC.revele = null; $("pixelSprites").innerHTML = "";
  const p = partie();
  if (p && p.origine) preparerCarte(p.origine, p.fictif);
  else { $("consigne").textContent = "Recherche de ta position…"; tAttentePX = performance.now(); }
  demarrerGPS();
  if (!PXC.raf) PXC.raf = requestAnimationFrame(bouclePixel);
}
function fermerPixel() {
  $("pixel").hidden = true; $("detecteur").hidden = true;
  if (PXC) { if (PXC.raf) cancelAnimationFrame(PXC.raf); PXC.raf = 0; PXC.revele = null; }
  $("pixelSprites").innerHTML = "";
}
function demarrerGPS() {
  if (suiviPX != null) return;
  if (!navigator.geolocation) return passerManuel("Pas de GPS sur cet appareil");
  suiviPX = navigator.geolocation.watchPosition(pos => {
    fixPX = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy || 50 };
    const p = partie();
    if (p && !p.origine && !$("pixel").hidden && (fixPX.acc < 40 || performance.now() - tAttentePX > 12000)) {
      majPartie(q => { q.origine = [fixPX.lat, fixPX.lon]; q.fictif = false; }); preparerCarte([fixPX.lat, fixPX.lon], false);
    }
  }, err => {   // refus ou GPS absent : on passe en marche au doigt (une simple attente trop longue n'est pas une erreur)
    if (PXC && !PXC.manuel && (err.code === 1 || !fixPX)) passerManuel(err.code === 1 ? "Localisation refusée" : "Le GPS ne répond pas");
  }, { enableHighAccuracy: true, maximumAge: 1000 });
  setTimeout(() => { if (!fixPX && PXC && !PXC.manuel && !$("pixel").hidden) passerManuel("Pas de signal GPS"); }, 15000);
}
function arreterGPS() { if (suiviPX != null) { navigator.geolocation.clearWatch(suiviPX); suiviPX = null; } }
function passerManuel(msg) {
  if (!PXC) return;
  PXC.manuel = true; $("marcher").classList.add("actif");
  if (msg) bandeau(msg + " : touche la carte pour te déplacer.", 5500);
  const p = partie();
  if (p && !p.origine) { majPartie(q => { q.origine = [45, 0]; q.fictif = true; }); preparerCarte([45, 0], true); }
}
$("marcher").addEventListener("click", () => {
  if (!PXC) return;
  if (PXC.manuel && fixPX && !(partie() || {}).fictif) { PXC.manuel = false; PXC.vise = null; $("marcher").classList.remove("actif"); bandeau("Le GPS te suit de nouveau.", 2500); }
  else { PXC.manuel = true; $("marcher").classList.add("actif"); bandeau("Touche la carte pour te déplacer.", 2500); }
});
$("pixelCanvas").addEventListener("pointerdown", e => {
  if (!PXC || !PXC.manuel || !PXC.ech) return;
  const r = $("pixelCanvas").getBoundingClientRect(), d = PXC.dpr;
  PXC.vise = { x: ((e.clientX - r.left) * d - PXC.ox) / PXC.ech - PXC.H, y: ((e.clientY - r.top) * d - PXC.oy) / PXC.ech - PXC.H };
});

function preparerCarte(orig, fictif) {
  const meme = PXC.origine && PXC.origine[0] === orig[0] && PXC.origine[1] === orig[1] && PXC.carte;
  if (!meme) {
    PXC.origine = orig; PXC.fictif = !!fictif;
    const ind = mode() === "interieur"; PXC.H = ind ? 40 : 70; PXC.ppm = ind ? 3 : 2; PXC.zoom = ind ? 4 : 3;
    PXC.joueur = fixPX && !fictif ? versM(fixPX.lat, fixPX.lon) : { x: 0, y: 0 };
    dessinerCarte(null);
    if (!fictif) chargerOSM(orig).then(d => { if (PXC.origine === orig) { dessinerCarte(d); habiter(); } })
      .catch(() => bandeau("La carte du quartier n'a pas pu se charger (réseau ?). Le détecteur marche quand même.", 5000));
  }
  placerCibles();
  $("consigne").textContent = enBoss ? "Sporran se cache tout près… Suis le détecteur !" : "Marche et suis le détecteur : plus il s'allume, plus un cryptide est proche !";
}
function placerCibles() {
  const p = partie(); if (!p) return;
  p.pos = p.pos || {};
  const R = rayonJeu(), ind = mode() === "interieur", ecart = ind ? 3 : 6, mini = ind ? 3 : 6, l = mode() === "exterieur" ? lieux() : {};
  const pris = Object.values(p.pos).map(g => versM(g[0], g[1]));
  const tirer = (rMin, rMax, cx, cy) => { let b = null;
    for (let i = 0; i < 60; i++) { const a = Math.random() * 2 * Math.PI, r = rMin + Math.random() * (rMax - rMin), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      b = { x, y }; if (pris.every(e => Math.hypot(e.x - x, e.y - y) >= ecart) && (ind || accessible(x, y))) break; }
    pris.push(b); return b; };
  const habitats = !ind && !PXC.fictif;   // en extérieur, la créature tirée au hasard ira dans son habitat dès que la carte du quartier sera chargée
  p.auHasard = p.auHasard || [];
  p.liste.forEach(k => { if (p.pos[k]) return; if (l[k]) { p.pos[k] = l[k]; return; } const b = tirer(mini, R, 0, 0); p.pos[k] = versGeo(b.x, b.y); if (habitats) p.auHasard.push(k); });
  if (enBoss && !p.posBoss) { const b = tirer(ind ? 4 : 8, ind ? 9 : 16, PXC.joueur.x, PXC.joueur.y); p.posBoss = versGeo(b.x, b.y); }
  ecrire(CLES.partie, p);
  PXC.cibles = enBoss ? [Object.assign({ k: "catsith" }, versM(p.posBoss[0], p.posBoss[1]))]
                      : restantesJeu().map(k => Object.assign({ k }, versM(p.pos[k][0], p.pos[k][1])));
}

// ---------- habitats : chaque créature se cache sur un terrain qui lui ressemble ----------
// règles essayées dans l'ordre : [couleurs de la palette, distance maximale en mètres] ; "lampe" = lampadaire OSM
const ARBRES = ["arbre1", "arbre2", "arbre3"];
const HABITAT = {
  mothman: [["lampe", 3], [["chemin", "chemin2", "dalle"], 1]],    // aime la lumière : sous un lampadaire, sinon le long d'un chemin
  nessie: [[["eau"], 3]],                                           // au bord de l'eau
  thunderbird: [[["terrain"], 0], [["parc"], 0]],                   // en terrain découvert
  barghest: [[["bois"], 0], [["cimetiere"], 0], [ARBRES, 1]],      // dans les endroits sombres
  faery: [[ARBRES, 2], [["parc"], 0]],
  lutins: [[ARBRES, 1], [["parc", "quartier"], 0]],                 // les jardins, les marronniers
  jackalope: [[["chemin", "chemin2"], 0], [["terrain", "parc"], 0]],   // là où l'on peut courir
  yeti: [[["chemin", "chemin2"], 0]],                               // ses traces sur les sentiers
  gargouille: [[["toit", "facade", "mur"], 2]],                     // au pied d'un bâtiment
  chupacabra: [[["quartier"], 0], [["facade"], 3]],
  kraken: [[["eau"], 4]],
  swamp: [[["eau"], 4], [["bois"], 0]]                              // la boue : près de l'eau ou dans les bois
};
const INTERDIT = new Set(["eau", "eau2", "toit", "toitClair", "facade", "mur", "route", "bordure", "marquage", "parking"]);   // ni dans l'eau, ni dans un bâtiment, ni sur la route
const terrain = (x, y) => { const g = PXC && PXC.grille, S = 2 * PXC.H, i = Math.floor(x + PXC.H), j = Math.floor(y + PXC.H); return g && i >= 0 && j >= 0 && i < S && j < S ? g[j * S + i] : null; };
const accessible = (x, y) => !PXC || !PXC.grille || !INTERDIT.has(terrain(x, y));
function pres(x, y, couleurs, dist) {   // distance 0 : la case est bien à l'intérieur de ce terrain (au moins 7 cases sur 9)
  if (couleurs === "lampe") return PXC.lampes.some(q => Math.hypot(q.x - x, q.y - y) <= dist);
  if (!dist) { if (!couleurs.includes(terrain(x, y))) return false; let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += couleurs.includes(terrain(x + dx, y + dy));
    return n >= 7; }
  let n = 0;   // les bords des formes donnent des pixels de couleur intermédiaire : on demande au moins 3 cases, pas une seule isolée
  for (let dy = -dist; dy <= dist; dy++) for (let dx = -dist; dx <= dist; dx++)
    if (dx * dx + dy * dy <= dist * dist && couleurs.includes(terrain(x + dx, y + dy)) && ++n >= 3) return true;
  return false;
}
function caseHabitat(k, rMin, rMax, autres, ecart) {
  const regles = HABITAT[TRAQUES[k].cle] || [], cases = [];
  for (let y = -rMax; y <= rMax; y++) for (let x = -rMax; x <= rMax; x++) {
    const cx = x + .5, cy = y + .5, r = Math.hypot(cx, cy);
    if (r >= rMin && r <= rMax && accessible(cx, cy) && autres.every(e => Math.hypot(e.x - cx, e.y - cy) >= ecart)) cases.push({ x: cx, y: cy });
  }
  for (const [couleurs, dist] of regles) { const ok = cases.filter(c => pres(c.x, c.y, couleurs, dist)); if (ok.length) return ok[Math.floor(Math.random() * ok.length)]; }
  return cases.length ? cases[Math.floor(Math.random() * cases.length)] : null;
}
function habiter() {
  const p = partie(); if (!p || !p.pos || !p.auHasard || !p.auHasard.length || !PXC.grille || enBoss) return;
  const R = rayonJeu(), vu = PXC.revele && PXC.revele.c.k;
  const autres = Object.keys(p.pos).filter(k => !p.auHasard.includes(k)).map(k => versM(p.pos[k][0], p.pos[k][1]));
  p.auHasard.slice().forEach(k => {
    if (p.pris.includes(k) || k === vu) return;
    const c = caseHabitat(k, 6, R, autres, 6); if (!c) return;
    p.pos[k] = versGeo(c.x, c.y); autres.push(c); p.auHasard.splice(p.auHasard.indexOf(k), 1);
  });
  ecrire(CLES.partie, p); placerCibles();
}

async function chargerOSM(orig) {
  const H = PXC.H, R = Math.round(H * 1.45), [la, lo] = orig.map(v => +v.toFixed(6));
  const cle = "cryptidsParc-osm-" + la.toFixed(4) + "," + lo.toFixed(4) + "," + R;
  try { const c = sessionStorage.getItem(cle); if (c) return JSON.parse(c); } catch (e) {}
  const a = `(around:${R},${la},${lo})`;
  const q = `[out:json][timeout:25];(way["building"]${a};way["highway"]${a};way["natural"~"water|wood|scrub|grassland|wetland|beach|sand"]${a};relation["natural"="water"]${a};` +
    `way["waterway"]${a};way["landuse"~"grass|forest|meadow|recreation_ground|village_green|cemetery|allotments|residential|basin|reservoir"]${a};` +
    `way["leisure"~"park|garden|pitch|playground|swimming_pool"]${a};way["amenity"="parking"]${a};node["natural"="tree"]${a};node["highway"="street_lamp"]${a};way["barrier"~"wall|fence|hedge"]${a};);out geom;`;
  let dernier = null;
  for (const url of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      const ctl = new AbortController(), minuterie = setTimeout(() => ctl.abort(), 25000);
      const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: ctl.signal });
      clearTimeout(minuterie); if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json(); try { sessionStorage.setItem(cle, JSON.stringify(d)); } catch (e) {}
      return d;
    } catch (e) { dernier = e; }
  }
  throw dernier;
}

function dessinerCarte(d) {
  const H = PXC.H, k = PXC.ppm, N = Math.round(2 * H * k);
  const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d", { willReadFrequently: true });
  const P = (lat, lon) => { const m = versM(lat, lon); return [(m.x + H) * k, (m.y + H) * k]; };
  const rnd = hasard(Math.round((PXC.origine[0] + PXC.origine[1]) * 1e5));
  g.fillStyle = PAL.herbe; g.fillRect(0, 0, N, N);
  for (let i = 0; i < N * N * .14; i++) { g.fillStyle = rnd() < .5 ? PAL.herbe2 : PAL.herbe3; g.fillRect((rnd() * N) | 0, (rnd() * N) | 0, 1, 1); }
  const arbres = [];
  if (d && d.elements) {
    const t = e => e.tags || {}, ways = d.elements.filter(e => e.type === "way" && e.geometry && e.geometry.length > 1);
    const chemin = geom => { const p = new Path2D(); geom.forEach((pt, i) => { const [x, y] = P(pt.lat, pt.lon); i ? p.lineTo(x, y) : p.moveTo(x, y); }); return p; };
    const surface = (geom, couleur) => { const p = chemin(geom); p.closePath(); g.fillStyle = couleur; g.fill(p); return p; };
    const trait = (geom, largeur, couleur, pointilles) => { g.strokeStyle = couleur; g.lineWidth = Math.max(1, largeur * k); g.lineCap = g.lineJoin = "round"; g.setLineDash(pointilles || []); g.stroke(chemin(geom)); g.setLineDash([]); };
    const semer = (geom, pas, densite) => { const p = chemin(geom); p.closePath();
      for (let y = 0; y < N; y += pas * k) for (let x = 0; x < N; x += pas * k) { const jx = x + (rnd() - .5) * pas * k, jy = y + (rnd() - .5) * pas * k;
        if (rnd() < densite && g.isPointInPath(p, jx, jy)) arbres.push([jx, jy]); } };
    ways.filter(e => /^(residential|allotments)$/.test(t(e).landuse)).forEach(e => surface(e.geometry, PAL.quartier));
    ways.filter(e => t(e).landuse === "cemetery").forEach(e => surface(e.geometry, PAL.cimetiere));
    ways.filter(e => /^(grass|meadow|village_green|recreation_ground)$/.test(t(e).landuse) || /^(park|garden|playground)$/.test(t(e).leisure) || t(e).natural === "grassland").forEach(e => surface(e.geometry, PAL.parc));
    ways.filter(e => t(e).leisure === "pitch").forEach(e => surface(e.geometry, PAL.terrain));
    ways.filter(e => t(e).landuse === "forest" || /^(wood|scrub)$/.test(t(e).natural)).forEach(e => surface(e.geometry, PAL.bois));
    ways.filter(e => t(e).natural === "water" || t(e).leisure === "swimming_pool" || /^(basin|reservoir)$/.test(t(e).landuse)).forEach(e => surface(e.geometry, PAL.eau));
    d.elements.filter(e => e.type === "relation" && t(e).natural === "water").forEach(r => (r.members || []).filter(m => m.role === "outer" && m.geometry).forEach(m => surface(m.geometry, PAL.eau)));
    ways.filter(e => t(e).waterway).forEach(e => trait(e.geometry, t(e).waterway === "river" ? 8 : 2.5, PAL.eau));
    ways.filter(e => t(e).amenity === "parking").forEach(e => surface(e.geometry, PAL.parking));
    const L = { motorway: 14, trunk: 12, primary: 10, secondary: 9, tertiary: 8, residential: 6, unclassified: 6, living_street: 5, service: 4, pedestrian: 4 };
    const routes = ways.filter(e => L[t(e).highway]);
    routes.forEach(e => trait(e.geometry, L[t(e).highway] + 1.2, PAL.bordure));
    routes.forEach(e => trait(e.geometry, L[t(e).highway], t(e).highway === "pedestrian" ? PAL.dalle : PAL.route));
    routes.filter(e => L[t(e).highway] >= 8).forEach(e => trait(e.geometry, .4, PAL.marquage, [3 * k, 3 * k]));
    const sentiers = ways.filter(e => /^(footway|path|cycleway|track|bridleway|steps)$/.test(t(e).highway));
    sentiers.forEach(e => trait(e.geometry, 2.4, PAL.chemin2)); sentiers.forEach(e => trait(e.geometry, 1.7, PAL.chemin));
    ways.filter(e => t(e).barrier === "hedge").forEach(e => trait(e.geometry, 1.3, PAL.arbre2));
    ways.filter(e => /^(wall|fence)$/.test(t(e).barrier)).forEach(e => trait(e.geometry, .5, t(e).barrier === "wall" ? PAL.mur : PAL.cloture));
    const bat = ways.filter(e => t(e).building);
    bat.forEach(e => { g.save(); g.translate(0, Math.max(2, Math.round(k * 1.3))); surface(e.geometry, PAL.facade); g.restore(); });
    bat.forEach(e => { const p = surface(e.geometry, PAL.toit); g.strokeStyle = PAL.toitClair; g.lineWidth = 1; g.stroke(p); });
    ways.filter(e => t(e).landuse === "forest" || t(e).natural === "wood").forEach(e => semer(e.geometry, 5, .9));
    ways.filter(e => t(e).leisure === "park" || t(e).leisure === "garden").forEach(e => semer(e.geometry, 9, .22));
    d.elements.filter(e => e.type === "node" && t(e).natural === "tree").forEach(e => arbres.push(P(e.lat, e.lon)));
  }
  arbres.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => dessinerArbre(g, x, y, k));
  // palette réduite : bords nets, vrai rendu pixel art ; on garde la liste des pixels d'eau pour les reflets
  const img = g.getImageData(0, 0, N, N), px = img.data, eau = [];
  for (let i = 0; i < px.length; i += 4) {
    let m = 0, dm = 1e9; for (let c = 0; c < PAL_RGB.length; c++) { const q = PAL_RGB[c], dd = (px[i] - q[0]) ** 2 + (px[i + 1] - q[1]) ** 2 + (px[i + 2] - q[2]) ** 2; if (dd < dm) { dm = dd; m = c; } }
    const q = PAL_RGB[m]; px[i] = q[0]; px[i + 1] = q[1]; px[i + 2] = q[2]; px[i + 3] = 255;
    if (q === EAU_RGB && eau.length < 3000 && rnd() < .2) eau.push(i / 4);
  }
  g.putImageData(img, 0, 0);
  PXC.carte = cv; PXC.eau = eau; PXC.N = N;
  // grille du terrain, une case par mètre (couleur de la palette au centre de la case) : sert à cacher les créatures dans leur habitat
  const S = 2 * H, cles = Object.keys(PAL); PXC.grille = null; PXC.lampes = [];
  if (d && d.elements) {
    PXC.grille = new Array(S * S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const n = Math.floor((j + .5) * k) * N + Math.floor((i + .5) * k); PXC.grille[j * S + i] = cles[PAL_RGB.findIndex(q => q[0] === px[n * 4] && q[1] === px[n * 4 + 1] && q[2] === px[n * 4 + 2])]; }
    PXC.lampes = d.elements.filter(e => e.type === "node" && (e.tags || {}).highway === "street_lamp").map(e => versM(e.lat, e.lon));
  }
}
function dessinerArbre(g, x, y, k) {
  const r = Math.max(3, 2.1 * k);
  g.fillStyle = PAL.ombre; g.beginPath(); g.ellipse(x + r * .35, y + r * .75, r, r * .45, 0, 0, 7); g.fill();
  g.fillStyle = PAL.tronc; g.fillRect(Math.round(x - k * .3), Math.round(y - r * .2), Math.max(1, Math.round(k * .6)), Math.max(2, Math.round(r * .7)));
  g.fillStyle = PAL.arbre1; g.beginPath(); g.arc(x, y - r * .45, r, 0, 7); g.fill();
  g.fillStyle = PAL.arbre2; g.beginPath(); g.arc(x - r * .18, y - r * .62, r * .72, 0, 7); g.fill();
  g.fillStyle = PAL.arbre3; g.beginPath(); g.arc(x - r * .38, y - r * .85, r * .32, 0, 7); g.fill();
}
// le joueur : un petit enfant encapuchonné avec une lanterne
const SPRITE = ["....hhhh....", "...hppppph..", "..hpffffph..", "..hfeffefh..", "..hpffffph..", "...hppppph..", "..pppppppp.l",
                ".pppppppppLL", ".pp.pppp.pLL", "....pppp..l.", "....p..p....", "...bb..bb..."];
const SPRITE_C = { h: "#3d2366", p: "#7a4bb3", f: "#f2c9a0", e: "#1a1020", l: "#2b2b2b", L: "#ffd75e", b: "#2a1a12" };
function dessinerJoueur(g, cx, cy, z, t) {
  const s = Math.max(2, Math.round(z * .75)), w = SPRITE[0].length * s, h = SPRITE.length * s, x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h + s);
  const lueur = g.createRadialGradient(cx + w * .4, cy - h * .35, 0, cx + w * .4, cy - h * .35, w * 1.6);
  lueur.addColorStop(0, "rgba(255,215,94," + (.35 + .08 * Math.sin(t / 180)) + ")"); lueur.addColorStop(1, "rgba(255,215,94,0)");
  g.fillStyle = lueur; g.fillRect(cx - w * 2, cy - h * 2, w * 4, h * 4);
  g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x0 + s, y0 + h - s, w - 2 * s, s);
  SPRITE.forEach((ligne, j) => [...ligne].forEach((ch, i) => { if (ch === ".") return; g.fillStyle = SPRITE_C[ch]; g.fillRect(x0 + i * s, y0 + j * s, s, s); }));
  if (cap != null && !PXC.manuel) {   // petite flèche : la direction du regard (boussole)
    const a = cap * DEG, rr = h * .95; g.save(); g.translate(cx, cy - h / 2); g.rotate(a); g.fillStyle = "#4ff3ff";
    g.beginPath(); g.moveTo(0, -rr - s * 2); g.lineTo(s * 1.6, -rr); g.lineTo(-s * 1.6, -rr); g.closePath(); g.fill(); g.restore();
  }
}

function bouclePixel(t) {
  PXC.raf = 0;
  if ($("pixel").hidden || $("scene").hidden) return;
  PXC.raf = requestAnimationFrame(bouclePixel);
  const cv = $("pixelCanvas"), dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, Hc = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hc * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hc * dpr); }
  const g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
  const dt = Math.min(.1, (t - (PXC.t || t)) / 1000); PXC.t = t;
  if (PXC.origine) {
    if (PXC.manuel) {
      if (PXC.vise) { const dx = PXC.vise.x - PXC.joueur.x, dy = PXC.vise.y - PXC.joueur.y, dd = Math.hypot(dx, dy), v = 1.8 * dt;
        if (dd <= v) { PXC.joueur.x = PXC.vise.x; PXC.joueur.y = PXC.vise.y; PXC.vise = null; } else { PXC.joueur.x += dx / dd * v; PXC.joueur.y += dy / dd * v; } }
    } else if (fixPX && !PXC.fictif) {
      const m = versM(fixPX.lat, fixPX.lon), f = Math.min(1, dt * 2.5); PXC.joueur.x += (m.x - PXC.joueur.x) * f; PXC.joueur.y += (m.y - PXC.joueur.y) * f;
    }
  }
  const z = (PXC.zoom || 3) * dpr, k = PXC.ppm || 2, ech = k * z, H = PXC.H || 70;
  const cx = cv.width / 2, cy = cv.height * .54;
  const ox = Math.round(cx - (PXC.joueur.x + H) * ech), oy = Math.round(cy - (PXC.joueur.y + H) * ech);
  Object.assign(PXC, { ox, oy, ech, dpr, H });
  g.fillStyle = PAL.herbe; g.fillRect(0, 0, cv.width, cv.height);
  if (PXC.carte) {
    g.drawImage(PXC.carte, ox, oy, PXC.N * z, PXC.N * z);
    // reflets sur l'eau
    g.fillStyle = "#7fc8ff";
    for (let i = 0; i < PXC.eau.length; i += 7) { const n = PXC.eau[i], ph = (t / 600 + i * 1.7) % 6; if (ph > 1) continue;
      g.fillRect(ox + (n % PXC.N) * z, oy + Math.floor(n / PXC.N) * z, z * 2, z); }
  }
  dessinerJoueur(g, cx, cy, z, t);
  majApparition(t);
  if (t - (PXC.tDet || 0) > 180) { PXC.tDet = t; majDetecteur(t); }
}
const versEcran = (x, y) => [(PXC.ox + (x + PXC.H) * PXC.ech) / PXC.dpr, (PXC.oy + (y + PXC.H) * PXC.ech) / PXC.dpr];
function seuilApparition() {
  const ind = mode() === "interieur";
  if (PXC.manuel || !fixPX) return ind ? 2.5 : 4;
  return ind ? Math.max(3, Math.min(6, fixPX.acc * .5)) : Math.max(5, Math.min(10, fixPX.acc * .7));
}
function majDetecteur(t) {
  if (!PXC.origine) { allumer(0); return; }
  let c = null, dmin = 1e9;
  PXC.cibles.forEach(q => { const d = Math.hypot(q.x - PXC.joueur.x, q.y - PXC.joueur.y); if (d < dmin) { dmin = d; c = q; } });
  if (!c) { allumer(0); return; }
  const s0 = seuilApparition(), R = rayonJeu(), Dmax = 1.6 * R, e = dmin - s0;
  const s = Math.max(0, Math.min(1, 1 - e / (Dmax - s0)));
  PXC.signal += (s - PXC.signal) * .4;
  PXC.ecart = PXC.ecart == null ? e : PXC.ecart + (e - PXC.ecart) * .4;   // lissé : le GPS tremble
  // LED : rouge = loin, jaune = on approche, vert = tout près
  const n = PXC.revele ? 5 : PXC.ecart < .15 * R ? 5 : PXC.ecart < .35 * R ? 4 : PXC.ecart < .6 * R ? 3 : PXC.ecart < R ? 2 : 1;
  allumer(n);
  const periode = PXC.revele ? 260 : 1500 - 1200 * PXC.signal;
  if (t - PXC.dernierBip > periode) {
    PXC.dernierBip = t; if (audio && sonActif) note(480 + 900 * (PXC.revele ? 1 : PXC.signal), 0, .07, { type: "square", vol: .045, filtre: 2600 });
    const oeil = document.querySelector(".emf-oeil"), led = document.querySelector(".emf-leds i:nth-child(" + Math.max(1, n) + ")");
    oeil.style.setProperty("--led", getComputedStyle(led).getPropertyValue("--led")); oeil.classList.add("flash"); setTimeout(() => oeil.classList.remove("flash"), 90);
  }
  if (!PXC.revele) {
    if (dmin < s0) return reveler(c);
    $("consigne").textContent = ["", "Rien par ici… Marche un peu !", "Un faible signal…", "Ça chauffe !", "Tu brûles !!", "Tout près !!!"][n];
  }
}
function allumer(n) { document.querySelectorAll(".emf-leds i").forEach((l, i) => l.classList.toggle("on", i < n)); }

function reveler(c) {
  const el = new Image(); el.className = "pix-creature"; el.alt = ""; el.draggable = false;
  el.onload = () => { el.style.width = Math.round(el.naturalWidth * .225) + "px"; };   // moitié de la taille précédente
  el.src = pixDe(c.k);
  $("pixelSprites").appendChild(el);
  const d = enBoss ? 4 : (DIFF[TRAQUES[c.k] ? TRAQUES[c.k].cle : ""] || 2);
  PXC.revele = { c, el, dx: 0, dy: 0, prochain: performance.now() + SAUT[d] + 600, d };
  el.addEventListener("pointerdown", e => { e.stopPropagation(); attraper(); });
  sfx("revele"); if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  $("consigne").textContent = enBoss ? "Le voilà ! Touche Sporran avant qu'il ne file !" : "Un cryptide ! Touche-le vite avant qu'il ne bondisse !";
}
function majApparition(t) {
  const r = PXC.revele; if (!r) return;
  const dj = Math.hypot(r.c.x - PXC.joueur.x, r.c.y - PXC.joueur.y);
  if (dj > seuilApparition() + 8) {   // on s'est trop éloigné : il se cache de nouveau
    r.el.remove(); PXC.revele = null; $("consigne").textContent = "Il s'est caché de nouveau… Reviens vers lui !"; return; }
  if (t > r.prochain) {
    const rr = mode() === "interieur" ? 1.8 : 3.5, a = Math.random() * 2 * Math.PI;
    r.vx = Math.cos(a) * rr * Math.random(); r.vy = Math.sin(a) * rr * Math.random(); r.prochain = t + SAUT[r.d]; r.tSaut = t; sfx("hop");
  }
  // petit bond en 3 images (style pixel art) vers la nouvelle place
  if (r.tSaut != null) { const q = Math.min(1, Math.floor((t - r.tSaut) / 50) / 3); r.dx += ((r.vx || 0) - r.dx) * q; r.dy += ((r.vy || 0) - r.dy) * q; if (q >= 1) r.tSaut = null; }
  const bond = r.tSaut != null ? -Math.sin(Math.min(1, (t - r.tSaut) / 150) * Math.PI) * 14 : 0;
  const [x, y] = versEcran(r.c.x + r.dx, r.c.y + r.dy), w = r.el.offsetWidth || 120, h = r.el.offsetHeight || 120;
  const W = $("pixel").clientWidth, Hh = $("pixel").clientHeight;
  const ex = Math.max(4, Math.min(W - w - 4, x - w / 2)), ey = Math.max(150, Math.min(Hh - h - 210, y - h * .85));
  r.el.style.transform = "translate(" + Math.round(ex) + "px," + Math.round(ey + bond) + "px)";
}
function attraper() {
  const r = PXC.revele; if (!r) return;
  const box = r.el.getBoundingClientRect(), pouf = document.createElement("div"); pouf.className = "pouf";
  pouf.style.left = (box.left + box.width / 2) + "px"; pouf.style.top = (box.top + box.height / 2) + "px"; $("pixelSprites").appendChild(pouf); setTimeout(() => pouf.remove(), 600);
  r.el.remove(); PXC.revele = null; if (navigator.vibrate) navigator.vibrate(40);
  if (enBoss && bossPhase < 2) {   // Sporran file ailleurs deux fois avant de se laisser attraper
    bossPhase++; sfx("fuite");
    const p = partie(), ind = mode() === "interieur", a = Math.random() * 2 * Math.PI, d = ind ? 4 + Math.random() * 4 : 8 + Math.random() * 7;
    p.posBoss = versGeo(PXC.joueur.x + Math.cos(a) * d, PXC.joueur.y + Math.sin(a) * d); ecrire(CLES.partie, p); placerCibles();
    bandeau(bossPhase === 1 ? "Hé hé ! Trop lent ! Attrape-moi si tu peux !" : "Encore raté ! Dernière chance, petit humain !", 3200);
    $("consigne").textContent = "Sporran s'est enfui ! Suis le détecteur !"; return;
  }
  sfx("sceau"); bandeau(enBoss ? "Tu as débusqué Sporran ! Ouvre l'œil magique…" : "Débusqué ! Ouvre l'œil magique et cherche-le autour de toi…", 2400);
  const k = r.c.k;
  setTimeout(() => { fermerPixel(); sfx("oeil"); if (enBoss) demarrerBossAR(); else demarrerTraque(k, { gpsFait: true, angleGPS: null }); }, 900);
}

// pour les tests sur ordinateur
window.__test = { ouvrir: () => { montrer(null); $("scene").hidden = false; initMoteur(); prochaineTraque(); }, capturer: () => capturer(),
  regarder: () => { const c = moteur.creature; if (c) c.angle = lacetCamera(); },
  dbg: () => { const m = versM(fixPX.lat, fixPX.lon); return { m, manuel: PXC.manuel, fictif: PXC.fictif, org: PXC.origine, jo: PXC.joueur }; },
  pixel: () => PXC && { t: PXC.t, raf: PXC.raf, fix: fixPX, fictif: PXC.fictif, origine: PXC.origine, joueur: PXC.joueur, cibles: PXC.cibles, revele: PXC.revele && PXC.revele.c.k, manuel: PXC.manuel, carte: !!PXC.carte, N: PXC.N, signal: PXC.signal },
  aller: (x, y) => { PXC.manuel = true; PXC.vise = { x, y }; }, terrain: (x, y) => terrain(x, y), carte: () => PXC.carte && { url: PXC.carte.toDataURL(), H: PXC.H, ppm: PXC.ppm }, attraper: () => attraper(), frapper: () => frapper(),
  jauge: () => moteur && moteur.creature && moteur.creature.jauge, figurine: c => ouvrirFigurine(c),
  etat: () => { const c = moteur && moteur.creature; return { angle: c && c.angle, lacet: moteur && lacetCamera(), gyro, gyroOK, trouve: c && c.trouve, consigne: $("consigne").textContent }; } };
