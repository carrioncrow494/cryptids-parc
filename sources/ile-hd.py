# Les îles peintes en haute résolution (20/10, Sam : « le sol est flou ») : l'image du lac est réduite à 3980 px (l'iPhone refuse plus de 4096),
# et l'écran de l'iPhone (3 pixels par point) l'agrandit encore. On redresse donc l'image d'origine K fois plus grande, en carrés de T px
# (avec P px de bord en commun, pour ne pas voir les joints) ; le jeu ne charge que les carrés autour du héros (ilesHdJ dans jeu.js).
# python3 sources/ile-hd.py  -> jeu-hd/<zone>-<i>-<j>.webp et sources/ile-hd.js
import sys, os, json, numpy as np; sys.path.insert(0, 'sources')
from PIL import Image, ImageFilter
from terrains import grille_cube, CUBES
from planches import detoure
K, T, P = 2, 1024, 2
os.makedirs('jeu-hd', exist_ok=True)
INFO = {}
for z in CUBES:
    G, D, _ = grille_cube(z); src = Image.open(D['fichier']).convert('RGB')
    a, b, c, d, e, f = D['Ai']; W, H = int(D['W'] * K), int(D['H'] * K); nx, ny = -(-W // T), -(-H // T); l = []
    for j in range(ny):
        for i in range(nx):
            x0, y0 = i * T - P, j * T - P   # le coin du carré (bord compris), en pixels de l'image haute résolution
            co = (a / K, b / K, c + (a * x0 + b * y0) / K, d / K, e / K, f + (d * x0 + e * y0) / K)
            im = src.transform((T + 2 * P, T + 2 * P), Image.AFFINE, co, Image.BICUBIC, fillcolor=(0, 255, 0))
            im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))   # un peu plus net : la peinture de départ est douce
            im = detoure(im)
            if np.asarray(im)[..., 3].max() < 10: continue
            im.save('jeu-hd/%s-%d-%d.webp' % (z, i, j), quality=86, method=6); l.append([i, j])
    INFO[z] = dict(k=K, t=T, p=P, l=l)
    print(z, W, 'x', H, len(l), 'carrés')
open('sources/ile-hd.js', 'w').write('// fabriqué par sources/ile-hd.py : les carrés en haute résolution de chaque île peinte (jeu-hd/<zone>-<i>-<j>.webp)\nconst ILES_HD = ' + json.dumps(INFO, separators=(',', ':')) + ';\n')
