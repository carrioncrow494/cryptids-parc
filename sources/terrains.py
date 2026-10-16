# Les grandes cartes (16/10/2026) : chaque zone est une île peinte par Sam (son terrain entier sert de sol).
# Ce script lit chaque terrain, pose dessus une grille de cases (vue en losange comme dans le jeu) et devine pour chaque case :
#   ' ' hors de l'île   x bord de l'île (les cubes du pourtour : on ne marche pas dessus)   ~ eau   # rocher peint (désert)   . sol
# sources/monde.py s'en sert pour assembler le monde.
# python3 sources/terrains.py <dossier d'aperçus>   (les grilles devinées, dessinées sur chaque terrain)
import sys, json, numpy as np, scipy.ndimage as nd; sys.path.insert(0, 'sources')
from planches import detoure, U
from PIL import Image, ImageDraw
W_CASE = 48            # largeur d'une case dans le terrain (pixels) : taille A choisie par Sam
R_ISO = .543           # hauteur / largeur du losange d'une case sur les terrains (bords à ± 28,5°)
TERRAINS = {'village': 'a530268d', 'foret': 'f25b7b1b', 'cabane': '4c234ca7', 'desert': '41412678', 'lande': 'fa481f71', 'bayou': '2de40fb3'}
def eau(z, a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if z == 'bayou': return (b > r + 15) & (g > r + 15)
    return (b > r + 70) & (b > 120)
def rocher(z, a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if z == 'desert': return nd.binary_dilation(nd.binary_fill_holes(nd.binary_closing((g < 95) & (r - g > 90), iterations=4)), iterations=4)
    return np.zeros(a.shape[:2], bool)
def grille(z):
    im = Image.open(U + TERRAINS[z] + '-image.png').convert('RGB'); a = np.asarray(im).astype(np.float32); H, W = a.shape[:2]
    al = np.asarray(detoure(im))[..., 3] > 128
    E = eau('village' if z == 'cabane' else z, np.asarray(Image.open(U + TERRAINS['village' if z == 'cabane' else z] + '-image.png').convert('RGB')).astype(np.float32))   # l'eau du bois Biscornu, trop sombre, est prise sur le village (même dessin)
    E = nd.binary_opening(E, iterations=1); Rk = rocher(z, a)
    hw, hh = W_CASE / 2, W_CASE * R_ISO / 2
    n = int(W / W_CASE + H / (2 * hh)) + 2
    X0, Y0 = W / 2, 0
    def px(i, j): return X0 + (i - j) * hw, Y0 + (i + j + 1) * hh   # le centre de la case (i, j)
    cases = {}
    for i in range(-n, n):
        for j in range(-n, n):
            x, y = px(i, j)
            if not (0 <= x < W and 0 <= y < H): continue
            pts = [(x + dx * hw * .6, y + dy * hh * .6) for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))]
            vus = [(int(min(W - 1, max(0, X))), int(min(H - 1, max(0, Y)))) for X, Y in pts]
            dedans = sum(al[Y, X] for X, Y in vus)
            if dedans < 4: continue
            fe = sum(E[Y, X] for X, Y in vus); fr = sum(Rk[Y, X] for X, Y in vus)
            cases[(i, j)] = '~' if fe >= 3 else '#' if fr >= 3 else '.'
    i0 = min(i for i, j in cases); j0 = min(j for i, j in cases); i1 = max(i for i, j in cases); j1 = max(j for i, j in cases)
    G = [[cases.get((i, j), ' ') for i in range(i0, i1 + 1)] for j in range(j0, j1 + 1)]   # G[y][x] : x le long de i, y le long de j
    # le bord : les cases de sol qui touchent le vide
    for y in range(len(G)):
        for x in range(len(G[0])):
            if G[y][x] != ' ' and any(not (0 <= y + dy < len(G) and 0 <= x + dx < len(G[0])) or G[y + dy][x + dx] == ' ' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): G[y][x] = 'x'
    # la place de l'image dans le monde : le coin (0, 0) de la grille correspond à la case (i0, j0)
    return G, dict(image=TERRAINS[z], W=W, H=H, i0=i0, j0=j0, X0=X0, Y0=Y0, hw=hw, hh=hh), im
def apercu(z, G, P, im, chemin):
    im = im.copy().convert('RGBA'); d = ImageDraw.Draw(im, 'RGBA')
    C = {'x': (255, 0, 0, 90), '~': (0, 0, 255, 90), '#': (120, 0, 0, 120), '.': (255, 255, 255, 30)}
    for y, ligne in enumerate(G):
        for x, c in enumerate(ligne):
            if c == ' ' or c not in C: continue
            i, j = x + P['i0'], y + P['j0']; cx, cy = P['X0'] + (i - j) * P['hw'], P['Y0'] + (i + j + 1) * P['hh']
            d.polygon([(cx, cy - P['hh']), (cx + P['hw'], cy), (cx, cy + P['hh']), (cx - P['hw'], cy)], fill=C[c], outline=(0, 0, 0, 60))
    im.convert('RGB').save(chemin)
if __name__ == '__main__':
    for z in TERRAINS:
        G, P, im = grille(z); apercu(z, G, P, im, sys.argv[1] + '/grille-%s.png' % z)
        print(z, len(G[0]), 'x', len(G), sum(r.count('.') for r in G), 'cases de sol')
