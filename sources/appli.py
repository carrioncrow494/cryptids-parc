"""Fabrique la version appli (dossier appli/) : la page installable sur le téléphone, avec 6 cryptides et deux codes.
   D'abord : python3 sources/assemble.py   puis : python3 sources/appli.py
   La page vit dans appli/ mais prend les images, vidéos et sons à la racine du site (<base href="../">) ;
   les images du jeu virtuel et la planche des indices viennent de la branche, comme pour test.html.
   Sur main, on ne pousse que le dossier appli/ (index.html et test.html ne bougent pas)."""
import hashlib, json, os, re, unicodedata
from PIL import Image, ImageDraw

# les codes des parents : à changer ici, puis relancer ce script (majuscules, accents et espaces ne comptent pas)
CODE_TOUS = "GRIMOIRE"      # ouvre les 6 autres cryptides
CODE_VIRTUEL = "LANTERNE"   # ouvre le jeu virtuel
VERSION = "1"               # à augmenter quand on republie, pour que le téléphone reprenne les fichiers neufs

P = os.path.dirname(os.path.abspath(__file__)) + "/"
R = P + "../"
D = R + "appli/"
BRANCHE = "https://raw.githubusercontent.com/carrioncrow494/cryptids-parc/choisir-aventure/"
FOND, THEME = "#04121a", "#0f4a57"

def norm(c):
    c = unicodedata.normalize("NFD", c)
    c = "".join(x for x in c if not unicodedata.combining(x)).upper()
    return re.sub(r"[^A-Z0-9]", "", c)
def empreinte(c): return hashlib.sha256(norm(c).encode()).hexdigest()

def remplacer(s, a, b):
    assert s.count(a) == 1, a
    return s.replace(a, b)

os.makedirs(D, exist_ok=True)
h = open(R + "index.html").read()
h = remplacer(h, "<title>Cryptids · Parc</title>", """<title>Cryptids</title>
<base href="../">
<link rel="manifest" href="appli/manifest.webmanifest">
<meta name="theme-color" content="%s">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Cryptids">
<meta name="mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="appli/icone-180.png">
<link rel="icon" href="appli/icone-192.png">
<script>
// Android : le navigateur propose l'installation ; on garde l'invitation pour le bouton « Installer l'appli »
addEventListener("beforeinstallprompt", e => { e.preventDefault(); window.__inviteInstall = e; dispatchEvent(new Event("invite-installation")); });
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("appli/sw.js", { scope: "appli/" }).catch(() => {}));
</script>""" % FOND)
h = remplacer(h, "const APPLI = false;", "const APPLI = true;")
h = remplacer(h, 'const CODES = { tous: "", virtuel: "" };', 'const CODES = { tous: "%s", virtuel: "%s" };' % (empreinte(CODE_TOUS), empreinte(CODE_VIRTUEL)))
h = remplacer(h, 'const IMG_JEU = "";', 'const IMG_JEU = "%s";' % BRANCHE)
h = remplacer(h, 'href="indices-cryptids.pdf" download="indices-cryptids.pdf"', 'href="%sindices-cryptids.pdf" target="_blank" rel="noopener"' % BRANCHE)
h = remplacer(h, 'href="qr-codes-cryptids.pdf" download="qr-codes-cryptids.pdf"', 'href="%sqr-codes-cryptids.pdf" target="_blank" rel="noopener"' % BRANCHE)
open(D + "index.html", "w").write(h)

json.dump({
    "name": "Cryptids · Le grimoire des créatures perdues",
    "short_name": "Cryptids",
    "description": "Retrouve les cryptides échappés du grimoire de Rune.",
    "lang": "fr",
    "id": "./",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": FOND,
    "theme_color": FOND,
    "icons": [
        {"src": "icone-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icone-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icone-masque-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}, open(D + "manifest.webmanifest", "w"), ensure_ascii=False, indent=2)

# l'icône : le sceau magique sur la nuit bleu-vert du jeu
def icone(n, marge):
    im = Image.new("RGBA", (n, n), FOND)
    d = ImageDraw.Draw(im)
    for i in range(n // 2, 0, -2):   # halo rond, comme le fond des écrans
        t = i / (n / 2)
        c = tuple(int(a * (1 - t) + b * t) for a, b in zip((42, 154, 166), (4, 18, 26)))
        d.ellipse((n / 2 - i, n / 2 - i, n / 2 + i, n / 2 + i), fill=c)
    s = Image.open(R + "sigil.webp").convert("RGBA")
    k = int(n * (1 - 2 * marge))
    s = s.resize((k, k), Image.LANCZOS)
    im.alpha_composite(s, ((n - k) // 2, (n - k) // 2))
    return im.convert("RGB")
icone(192, .06).save(D + "icone-192.png")
icone(512, .06).save(D + "icone-512.png")
icone(512, .16).save(D + "icone-masque-512.png")   # Android rogne en rond : le sceau reste dans la zone sûre
icone(180, .08).save(D + "icone-180.png")

open(D + "sw.js", "w").write("""// Cryptids (appli) : garde les fichiers déjà vus pour que l'appli s'ouvre vite et marche sans réseau
const CACHE = "cryptids-appli-%s";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icone-192.png"])).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(k => k.startsWith("cryptids-appli-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range") || !r.url.startsWith("http")) return;   // vidéos lues par morceaux : directement au réseau
  if (r.mode === "navigate") {   // la page : d'abord le réseau (pour avoir la dernière version), sinon celle gardée
    e.respondWith(fetch(r).then(rep => { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(r, copie)); return rep; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match("./"))));
    return;
  }
  // le reste : tout de suite depuis le cache s'il y est, et mis à jour en douce
  e.respondWith(caches.open(CACHE).then(c => c.match(r).then(gardee => {
    const reseau = fetch(r).then(rep => { if (rep.ok || rep.type === "opaque") c.put(r, rep.clone()); return rep; });
    if (gardee) { e.waitUntil(reseau.catch(() => {})); return gardee; }
    return reseau;
  })));
});
""" % VERSION)
print("appli/ prête :", sorted(os.listdir(D)))
