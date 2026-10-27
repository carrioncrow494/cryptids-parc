// Fabrique indices-cryptids.pdf : la page des parents puis les 36 cartes indices à découper.
// Il faut les modules npm « qrcode » et « playwright » :  NODE_PATH=<dossier>/node_modules node sources/planche-indices.js
const fs = require("fs"), path = require("path"), QR = require("qrcode");
const { chromium } = require("playwright");
const ICI = __dirname, RACINE = path.join(ICI, "..");
const ADRESSE = "https://carrioncrow494.github.io/cryptids-parc/?indice=";
const APPLI = "https://carrioncrow494.github.io/cryptids-parc/test.html";   // l'appli à ouvrir sur le téléphone

// les indices et les noms viennent de l'appli elle-même
const src = fs.readFileSync(path.join(ICI, "indices.js"), "utf8").replace(/\/\/ carte d'indice scannée[\s\S]*$/, "");
const { INDICES } = new Function("location", "$", "partie", "majPartie", "sfx", src + ";return { INDICES };")({ href: ADRESSE }, () => ({}), () => null, () => {}, () => {});
const app = fs.readFileSync(path.join(ICI, "app.js"), "utf8");
const nom = k => new RegExp('"' + k + '":\\s*\\{ cle: "[^"]+", nom: "([^"]+)"').exec(app)[1];
const court = k => nom(k).split(",")[0];

const loupe = '<svg viewBox="0 0 40 40" class="loupe"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M24 24 L35 35" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><text x="16" y="21.5" text-anchor="middle" font-size="14" font-family="Creepster" fill="currentColor">?</text></svg>';

(async () => {
  let cartes = "";
  for (const k of Object.keys(INDICES)) for (let i = 1; i <= 3; i++) {
    const qr = await QR.toString(ADRESSE + k + "-" + i, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#04121a", light: "#ffffff" } });
    const lieu = i === 1 ? "où vous voulez, pour commencer" : INDICES[k][i - 2].lieu;
    cartes += `<div class="carte"><div class="haut"><span>Indice ${i}/3</span>${loupe}</div><div class="qr">${qr}</div>
      <div class="vise">Vise-moi avec l'œil magique !</div><div class="parent">Cryptide n° ${k} · ${court(k)} · à cacher ${lieu}</div></div>`;
  }
  const qrAppli = await QR.toString(APPLI, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#04121a", light: "#ffffff" } });
  const cell = ind => `<b>${ind.lieu}</b><br><span class="ex">Maison : ${ind.dedans}<br>Dehors : ${ind.dehors}</span>`;
  const lignes = Object.keys(INDICES).map(k => `<tr><td><b>n° ${k}</b> ${court(k)}</td><td>où vous voulez</td><td>${cell(INDICES[k][0])}</td><td>${cell(INDICES[k][1])}</td><td>${cell(INDICES[k][2])}</td></tr>`).join("");
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
    @font-face { font-family: Creepster; src: url("file://${RACINE}/police-creepster.woff2"); }
    @font-face { font-family: Fell; src: url("file://${RACINE}/police-fell.woff2"); }
    @page { size: A4; margin: 8mm; }
    body { margin: 0; font-family: Fell, Georgia, serif; color: #04121a; }
    h1 { font-family: Creepster; font-weight: 400; color: #0f4a57; text-align: center; font-size: 24pt; margin: 0 0 2mm; letter-spacing: .04em; }
    .tete { display: flex; gap: 4mm; align-items: flex-start; margin: 0 2mm 3mm; }
    .aide { flex: 1; font-size: 10pt; line-height: 1.32; margin: 0; }
    .appli { width: 40mm; flex: none; display: flex; flex-direction: column; align-items: center; text-align: center; gap: .6mm; padding: 2mm; border: 1.5px solid #0f4a57; border-radius: 3mm; background: #eafbfb; font-size: 7pt; line-height: 1.2; }
    .appli b { font-family: Creepster; font-weight: 400; font-size: 12pt; color: #0f4a57; letter-spacing: .04em; }
    .qr-appli { width: 24mm; height: 24mm; } .qr-appli svg { width: 100%; height: 100%; display: block; }
    .url { font-family: Georgia, serif; font-size: 7.4pt; color: #0f4a57; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 8.4pt; }
    th { background: #0f4a57; color: #fff; font-weight: 400; padding: 2mm; text-align: left; }
    td { border-bottom: 1px solid #b9d9dc; padding: 1mm 1.6mm; vertical-align: top; line-height: 1.15; }
    td b { color: #0f4a57; } .ex { color: #4b6b70; font-size: 7.6pt; }
    .grille { break-before: page; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 68.5mm; }
    .carte { border: 1px dashed #7aa; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3mm 3mm 2.5mm; break-inside: avoid;
      background: radial-gradient(ellipse at 50% 40%, #eafbfb 0%, #cdeff0 100%); }
    .haut { width: 100%; display: flex; align-items: center; justify-content: center; gap: 2mm; font-family: Creepster; font-size: 17pt; color: #0f4a57; letter-spacing: .05em; }
    .loupe { width: 8mm; height: 8mm; color: #0f4a57; }
    .qr { width: 38mm; height: 38mm; } .qr svg { width: 100%; height: 100%; display: block; border-radius: 2mm; }
    .vise { font-size: 10.5pt; color: #04121a; }
    .parent { font-size: 6.6pt; color: #4b6b70; text-align: center; line-height: 1.2; }
  </style></head><body>
  <h1>Cryptids · les cartes indices</h1>
  <div class="tete"><p class="aide">Pour chaque cryptide de l'aventure, cachez ses 3 cartes indices, puis sa carte (sur la planche des cryptides), aux endroits ci-dessous. Chaque endroit existe dans la maison comme dehors : vous pouvez tout cacher à l'intérieur, tout dehors, ou mélanger.
  Votre enfant vise chaque carte avec l'œil magique : l'indice s'affiche sur le téléphone, avec un dessin, et lui dit où chercher la carte suivante. Le 3ᵉ indice le mène au cryptide.
  L'appli vous rappelle aussi cette liste au début de chaque aventure, et chaque carte porte en petit son numéro et son endroit.</p><div class="appli"><div class="qr-appli">${qrAppli}</div><b>L'appli</b><span>Scannez ce QR code avec l'appareil photo, ou tapez :</span><span class="url">carrioncrow494.github.io/<br>cryptids-parc/test.html</span></div></div>
  <table><tr><th>Cryptide</th><th>Indice 1</th><th>Indice 2</th><th>Indice 3</th><th>Carte du cryptide</th></tr>${lignes}</table>
  <div class="grille">${cartes}</div></body></html>`;
  const fichier = path.join(ICI, "planche-indices.html");
  fs.writeFileSync(fichier, html);
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto("file://" + fichier); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(RACINE, "indices-cryptids.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await b.close(); fs.unlinkSync(fichier);
})();
