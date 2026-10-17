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
# Les cartes en cube (17/10) : un bloc peint par ChatGPT, avec ses faces de terre et ses montagnes au fond.
# On repère les trois coins visibles du dessus (gauche, avant, droite) et on redresse l'image pour que le losange du dessus
# ait exactement l'angle du jeu ; seul ce losange est découpé en cases.
CUBES = {'foret': dict(fichier='/mnt/project-files/cryptids-parc/jeu-video/lac-essais/map-lac.png',
                       largeur=1672, gauche=(35, 581), avant=(885, 938), droite=(1637, 622), N=54,
                       passages=[((900, 495), (1085, 555), 22)],            # le pont de pierre (segment et demi-largeur, en pixels de l'image d'origine)
                       reperes=dict(terre=(1330, 600), cromlech=(470, 330), statue=(640, 690), barque=(370, 620)))}   # la terre battue (chalet) et un pré dégagé
def couleurs_cube(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    eau = (b > r + 70) & (b > 120)
    gris = (np.abs(r - g) < 40) & (b > g - 5) & (np.maximum(np.maximum(r, g), b) < 175) & ~eau   # rochers et montagnes (gris-violet)
    return nd.binary_opening(eau, iterations=1), nd.binary_opening(gris, iterations=2)
def grille_cube(z):
    c = CUBES[z]; im = Image.open(c['fichier']).convert('RGB'); N = c['N']
    k = im.width / c.get('largeur', im.width); P_ = lambda p: (p[0] * k, p[1] * k)   # l'image a été agrandie : les points mesurés grandissent avec elle
    c = dict(c, gauche=P_(c['gauche']), avant=P_(c['avant']), droite=P_(c['droite']), passages=[(P_(a), P_(b), w * k) for a, b, w in c.get('passages', [])],
             reperes={n: P_(pt) for n, pt in c.get('reperes', {}).items()})
    (gx, gy), (ax, ay), (dx, dy) = c['gauche'], c['avant'], c['droite']
    hwD = (dx - gx) / 2; hhD = hwD * R_ISO; m = round(40 * k)
    # le losange voulu : gauche (m, Yc), avant (m + hwD, Yc + hhD), droite (m + 2 hwD, Yc) ; Yc laisse la place aux montagnes au-dessus
    src = np.array([[gx, gy, 1], [ax, ay, 1], [dx, dy, 1]], float)
    def vers(Yc): return np.array([[m, Yc], [m + hwD, Yc + hhD], [m + 2 * hwD, Yc]], float)
    A = np.linalg.solve(src, vers(0))            # source -> cible (sans décalage vertical)
    coins = np.array([[0, 0, 1], [im.width, 0, 1], [0, im.height, 1], [im.width, im.height, 1]], float) @ A
    Yc = -coins[:, 1].min() + 10; W = int(2 * hwD + 2 * m); H = int(coins[:, 1].max() + Yc + 10)
    A = np.linalg.solve(src, vers(Yc)); Ai = np.linalg.inv(np.vstack([A.T, [0, 0, 1]]))   # cible -> source, pour PIL
    im = im.transform((W, H), Image.AFFINE, tuple(Ai[:2].ravel()), Image.BICUBIC, fillcolor=(0, 255, 0))
    a = np.asarray(im).astype(np.float32); E, R = couleurs_cube(a)
    hw = hwD / N; hh = hw * R_ISO; X0, Y0 = m + hwD, Yc - hhD   # le coin du fond du losange
    G = [[' '] * N for _ in range(N)]
    for j in range(N):
        for i in range(N):
            x, y = X0 + (i - j) * hw, Y0 + (i + j + 1) * hh
            vus = [(int(x + ddx * hw * .6), int(y + ddy * hh * .6)) for ddx, ddy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))]
            fe = sum(E[Y, X] for X, Y in vus); fr = sum(R[Y, X] for X, Y in vus)
            G[j][i] = '~' if fe >= 3 else '#' if fr >= 3 else '.'
    def case(pt):   # un point de l'image d'origine -> (x, y) de la grille
        X, Y = np.array([pt[0], pt[1], 1.]) @ A; a_, b_ = (X - X0) / hw, (Y - Y0) / hh - 1
        return (a_ + b_) / 2, (b_ - a_) / 2
    for p0, p1, w in c.get('passages', []):
        (x0, y0), (x1, y1) = case(p0), case(p1); r = w / hw / 2 + .5
        for j in range(N):
            for i in range(N):
                t = max(0, min(1, ((i - x0) * (x1 - x0) + (j - y0) * (y1 - y0)) / ((x1 - x0) ** 2 + (y1 - y0) ** 2)))
                if np.hypot(i - (x0 + t * (x1 - x0)), j - (y0 + t * (y1 - y0))) < r: G[j][i] = '.'
    reperes = {k: tuple(int(round(v)) for v in case(pt)) for k, pt in c.get('reperes', {}).items()}
    for y in range(N):
        for x in range(N):
            if (x in (0, N - 1) or y in (0, N - 1)) and G[y][x] == '.': G[y][x] = 'x'
    return G, dict(image=z, W=W, H=H, i0=0, j0=0, X0=X0, Y0=Y0, hw=hw, hh=hh, reperes=reperes), im
def grille(z):
    if z in CUBES: return grille_cube(z)
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
    for z in (sys.argv[2:] or TERRAINS):
        G, P, im = grille(z); apercu(z, G, P, im, sys.argv[1] + '/grille-%s.png' % z)
        print(z, len(G[0]), 'x', len(G), sum(r.count('.') for r in G), 'cases de sol')
