# Les habitants (planches de Sam, 18/10), le Bonnie Ranch et les 4 boutiques (Chupa la sopa, Ninamoto, Chez Bergamotte, Excalibook), rangés dans jeu-habitants.webp ; leur place dans sources/habitants-atlas.js
# (le 5e nombre, 2, dit que l'objet est dans jeu-habitants.webp). Pour chaque habitant : hab_<nom>_0 (debout, de trois quarts face) et hab_<nom>_1 (il parle :
# la main levée pour les adultes, de face pour les enfants, qui n'ont pas de planche « parole »).
# python3 sources/decoupe-habitants.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
import planches
from planches import *
planches.U = ''
H = '/mnt/project-files/cryptids-parc/jeu-video/habitants/'
ADULTES = ['gaelle', 'sam', 'max', 'simon', 'vivien', 'linda']; ENFANTS = ['siobhan', 'finn', 'nina']
objs = []
def serre(im):   # recadré au plus près du dessin
    b = im.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox(); return im.crop(b)
for n in ADULTES + ENFANTS:
    L = cases(H + n + '-poses.png', 2, 4)
    for i, im in enumerate([L[0][0], L[1][0] if n in ADULTES else L[0][1]]):
        im = serre(im); k = 300 / im.size[1]; objs.append(('hab_%s_%d' % (n, i), im.resize((round(im.size[0] * k), 300), Image.LANCZOS)))
for nom, im in zip(['ranch_maison', 'ranch_portail', 'ranch_grange', 'ranch_corral'], [x for row in cases(H + 'bonnie-ranch.png', 2, 2) for x in row]):
    im = serre(im); k = 520 / max(im.size); objs.append((nom, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
for nom, im in zip(['chupa', 'ninamoto', 'bergamotte', 'excalibook'], [x for row in cases(H + 'boutiques.png', 2, 2) for x in row]):   # les 4 boutiques (18/10)
    im = serre(im); k = 440 / max(im.size); objs.append((nom, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
LW = 2048; objs.sort(key=lambda o: -o[1].size[1]); x = y = h = 0; place = {}
for n, im in objs:
    if x + im.size[0] > LW: x, y, h = 0, y + h + 6, 0
    place[n] = (x, y, im.size[0], im.size[1]); x += im.size[0] + 6; h = max(h, im.size[1])
LH = y + h
D = Image.new('RGBA', (LW, LH))
for n, im in objs: D.paste(im, place[n][:2])
D.save('jeu-habitants.webp', quality=88, method=6); apercu(D, sys.argv[1] + '/habitants.png', red=2)
with open('sources/habitants-atlas.js', 'w') as o:
    o.write('// fabriqué par sources/decoupe-habitants.py : la place de chaque habitant et du ranch dans jeu-habitants.webp [x, y, largeur, hauteur, 2], en pixels\n')
    o.write('ATLAS_DECOR.taille3 = [%d, %d];\nObject.assign(ATLAS_DECOR, { ' % (LW, LH) + ', '.join('%s: [%d, %d, %d, %d, 2]' % ((n,) + place[n]) for n in sorted(place)) + ' });\n')
print(LW, LH, len(objs))
