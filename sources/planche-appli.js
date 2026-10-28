// Fabrique cartes-appli.pdf : les cartes à imprimer de la version appli (dossier appli/), en 4 pages.
//   pages 1-2 : les 6 cryptides de l'appli, leurs 3 cartes indices et le QR code pour ouvrir l'appli
//   pages 3-4 : les 6 autres, leurs 3 cartes indices et le code des parents qui les ouvre
// Une ligne par cryptide : indice 1, indice 2, indice 3, puis la carte du cryptide, tout dans sa couleur.
// Il faut les modules npm « qrcode » et « playwright » :  NODE_PATH=<dossier>/node_modules node sources/planche-appli.js
const fs = require("fs"), path = require("path"), QR = require("qrcode");
const { chromium } = require("playwright");
const ICI = __dirname, RACINE = path.join(ICI, "..");
const APPLI = "https://carrioncrow494.github.io/cryptids-parc/appli/";
const CODE_TOUS = /CODE_TOUS = "([^"]+)"/.exec(fs.readFileSync(path.join(ICI, "appli.py"), "utf8"))[1];

const src = fs.readFileSync(path.join(ICI, "indices.js"), "utf8").replace(/\/\/ carte d'indice scannée[\s\S]*$/, "");
const { INDICES } = new Function("location", "$", "partie", "majPartie", "sfx", src + ";return { INDICES };")({ href: APPLI }, () => ({}), () => null, () => {}, () => {});
const app = fs.readFileSync(path.join(ICI, "app.js"), "utf8");
const fiche = k => { const m = new RegExp('"' + k + '":\\s*\\{ cle: "([^"]+)", nom: "([^"]+)"').exec(app); return { cle: m[1], nom: m[2], court: m[2].split(",")[0] }; };
const CELEBRES = JSON.parse(/const CELEBRES = (\[[^\]]+\])/.exec(app)[1]);
const AUTRES = Object.keys(INDICES).filter(k => !CELEBRES.includes(k));
const COULEUR = require("./couleurs-cartes.json");
const svgQR = (texte, c) => QR.toString(texte, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: c, light: "#ffffff" } });
const loupe = '<svg viewBox="0 0 40 40" class="loupe"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M24 24 L35 35" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>';

async function ligne(k) {   // les 4 cartes d'un cryptide
  const f = fiche(k), c = COULEUR[k];
  let h = "";
  for (let i = 1; i <= 3; i++) {
    const lieu = i === 1 ? "où vous voulez, pour commencer" : INDICES[k][i - 2].lieu;
    h += `<div class="carte" style="--c: ${c}"><div class="haut"><span>Indice ${i}/3</span>${loupe}</div><div class="qr">${await svgQR(APPLI + "?indice=" + k + "-" + i, c)}</div>
      <div class="vise">Vise-moi avec l'œil magique !</div><div class="parent">${f.court} · à cacher ${lieu}</div></div>`;
  }
  const ombre = "data:image/png;base64," + fs.readFileSync(path.join(RACINE, "ombre-" + f.cle + ".png")).toString("base64");
  h += `<div class="carte cryptide" style="--c: ${c}"><div class="haut"><span>Cryptide</span></div><div class="qr">${await svgQR(APPLI + "?m=" + k, c)}</div>
    <img class="ombre" alt="" src="${ombre}"><div class="parent">${f.nom} · à cacher ${INDICES[k][2].lieu}</div></div>`;
  return h;
}

(async () => {
  const qrAppli = await svgQR(APPLI, "#04121a");
  const tete1 = `<div class="tete"><div class="qr-appli">${qrAppli}</div><div class="texte"><h1>Cryptids · l'appli</h1>
    <p><b>1.</b> Scannez ce QR code avec l'appareil photo du téléphone, ou tapez <span class="url">${APPLI.replace("https://", "")}</span></p>
    <p><b>2.</b> Installez l'appli : sur Android, bouton « Installer l'appli » ; sur iPhone, dans Safari, Partager puis « Sur l'écran d'accueil ».</p>
    <p><b>3.</b> Découpez les cartes. Pour chaque cryptide, cachez ses 3 indices puis sa carte aux endroits notés en bas de chaque carte (maison ou dehors).</p></div></div>`;
  const tete2 = t => `<div class="tete mince"><h1>${t}</h1></div>`;
  const tete3 = `<div class="tete"><div class="code"><span>Code</span><b>${CODE_TOUS}</b></div><div class="texte"><h1>Cryptids · les 6 autres cryptides</h1>
    <p>Ces 6 cryptides sont enfermés dans le grimoire. Pour les ouvrir : dans l'appli, touchez <b>Choisir son aventure</b>, puis entrez le code dans <b>Codes des parents</b>.</p>
    <p>Majuscules, accents et espaces ne comptent pas. Ensuite, cachez les cartes comme les premières.</p></div></div>`;
  const pages = [];
  const page = async (tete, liste) => pages.push(`<section class="page">${tete}<div class="grille">${(await Promise.all(liste.map(ligne))).join("")}</div></section>`);
  await page(tete1, CELEBRES.slice(0, 3));
  await page(tete2("Cryptids · les 6 cryptides de l'appli (suite)"), CELEBRES.slice(3));
  await page(tete3, AUTRES.slice(0, 3));
  await page(tete2("Cryptids · les 6 autres cryptides (suite)"), AUTRES.slice(3));
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
    @font-face { font-family: Creepster; src: url("file://${RACINE}/police-creepster.woff2"); }
    @font-face { font-family: Fell; src: url("file://${RACINE}/police-fell.woff2"); }
    @page { size: A4; margin: 7mm; }
    body { margin: 0; font-family: Fell, Georgia, serif; color: #04121a; }
    .page { height: 282mm; display: flex; flex-direction: column; gap: 2.5mm; break-after: page; overflow: hidden; }
    .page:last-child { break-after: auto; }
    .tete { height: 34mm; flex: none; display: flex; gap: 4mm; align-items: center; padding: 2mm 3mm; border: 1.5px solid #0f4a57; border-radius: 3mm; background: #eafbfb; }
    .tete.mince { height: 10mm; justify-content: center; background: none; border: 0; padding: 0; }
    h1 { font-family: Creepster; font-weight: 400; color: #0f4a57; font-size: 17pt; margin: 0 0 1mm; letter-spacing: .04em; }
    .texte p { margin: 0 0 .8mm; font-size: 8.8pt; line-height: 1.22; }
    .url { font-family: Georgia, serif; font-weight: 600; color: #0f4a57; }
    .qr-appli { width: 30mm; height: 30mm; flex: none; } .qr-appli svg { width: 100%; height: 100%; display: block; }
    .code { flex: none; width: 44mm; display: flex; flex-direction: column; align-items: center; padding: 2mm; border: 1mm dashed #0f4a57; border-radius: 3mm; background: #fff; }
    .code span { font-size: 9pt; color: #4b6b70; } .code b { font-family: Georgia, serif; font-size: 17pt; letter-spacing: .08em; color: #0f4a57; }
    .grille { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, 1fr); }
    .carte { border: 1px dashed #9ab; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3mm 2.5mm 2.5mm; overflow: hidden;
      background: radial-gradient(ellipse at 50% 40%, #fff 0%, color-mix(in srgb, var(--c) 22%, white) 100%); box-shadow: inset 0 0 0 1.4mm color-mix(in srgb, var(--c) 70%, white); }
    .haut { display: flex; align-items: center; gap: 1.5mm; font-family: Creepster; font-size: 15pt; color: var(--c); letter-spacing: .05em; }
    .loupe { width: 6.5mm; height: 6.5mm; color: var(--c); }
    .qr { width: 36mm; height: 36mm; } .qr svg { width: 100%; height: 100%; display: block; border-radius: 2mm; outline: .6mm solid var(--c); }
    .cryptide .qr { width: 32mm; height: 32mm; }
    .ombre { width: 17mm; height: 17mm; object-fit: contain; }
    .vise { font-size: 9.5pt; text-align: center; }
    .parent { font-size: 6.6pt; color: #4b6b70; text-align: center; line-height: 1.2; }
  </style></head><body>${pages.join("")}</body></html>`;
  const fichier = path.join(ICI, "planche-appli.html");
  fs.writeFileSync(fichier, html);
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
  await p.pdf({ path: path.join(RACINE, "cartes-appli.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await b.close(); fs.unlinkSync(fichier);
})();
