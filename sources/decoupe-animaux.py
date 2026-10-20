# Les animaux de Sam (7 planches de poses d'attente, 18/10) : une ligne = un animal, 4 images qui bouclent (repos, inspire, geste, retour).
# ChatGPT a retourné certaines images : chacune est remise dans le sens de la 1re image de sa ligne (on garde le sens, miroir ou non, qui lui ressemble le plus).
# Les petits traits de mouvement blancs, détachés du dessin, sont enlevés. Rangés dans jeu-animaux.webp ; leur place dans sources/animaux-atlas.js (5e nombre : 3).
# python3 sources/decoupe-animaux.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
import planches
from planches import *
planches.U = ''
A = '/mnt/project-files/cryptids-parc/jeu-video/animaux/'
PL = [('a1-moutons-chevre-cheval.png', 4, ['mouton_blanc', 'mouton_noir', 'chevre', 'cheval']),
      ('a2-vaches-cerfs.png', 4, ['vache', 'vache_ecossaise', 'cerf', 'biche']),
      ('a3-foret.png', 4, ['loup', 'ours', 'renard', 'ecureuil']),
      ('a4-eau-petits.png', 4, ['loutre', 'castor', 'lezard', 'truite']),
      ('a5-oiseaux.png', 3, ['corbeau', 'rouge_gorge', 'mesange']),
      ('a6-bayou-desert.png', 4, ['raton', 'opossum', 'coyote', 'alligator']),
      ('a7-serpent-grenouille.png', 2, ['serpent', 'grenouille'])]
HAUT = 170
FORCE = {('biche', 1): False, ('biche', 3): True, ('mouton_noir', 2): True}   # là où la ressemblance se trompe (une tête baissée vers l'herbe) : vérifié à l'œil   # hauteur de chaque image dans l'atlas
def nettoie(im):   # on garde le dessin : les grosses taches ; les petits traits (souvent blancs) partent
    a = np.array(im); m = a[..., 3] > 40; lab, n = nd.label(m); 
    if n == 0: return im
    t = nd.sum(m, lab, range(1, n + 1)); g = t.max(); garde = np.zeros_like(m)
    for i in range(n):
        k = lab == i + 1
        if t[i] >= .12 * g: garde |= k; continue
        if t[i] >= .02 * g and a[..., :3][k].mean() < 200: garde |= k   # un petit bout coloré (une herbe, une langue) reste
    garde = nd.binary_dilation(garde, iterations=2) & (a[..., 3] > 0); a[..., 3] = a[..., 3] * garde
    b = Image.fromarray(a, 'RGBA'); return b.crop(b.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox())
def masque(im, w=64, h=64): return np.array(im.getchannel('A').resize((w, h), Image.BILINEAR)) > 100
def ressemble(a, b): x, y = masque(a), masque(b); return (x & y).sum() / max(1, (x | y).sum())
objs = []
for f, rows, noms in PL:
    L = cases(A + f, rows, 4)
    for nom, ligne in zip(noms, L):
        ims = [nettoie(im) for im in ligne]; ref = ims[0]; sens = []
        for k, im in enumerate(ims):
            m = im.transpose(Image.FLIP_LEFT_RIGHT)
            if FORCE.get((nom, k), k and ressemble(m, ref) > ressemble(im, ref) + .02): ims[k] = m; sens.append('m')
            else: sens.append('.')
        print(nom, ''.join(sens))
        k = HAUT / max(im.size[1] for im in ims)
        for i, im in enumerate(ims): objs.append(('ani_%s_%d' % (nom, i), im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.LANCZOS)))
LW = 2048; objs.sort(key=lambda o: -o[1].size[1]); x = y = h = 0; place = {}
for n, im in objs:
    if x + im.size[0] > LW: x, y, h = 0, y + h + 4, 0
    place[n] = (x, y, im.size[0], im.size[1]); x += im.size[0] + 4; h = max(h, im.size[1])
LH = y + h
D = Image.new('RGBA', (LW, LH))
for n, im in objs: D.paste(im, place[n][:2])
D.save('jeu-animaux.webp', quality=88, method=6); apercu(D, sys.argv[1] + '/animaux.png', red=2)
with open('sources/animaux-atlas.js', 'w') as o:
    o.write('// fabriqué par sources/decoupe-animaux.py : la place de chaque image d\'animal dans jeu-animaux.webp [x, y, largeur, hauteur, 3], en pixels\n')
    o.write('ATLAS_DECOR.taille4 = [%d, %d];\nObject.assign(ATLAS_DECOR, { ' % (LW, LH) + ', '.join('%s: [%d, %d, %d, %d, 3]' % ((n,) + place[n]) for n in sorted(place)) + ' });\n')
print(LW, LH, len(objs))
