# Lac Carcajou dans la coquille (20/10) : découpe les planches de Sam (fond vert #00FF00)
# en objets séparés (lac-objets/<nom>-<i>.webp, détourés) et rend les sols raccordables (lac-sols/<nom>.webp).
# python3 sources/decoupe-lac.py <dossier des planches> <dossier de sortie>
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/lac-objets", exist_ok=True); os.makedirs(f"{out}/lac-sols", exist_ok=True)

def detoure(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    vert = g - np.maximum(r, b)   # combien le pixel est « fond vert »
    alpha = np.clip((140 - vert) / 70, 0, 1)
    g2 = np.minimum(g, np.maximum(r, b) + 18)   # retire le reflet vert sur les bords
    a[..., 1] = np.where(vert > 20, g2, g)
    return np.dstack([a, alpha * 255]).astype(np.uint8)

def objets(nom, n=None, ordre='lignes'):
    rgba = detoure(Image.open(f"{src}/{nom}.png"))
    masque = rgba[..., 3] > 128
    masque = ndimage.binary_closing(masque, iterations=6)   # recolle les brins d'herbe et les gouttes
    lab, k = ndimage.label(masque)
    boites = ndimage.find_objects(lab)
    tailles = ndimage.sum(masque, lab, range(1, k + 1))
    garde = [i for i in np.argsort(-tailles) if tailles[i] > 3000][:n]
    boites = [boites[i] for i in garde]
    boites.sort(key=lambda s: (round(s[0].start / 300), s[1].start) if ordre == 'lignes' else (s[0].start, s[1].start))
    res = []
    for i, (sy, sx) in enumerate(boites):
        m = 6
        y0, y1, x0, x1 = max(sy.start - m, 0), sy.stop + m, max(sx.start - m, 0), sx.stop + m
        c = Image.fromarray(rgba[y0:y1, x0:x1])
        c.save(f"{out}/lac-objets/{nom[4:]}-{i + 1}.webp", quality=90)
        res.append({'f': f"{nom[4:]}-{i + 1}", 'w': c.width, 'h': c.height})
    return res

OBJ = {
    'obj-sapins1': 4, 'obj-sapins2': 4, 'obj-sapins3': 4, 'obj-bruyere': 4, 'obj-roseaux': 4,
    'obj-rochers': 4, 'obj-labradorite': 4, 'obj-geodes': 3, 'obj-pierres': 4,
    'obj-barrage': 1, 'obj-ruine': 1, 'obj-ponton': 1, 'obj-planche': 6,
}
liste = {n[4:]: objets(n, k, 'colonne' if n in ('obj-geodes', 'obj-pierres') else 'lignes') for n, k in OBJ.items()}
json.dump(liste, open(f"{out}/lac-objets/liste.json", 'w'), indent=1)
print({k: len(v) for k, v in liste.items()})

# sols : une seule image par terrain pour l'instant -> rendue seamless (même outil que sources/dalles.py)
sys.argv = ['dalles']; T = 1024
def seamless(a):
    b = np.roll(a, (T // 2, T // 2), (0, 1))
    d = np.minimum(np.arange(T), np.arange(T)[::-1]).astype(np.float32)
    r = np.clip(d / (T // 2), 0, 1)
    w = np.minimum.outer(r, r)[..., None] ** .5
    return a * w + b * (1 - w)
for f in sorted(os.listdir(src)):
    if f.startswith('sol-'):
        a = np.asarray(Image.open(f"{src}/{f}").convert('RGB').resize((T, T), Image.LANCZOS), dtype=np.float32)
        Image.fromarray(np.clip(seamless(a), 0, 255).astype(np.uint8)).save(f"{out}/lac-sols/{f[4:-4]}.webp", quality=88)
