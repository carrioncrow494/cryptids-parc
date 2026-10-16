# Le décor flat : les tuiles de sol (déroulées en carrés, pour les poser sur la grille) et tous les objets, rangés dans 2 grandes images.
#   jeu-sol.webp    : 12 tuiles de 256×256 (4×3), le dessus de chaque tuile vu d'en haut
#   jeu-decor.webp  : les objets (arbres, maisons, cachettes…) ; leur place dans l'image est écrite dans sources/decor-atlas.js
# python3 sources/decoupe-decor.py <dossier d'aperçus>
import sys, json; sys.path.insert(0, 'sources')
from planches import *
RATIO = .675   # sur les tuiles dessinées, le losange du dessus est 0,675 fois moins haut que large (la caméra du jeu est réglée pareil)
T = 256
tu = cases('36b451b9-Planche_de_tuiles_isom_triques_color_es.png', 3, 4)
NOMS_SOL = ['vertdeau', 'mousse', 'sarcelle', 'bayou', 'feuilles', 'sable', 'neige', 'chemin', 'paves', 'eau', 'marais', 'planches']
S = Image.new('RGBA', (T * 4, T * 3))
for i, c in enumerate([c for r in tu for c in r]):
    a = np.asarray(c)[..., 3] > 128; yv = int(np.argmax(a.sum(1))); xs = np.nonzero(a[yv])[0]; x0, x1 = xs.min(), xs.max()
    w = x1 - x0; cx = (x0 + x1) / 2; top = np.array([cx, yv - w / 2 * RATIO]); R_ = np.array([x1, yv]) - top; L_ = np.array([x0, yv]) - top
    # chaque point (u, v) du carré va chercher sa couleur dans le losange (u le long de x, v le long de z du monde)
    m = .045; u = np.linspace(m, 1 - m, T); U_, V_ = np.meshgrid(u, u)
    px = top[0] + U_ * R_[0] + V_ * L_[0]; py = top[1] + U_ * R_[1] + V_ * L_[1]
    src = np.asarray(c.convert('RGBA')).astype(np.float32)
    from scipy.ndimage import map_coordinates
    out = np.dstack([map_coordinates(src[..., k], [py, px], order=1) for k in range(4)]); out[..., 3] = 255
    S.paste(Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA'), ((i % 4) * T, (i // 4) * T))
S.convert('RGB').save('jeu-sol.webp', quality=88, method=6); S.convert('RGB').save(sys.argv[1] + '/sol.png')
# les objets : (planche, lignes, colonnes, noms)
PL = [('427b4bfe-Planche_d_ic_nes_nature_fantastique.png', 3, 4, 'sapin sapinneige bouleau automne mort fleuri rocher rune bruyere champignons montagne tronc'),
      ('5dae287c-Collection_isom_trique_d_objets_fantastiques___.png', 3, 4, 'cypres roseaux nenuphar cactus petitcactus falaise tombe croix grille citrouille lampadaire souche'),
      ('da4ed613-Planche_d_ic_nes_isom_triques_champ_tres.png', 3, 4, 'arche panneau barriere banc puits tonneau caisse boite epouvantail lanterne panier fontaine'),
      ('3777806c-Planche_isom_trique_de_b_timents_fantastiques.png', 2, 2, 'cathedrale cabane saloon pont'),
      ('31a49f56-Quatre_cottages_fantastiques_color_s.png', 2, 2, 'maison1 maison2 maison3 maison4'),
      ('cb93c362-Planche_de_cachettes_v_g_tales_color_es.png', 2, 4, 'cach_foret cach_lande cach_neige cach_village cach_desert cach_bayou cach_cabane cach_feuilles')]
GRAND = {'cathedrale': 640, 'cabane': 560, 'saloon': 512, 'pont': 512, 'maison1': 400, 'maison2': 400, 'maison3': 400, 'maison4': 400, 'montagne': 360}
objs = []
for f, r, c, noms in PL:
    L = cases(f, r, c)
    for n, im in zip(noms.split(), [x for row in L for x in row]):
        t = GRAND.get(n, 256); k = t / max(im.size); objs.append((n, im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)))
# rangement en étagères, les plus hauts d'abord
LW = 2048; objs.sort(key=lambda o: -o[1].size[1]); x = y = h = 0; place = {}
for n, im in objs:
    if x + im.size[0] > LW: x, y, h = 0, y + h + 6, 0
    place[n] = (x, y, im.size[0], im.size[1]); x += im.size[0] + 6; h = max(h, im.size[1])
LH = y + h
D = Image.new('RGBA', (LW, LH))
for n, im in objs: D.paste(im, place[n][:2])
D.save('jeu-decor.webp', quality=88, method=6); apercu(D, sys.argv[1] + '/decor.png', red=3)
with open('sources/decor-atlas.js', 'w') as o:
    o.write('// fabriqué par sources/decoupe-decor.py : la place de chaque objet dans jeu-decor.webp [x, y, largeur, hauteur], en pixels\n')
    o.write('const ATLAS_DECOR = { taille: [%d, %d], ' % (LW, LH) + ', '.join('%s: [%d, %d, %d, %d]' % ((n,) + place[n]) for n in sorted(place)) + ' };\n')
print(LW, LH)
