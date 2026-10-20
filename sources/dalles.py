# Dalles de sol (20/10) : rend une série de variantes d'un même terrain raccordables entre elles.
# 1. chaque image est recadrée au carré et mise à T px ;
# 2. la première devient seamless (décalage d'une demi-dalle + fondu en croix sur la couture) ;
# 3. chaque variante prend la moyenne et le contraste de couleur de la première (sinon on voit un cadre) ;
# 4. toutes les variantes reprennent sa bande de bord (B px, fondue), donc n'importe quelle dalle
#    peut toucher n'importe quelle autre, dans tous les sens.
# python3 sources/dalles.py sortie/herbe img1.png img2.png ...  ->  sortie/herbe-1.webp ...
# DALLE=2048 pour les grandes dalles (une dalle = 2 × 2 cases, 20/10)
import os, sys
import numpy as np
from PIL import Image
T = int(os.environ.get('DALLE', 1024)); B = T * 3 // 32

def carre(p):
    im = Image.open(p).convert('RGB'); c = min(im.size)
    x, y = (im.width - c) // 2, (im.height - c) // 2
    return np.asarray(im.crop((x, y, x + c, y + c)).resize((T, T), Image.LANCZOS), dtype=np.float32)

def rampe(n):   # 0 au bord, 1 à n px du bord
    d = np.minimum(np.arange(T), np.arange(T)[::-1]).astype(np.float32)
    return np.clip(d / n, 0, 1)

def seamless(a):
    b = np.roll(a, (T // 2, T // 2), (0, 1))   # les coutures passent au milieu
    r = rampe(T // 2)
    w = np.minimum.outer(r, r)[..., None] ** .5   # a pèse au centre, b (sans couture au milieu) aux bords
    return a * w + b * (1 - w)

def couleurs(a, ref):
    m, e, mr, er = a.mean((0, 1)), a.std((0, 1)), ref.mean((0, 1)), ref.std((0, 1))
    return (a - m) / (e + 1e-3) * er + mr

def bord_commun(a, ref):
    r = rampe(B)
    w = np.minimum.outer(r, r)[..., None]
    w = w * w * (3 - 2 * w)   # fondu doux
    return a * w + ref * (1 - w)

sortie, imgs = sys.argv[1], [carre(p) for p in sys.argv[2:]]
ref = seamless(imgs[0])
for i, a in enumerate(imgs):
    d = ref if i == 0 else bord_commun(seamless(couleurs(a, imgs[0])), ref)
    Image.fromarray(np.clip(d, 0, 255).astype(np.uint8)).save(f"{sortie}-{i + 1}.webp", quality=90)
print(len(imgs), "dalles", T, "px")
