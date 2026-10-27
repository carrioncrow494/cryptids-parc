// Fabrique qr-codes-cryptids.pdf : les 12 cartes des cryptides, chacune dans la couleur de ses cartes indices.
// L'adresse des QR codes ne change pas (?m=1 … ?m=12), les cartes déjà imprimées restent valables.
// Il faut les modules npm « qrcode » et « playwright » :  NODE_PATH=<dossier>/node_modules node sources/planche-cryptides.js
const fs = require("fs"), path = require("path"), QR = require("qrcode");
const { chromium } = require("playwright");
const ICI = __dirname, RACINE = path.join(ICI, "..");
const ADRESSE = "https://carrioncrow494.github.io/chasse-monstres/?m=";   // adresse d'origine des cartes : l'œil magique ne lit que le numéro
const COULEUR = require("./couleurs-cartes.json");
const app = fs.readFileSync(path.join(ICI, "app.js"), "utf8");
const fiche = k => { const m = new RegExp('"' + k + '":\\s*\\{ cle: "([^"]+)", nom: "([^"]+)"').exec(app); return { cle: m[1], nom: m[2] }; };

(async () => {
  let cartes = "";
  for (let n = 1; n <= 12; n++) {
    const k = String(n), f = fiche(k);
    const qr = await QR.toString(ADRESSE + k, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: COULEUR[k], light: "#ffffff" } });
    const ombre = "data:image/png;base64," + fs.readFileSync(path.join(RACINE, "ombre-" + f.cle + ".png")).toString("base64");   // en data: recolorée dans la page avant l'impression
    cartes += `<div class="carte" style="--c: ${COULEUR[k]}"><div class="titre">Cryptide n° ${k}</div>
      <div class="milieu"><div class="qr">${qr}</div><img class="ombre" alt="" src="${ombre}"></div>
      <div class="vise">Vise-moi avec l'œil magique !</div><div class="parent">Pour les parents : ${f.nom}</div></div>`;
  }
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
    @font-face { font-family: Creepster; src: url("file://${RACINE}/police-creepster.woff2"); }
    @font-face { font-family: Fell; src: url("file://${RACINE}/police-fell.woff2"); }
    @page { size: A4; margin: 8mm; }
    body { margin: 0; font-family: Fell, Georgia, serif; color: #04121a; }
    h1 { font-family: Creepster; font-weight: 400; color: #0f4a57; text-align: center; font-size: 15pt; margin: 0 0 2mm; letter-spacing: .05em; }
    .grille { display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: 84mm; gap: 3mm; }
    .carte { display: flex; flex-direction: column; justify-content: space-between; padding: 4mm 5mm; border-radius: 4mm; break-inside: avoid;
      border: 1mm solid var(--c); background: radial-gradient(ellipse at 50% 45%, #fff 0%, color-mix(in srgb, var(--c) 20%, white) 100%); }
    .titre { font-family: Creepster; font-size: 20pt; color: var(--c); text-align: center; letter-spacing: .05em; }
    .milieu { display: flex; align-items: center; justify-content: space-around; }
    .qr { width: 42mm; height: 42mm; } .qr svg { width: 100%; height: 100%; display: block; border-radius: 2mm; }
    .ombre { width: 30mm; height: 30mm; object-fit: contain; }
    .vise { font-size: 11pt; } .parent { font-size: 8pt; color: #4b6b70; }
  </style></head><body>
  @@PAGES@@</body></html>`;
  const blocs = cartes.split(/(?=<div class="carte")/).filter(Boolean);
  const page = (i) => `<h1${i ? ' style="break-before: page"' : ""}>Cryptids · QR codes à cacher (page ${i + 1}/2)</h1><div class="grille">${blocs.slice(i * 6, i * 6 + 6).join("")}</div>`;
  const doc = html.replace("@@PAGES@@", page(0) + page(1));   // deux pages de 6 cartes
  const fichier = path.join(ICI, "planche-cryptides.html");
  fs.writeFileSync(fichier, doc);
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto("file://" + fichier); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(async () => {   // chaque silhouette prend la couleur de sa carte
    for (const im of document.querySelectorAll(".ombre")) {
      await im.decode(); const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext("2d"); g.drawImage(im, 0, 0); g.globalCompositeOperation = "source-in";
      g.fillStyle = getComputedStyle(im.closest(".carte")).getPropertyValue("--c").trim(); g.fillRect(0, 0, c.width, c.height);
      im.src = c.toDataURL(); await im.decode();
    }
  });
  await p.pdf({ path: path.join(RACINE, "qr-codes-cryptids.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await b.close(); fs.unlinkSync(fichier);
})();
