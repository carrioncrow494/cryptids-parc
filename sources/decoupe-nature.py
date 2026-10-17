# La végétation de chaque zone (planches de lisière de Sam, 16/10) : 6 planches de 4 × 3, rangées dans jeu-nature.webp.
# Noms : <zone>_a1 … a8 (les 8 grands, lignes 1 et 2) et <zone>_p1 … p4 (les 4 petits, ligne 3). La place de chacun est écrite
# dans sources/nature-atlas.js (le 5e nombre, 1, dit que l'objet est dans jeu-nature.webp et pas dans jeu-decor.webp).
# Plus les bâtiments, monuments et objets du lac (planches L1 et L3 du 17/10) : chalet, atelier, kelpie, menhirs, lac_*.
# python3 sources/decoupe-nature.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
from planches import *
PL = [('055283de-image.png', 'cabane'), ('dee84dfb-image.png', 'desert'), ('7b2b9308-image.png', 'lande'),
      ('d8c1dd00-image.png', 'bayou'), ('8bad5e73-image.png', 'foret'), ('cc4f60a9-image.png', 'village')]
objs = []
for f, z in PL:
    L = [x for row in cases(f, 3, 4) for x in row]
    for i, im in enumerate(L):
        n = '%s_%s%d' % (z, 'a' if i < 8 else 'p', i + 1 if i < 8 else i - 7)
        t = 300 if i < 8 else 200; k = t / max(im.size)
        objs.append((n, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
# le lac (17/10) : la planche L1 (bâtiments et monuments, 2 × 2) et la planche L3 (objets, 2 × 4) de Sam ; la L2 remplace la végétation de la forêt
for f, r, c, noms, t in [('fc8e604c-image.png', 2, 2, ['chalet', 'atelier', None, None], 560),
                         ('4bbbb8dd-image.png', 2, 4, ['lac_rocher', 'lac_souche', 'lac_panneau', 'lac_lanterne', 'lac_banc', 'lac_barque', 'lac_buches', 'lac_cairn'], 256),
                         ('88af266c-image.png', 1, 4, ['bateau_haut', 'bateau_gauche', 'bateau_bas', 'bateau_droite'], 400)]:   # planche L4 : la proue vers chaque direction du jeu
    for n, im in zip(noms, [x for row in cases(f, r, c) for x in row]):
        if n is None: continue
        k = t / max(im.size); objs.append((n, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
# la planche L1 bis de Sam (17/10) : deux kelpies (ligne 1, en 2 cases) et trois pierres levées gravées (ligne 2, en 3 cases)
L1b = 'f25782d4-image.png'
def fondre_eau(im):   # le bassin turquoise peint au pied du kelpie prend le bleu du lac de Sam, et son bord s'efface dans l'eau (17/10)
    import numpy as np; from scipy.ndimage import distance_transform_edt
    a = np.array(im.convert('RGBA')).astype(float); h = a.shape[0]; r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    eau = (al > 0) & (b > r + 50) & (b >= g - 15); eau[:int(.66 * h)] = False
    for c, f in enumerate((.4, .91, 1.26)): a[..., c] = np.where(eau, np.clip(a[..., c] * f, 0, 255), a[..., c])
    bord = np.clip(distance_transform_edt(al > 0) / 14, 0, 1)   # 14 px de fondu vers l'extérieur
    a[..., 3] = np.where(eau, al * bord, al)
    return Image.fromarray(a.round().astype('uint8'), 'RGBA')
for n, im in zip(['kelpie_g', 'kelpie_d'], cases(L1b, 2, 2)[0]): k = 560 / max(im.size); objs.append((n, fondre_eau(im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS))))
def pierres(path, boite):
    """les pierres levées d'une rangée, une par tache (la grille fixe coupait des bouts des voisines, 17/10) ;
    deux pierres qui se touchent par leurs cailloux sont séparées là où la tache est la plus mince"""
    im = detoure(Image.open(U + path)).crop(boite); A = np.array(im); m = A[..., 3] > 30
    lab, n = nd.label(nd.binary_dilation(m, iterations=2)); t = nd.sum(m, lab, range(1, n + 1)); res = []
    for i in range(n):
        if t[i] < 3000: continue
        k = (lab == i + 1) & m; ys, xs = np.nonzero(k); x0, x1 = xs.min(), xs.max(); morceaux = [k]
        if x1 - x0 > .96 * (ys.max() - ys.min()):   # plus large qu'une pierre : deux pierres
            col = k[:, x0:x1 + 1].sum(0); a, b = int(.3 * len(col)), int(.7 * len(col)); c = x0 + a + int(np.argmin(col[a:b]))
            g = k.copy(); g[:, c:] = False; d = k.copy(); d[:, :c] = False; morceaux = [g, d]
        for kk in morceaux:
            ys, xs = np.nonzero(kk); B = A.copy(); B[..., 3] = B[..., 3] * kk
            res.append((xs.min(), Image.fromarray(B, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))))
    return [im for _, im in sorted(res, key=lambda r: r[0])]
# 6 pierres : les 3 gravées de la L1 bis et les 3 de la case en bas à droite de la L1 ; jeu.js les dessine à la hauteur de leur image (HAUT_MENHIR)
for i, im in enumerate(pierres(L1b, (0, 660, 1255, 1255)) + pierres('fc8e604c-image.png', (640, 680, 1255, 1255))):
    k = 300 / 519; objs.append(('menhir%d' % (i + 1), im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
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
