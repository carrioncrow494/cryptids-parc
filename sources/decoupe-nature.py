# La végétation de chaque zone (planches de lisière de Sam, 16/10) : 6 planches de 4 × 3, rangées dans jeu-nature.webp.
# Noms : <zone>_a1 … a8 (les 8 grands, lignes 1 et 2) et <zone>_p1 … p4 (les 4 petits, ligne 3). La place de chacun est écrite
# dans sources/nature-atlas.js (le 5e nombre, 1, dit que l'objet est dans jeu-nature.webp et pas dans jeu-decor.webp).
# python3 sources/decoupe-nature.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
from planches import *
PL = [('055283de-image.png', 'cabane'), ('dee84dfb-image.png', 'desert'), ('7b2b9308-image.png', 'lande'),
      ('d8c1dd00-image.png', 'bayou'), ('827249fe-image.png', 'foret'), ('cc4f60a9-image.png', 'village')]
objs = []
for f, z in PL:
    L = [x for row in cases(f, 3, 4) for x in row]
    for i, im in enumerate(L):
        n = '%s_%s%d' % (z, 'a' if i < 8 else 'p', i + 1 if i < 8 else i - 7)
        t = 300 if i < 8 else 200; k = t / max(im.size)
        objs.append((n, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
LW = 2048; objs.sort(key=lambda o: -o[1].size[1]); x = y = h = 0; place = {}
for n, im in objs:
    if x + im.size[0] > LW: x, y, h = 0, y + h + 6, 0
    place[n] = (x, y, im.size[0], im.size[1]); x += im.size[0] + 6; h = max(h, im.size[1])
LH = y + h
D = Image.new('RGBA', (LW, LH))
for n, im in objs: D.paste(im, place[n][:2])
D.save('jeu-nature.webp', quality=88, method=6); apercu(D, sys.argv[1] + '/nature.png', red=3)
with open('sources/nature-atlas.js', 'w') as o:
    o.write('// fabriqué par sources/decoupe-nature.py : la place de chaque plante dans jeu-nature.webp [x, y, largeur, hauteur, 1], en pixels\n')
    o.write('ATLAS_DECOR.taille2 = [%d, %d];\nObject.assign(ATLAS_DECOR, { ' % (LW, LH) + ', '.join('%s: [%d, %d, %d, %d, 1]' % ((n,) + place[n]) for n in sorted(place)) + ' });\n')
print(LW, LH, len(objs))
