# Le monde du jeu (16/10/2026) : 6 îles, une par zone, chacune peinte par Sam, reliées par des ponts de planches.
# Pour chaque île : la grille devinée sur son terrain (terrains.py), puis les bâtiments, les arbres, les habitants… posés ici.
# Écrit sources/monde.js (la carte et la place de chaque image) et les images jeu-ile-<zone>.webp.
# python3 sources/monde.py <dossier d'aperçus>
import sys, json, random, numpy as np; sys.path.insert(0, 'sources')
from collections import deque
from terrains import grille, TERRAINS
from planches import detoure
from PIL import Image, ImageDraw
ECART = 4   # les cases de vide entre deux îles
PLACE = {'lande': (1, 0), 'foret': (0, 1), 'village': (1, 1), 'desert': (2, 1), 'cabane': (0, 2), 'bayou': (1, 2)}   # (colonne, ligne) de chaque île
PONTS = [('village', 'foret'), ('village', 'desert'), ('village', 'lande'), ('village', 'bayou'), ('foret', 'cabane')]
LIBRE = set(".,=*bnPp:B")
iles = {z: grille(z) for z in PLACE}
LW = max(len(g[0]) for g, p, im in iles.values()) + ECART; LH = max(len(g) for g, p, im in iles.values()) + ECART
WW, WH = 3 * LW, 3 * LH
M = [[' '] * WW for _ in range(WH)]
ZONE = [[None] * WW for _ in range(WH)]
INFO = []
for z, (g, P, im) in iles.items():
    c, l = PLACE[z]; ox, oy = c * LW + (LW - len(g[0])) // 2, l * LH + (LH - len(g)) // 2
    for y, ligne in enumerate(g):
        for x, ch in enumerate(ligne): M[oy + y][ox + x] = ch; ZONE[oy + y][ox + x] = z if ch != ' ' else None
    INFO.append(dict(zone=z, image='jeu-ile-%s.webp' % z, ox=ox, oy=oy, w=len(g[0]), h=len(g), **{k: P[k] for k in ('W', 'H', 'i0', 'j0', 'X0', 'Y0', 'hw', 'hh')}))
    detoure(im).save('jeu-ile-%s.webp' % z, quality=86, method=6)
ILE = {d['zone']: d for d in INFO}
def couleur(z, x, y):   # la couleur du terrain peint sous la case (x, y) du monde
    d = ILE[z]; g, P, im = iles[z]; i, j = x - d['ox'] + d['i0'], y - d['oy'] + d['j0']
    px, py = d['X0'] + (i - j) * d['hw'], d['Y0'] + (i + j + 1) * d['hh']
    return np.array(im.getpixel((int(min(d['W'] - 1, max(0, px))), int(min(d['H'] - 1, max(0, py))))), np.float32)
# la couleur du sol de chaque île : la plus fréquente sous ses cases de sol (pour ne pas planter d'arbre sur un chemin peint)
SOLC = {}
for z, d in ILE.items():
    cs = [couleur(z, x, y) for y in range(d['oy'], d['oy'] + d['h']) for x in range(d['ox'], d['ox'] + d['w']) if M[y][x] == '.']
    q = np.array(cs) // 16; k = q[:, 0] * 1e4 + q[:, 1] * 1e2 + q[:, 2]; v, n = np.unique(k, return_counts=True); SOLC[z] = np.array(cs)[k == v[n.argmax()]].mean(0)
def surSol(z, x, y): return np.abs(couleur(z, x, y) - SOLC[z]).sum() < 75
# ---------- les ponts entre îles ----------
BOUTS = []
for a, b in PONTS:
    A, B = ILE[a], ILE[b]; (ca, la), (cb, lb) = PLACE[a], PLACE[b]
    horiz = la == lb; best = None
    if horiz:
        G, D = (A, B) if ca < cb else (B, A)
        for y in range(max(G['oy'], D['oy']) + 3, min(G['oy'] + G['h'], D['oy'] + D['h']) - 3):
            xa = max((x for x in range(G['ox'], G['ox'] + G['w']) if M[y][x] == '.'), default=None); xb = min((x for x in range(D['ox'], D['ox'] + D['w']) if M[y][x] == '.'), default=None)
            if xa is None or xb is None: continue
            mid = (max(G['oy'], D['oy']) + min(G['oy'] + G['h'], D['oy'] + D['h'])) / 2; s = (xb - xa) + abs(y - mid) * .4
            if best is None or s < best[0]: best = (s, [(x, y) for x in range(xa + 1, xb)])
    else:
        H_, Bs = (A, B) if la < lb else (B, A)
        for x in range(max(H_['ox'], Bs['ox']) + 3, min(H_['ox'] + H_['w'], Bs['ox'] + Bs['w']) - 3):
            ya = max((y for y in range(H_['oy'], H_['oy'] + H_['h']) if M[y][x] == '.'), default=None); yb = min((y for y in range(Bs['oy'], Bs['oy'] + Bs['h']) if M[y][x] == '.'), default=None)
            if ya is None or yb is None: continue
            mid = (max(H_['ox'], Bs['ox']) + min(H_['ox'] + H_['w'], Bs['ox'] + Bs['w'])) / 2; s = (yb - ya) + abs(x - mid) * .4
            if best is None or s < best[0]: best = (s, [(x, y) for y in range(ya + 1, yb)])
    for x, y in best[1]: M[y][x] = 'b'
    BOUTS += [best[1][0], best[1][-1]]
    for x, y in best[1]:
        if ZONE[y][x] is None: ZONE[y][x] = a   # le pont appartient à l'île d'où l'on vient
# ---------- les éléments posés ----------
rnd = random.Random(7)
PRIS = set()   # cases déjà prises (bâtiments, et une marge autour)
def proche(x, y, l, d): return any(max(abs(x - a), abs(y - b)) <= d for a, b in l)
def libreRect(z, x0, y0, w, h, marge=1):
    for y in range(y0 - marge, y0 + h + marge + 1):   # + 1 : la rangée devant la porte reste libre
        for x in range(x0 - marge, x0 + w + marge):
            if not (0 <= y < WH and 0 <= x < WW) or M[y][x] != '.' or ZONE[y][x] != z or (x, y) in PRIS: return False
    return not proche(x0 + w // 2, y0 + h // 2, BOUTS, 6 + max(w, h) // 2)
def poser(z, motif, cible=None, pres=None, loin=None):
    """pose un motif (liste de lignes) sur l'île z : le plus près de la cible (x, y), ou au hasard ; renvoie le coin"""
    d = ILE[z]; h, w = len(motif), len(motif[0]); cands = []
    for y0 in range(d['oy'], d['oy'] + d['h'] - h):
        for x0 in range(d['ox'], d['ox'] + d['w'] - w):
            if not libreRect(z, x0, y0, w, h): continue
            cx, cy = x0 + w / 2, y0 + h / 2
            s = rnd.random() * 8
            if cible: s += abs(cx - cible[0]) + abs(cy - cible[1])
            if pres: s += 3 * min((abs(cx - a) + abs(cy - b) for a, b in pres), default=0)
            if loin: s -= 1.2 * min(min((abs(cx - a) + abs(cy - b) for a, b in loin), default=40), 18)
            cands.append((s, x0, y0))
    if not cands: print('  pas de place pour', z, motif[0]); return None
    _, x0, y0 = min(cands)
    for yy, ligne in enumerate(motif):
        for xx, ch in enumerate(ligne):
            if ch != '?': M[y0 + yy][x0 + xx] = ch
    for yy in range(y0 - 2, y0 + h + 3):
        for xx in range(x0 - 2, x0 + w + 2): PRIS.add((xx, yy))
    return (x0, y0)
def centre(z): d = ILE[z]; return (d['ox'] + d['w'] / 2, d['oy'] + d['h'] / 2)
def semer(z, ch, n, ok=lambda x, y: True, ecart=1):
    d = ILE[z]; cs = [(x, y) for y in range(d['oy'], d['oy'] + d['h']) for x in range(d['ox'], d['ox'] + d['w']) if M[y][x] == '.' and ZONE[y][x] == z and (x, y) not in PRIS and ok(x, y)]
    rnd.shuffle(cs); mis = []
    for x, y in cs:
        if len(mis) >= n: break
        if proche(x, y, mis, ecart) or proche(x, y, BOUTS, 2): continue
        M[y][x] = ch; mis.append((x, y)); PRIS.add((x, y))
    return mis
def maison(w, h, l='H', porte='D', toit='R'):
    return [toit * w] * (h - 1) + [l * (w // 2) + porte + l * (w - w // 2 - 1)]
BATIS = []
def bati(z, motif, **k):
    c = poser(z, motif, **k)
    if c: BATIS.append((c[0] + len(motif[0]) // 2, c[1] + len(motif) - 1 + 1))   # la case devant la porte
    return c
# le village : la cathédrale au milieu, le départ devant elle, les maisons et les boutiques autour
cv = centre('village')
ca = bati('village', ['EEEEEEE'] * 6 + ['EEEGEEE'], cible=cv)
dep = (ca[0] + 3, ca[1] + 9); M[dep[1]][dep[0]] = 'P'; PRIS.add(dep)
for i in range(4): bati('village', maison(4, 3), loin=BATIS)
for l, w in (('X', 4), ('Q', 4), ('N', 5), ('Y', 4)): bati('village', maison(w, 3, l, l, l), loin=BATIS)
parc = poser('village', ['j?j?j', '?????', 'j?j?j'], loin=BATIS)
bati('desert', maison(5, 3), cible=centre('desert'))                      # le ranch (RHD dans le désert : le saloon)
bati('desert', maison(4, 3, 'W', 'W', 'W'), loin=BATIS)                   # Chupa la sopa
bati('lande', maison(5, 4, 'F', 'F', 'F'), cible=centre('lande'))         # la ferme
eau_foret = [(x, y) for y in range(WH) for x in range(WW) if M[y][x] == '~' and ZONE[y][x] == 'foret']
bati('foret', maison(4, 4, 'C', 'C', 'C'), pres=eau_foret)                 # le chalet en A, au bord du lac
poser('foret', ['ffffff', 'ft?t?f', 'f????f', 'ft?t?f', 'ff??ff'], loin=BATIS)   # le vieux cimetière
bati('cabane', ['KKKKKK'] * 3 + ['KKkKKK'], cible=centre('cabane'))       # la cabane de Sporran
# les habitants et les panneaux : près du pont par lequel on arrive
ENTREE = {'village': dep}
for (a, b), i in zip(PONTS, range(len(PONTS))):
    p0, p1 = BOUTS[2 * i], BOUTS[2 * i + 1]
    for e in (p0, p1):
        zz = ZONE[e[1]][e[0]] if M[e[1]][e[0]] != 'b' else None
        # le bout du pont touche l'île b (l'arrivée) si la case voisine hors du pont est sur b
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            x, y = e[0] + dx, e[1] + dy
            if M[y][x] == '.' and ZONE[y][x] == b: ENTREE.setdefault(b, (x, y))
PNJ = {}
for z, (ex, ey) in ENTREE.items():
    if z == 'cabane': continue
    d = ILE[z]; cs = sorted(((abs(x - ex) + abs(y - ey), x, y) for y in range(d['oy'], d['oy'] + d['h']) for x in range(d['ox'], d['ox'] + d['w'])
                            if M[y][x] == '.' and (x, y) not in PRIS and 3 <= abs(x - ex) + abs(y - ey) <= 6 and all(M[y + b][x + a] == '.' for a in (-1, 0, 1) for b in (-1, 0, 1))))
    if cs: _, x, y = cs[0]; PNJ[z] = (x, y); PRIS.update((x + a, y + b) for a in (-1, 0, 1) for b in (-1, 0, 1))
    cs = sorted(((abs(x - ex) + abs(y - ey), x, y) for y in range(d['oy'], d['oy'] + d['h']) for x in range(d['ox'], d['ox'] + d['w']) if M[y][x] == '.' and (x, y) not in PRIS and 2 <= abs(x - ex) + abs(y - ey) <= 5))
    if cs: _, x, y = cs[0]; M[y][x] = 'S'; PRIS.add((x, y))
# les petits éléments
for x, y in BATIS: PRIS.update((x + a, y + b) for a in (-1, 0, 1) for b in (0, 1, 2))
semer('village', 'L', 10, ecart=5); semer('foret', 'L', 4, ecart=8); semer('cabane', 'L', 3, ecart=8)
semer('desert', 'c', 18, ok=lambda x, y: surSol('desert', x, y), ecart=3)
semer('lande', 'o', 4, ecart=8); semer('lande', ',', 30, ok=lambda x, y: surSol('lande', x, y), ecart=2)
semer('cabane', 'u', 6, ecart=4); semer('cabane', ',', 20, ecart=2); semer('bayou', ',', 30, ecart=2)
# les arbres : surtout en lisière, quelques-uns au milieu ; jamais sur un chemin peint ni devant une porte
def bordDist(x, y):
    for r in range(1, 4):
        if any(M[y + b][x + a] in 'x ' for a in range(-r, r + 1) for b in range(-r, r + 1) if 0 <= y + b < WH and 0 <= x + a < WW): return r
    return 9
for z, d in ILE.items():
    for y in range(d['oy'], d['oy'] + d['h']):
        for x in range(d['ox'], d['ox'] + d['w']):
            if M[y][x] != '.' or ZONE[y][x] != z or (x, y) in PRIS or proche(x, y, BOUTS, 2) or not surSol(z, x, y): continue
            r = bordDist(x, y); p = {1: .5, 2: .3, 3: .12}.get(r, .025)
            if rnd.random() < p: M[y][x] = 'T'
# ---------- tout doit être accessible à pied : on relie les morceaux coupés par l'eau ou les rochers avec des passerelles ----------
def composantes():
    vu = {}; n = 0
    for y in range(WH):
        for x in range(WW):
            if M[y][x] in LIBRE and (x, y) not in vu:
                n += 1; f = [(x, y)]; vu[(x, y)] = n
                while f:
                    a, b = f.pop()
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        c = (a + dx, b + dy)
                        if 0 <= c[0] < WW and 0 <= c[1] < WH and c not in vu and M[c[1]][c[0]] in LIBRE: vu[c] = n; f.append(c)
    return vu
for tour in range(30):
    vu = composantes(); principal = vu[dep]; tailles = {}
    for c, n in vu.items(): tailles[n] = tailles.get(n, 0) + 1
    autres = [n for n, t in tailles.items() if n != principal and t >= 12]
    if not autres: break
    cible = autres[0]
    # 0-1 : on traverse l'eau, les rochers et le bord à coût 1 ; le sol coûte 0
    dist = {}; prec = {}; dq = deque()
    for c, n in vu.items():
        if n == principal: dist[c] = 0; dq.append(c)
    fin = None
    while dq:
        a, b = dq.popleft()
        if vu.get((a, b)) == cible: fin = (a, b); break
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c = (a + dx, b + dy)
            if not (0 <= c[0] < WW and 0 <= c[1] < WH): continue
            ch = M[c[1]][c[0]]
            if ch in LIBRE: w = 0
            elif ch in '~#x': w = 1
            else: continue
            nd_ = dist[(a, b)] + w
            if nd_ < dist.get(c, 1e9):
                dist[c] = nd_; prec[c] = (a, b)
                (dq.appendleft if w == 0 else dq.append)(c)
    if not fin: break
    c = fin
    while c in prec:
        if M[c[1]][c[0]] in '~#x': M[c[1]][c[0]] = 'b'
        c = prec[c]
vu = composantes(); principal = vu[dep]
print('cases accessibles :', sum(1 for n in vu.values() if n == principal), '/', len(vu))
carte = [''.join(l) for l in M]
CODE = {'village': 'V', 'foret': 'F', 'cabane': 'K', 'desert': 'D', 'lande': 'L', 'bayou': 'B'}   # comme CODE_ZONE dans jeu.js
ZG = [''.join('_' if ZONE[y][x] is None else CODE[ZONE[y][x]] for x in range(WW)) for y in range(WH)]
with open('sources/monde.js', 'w') as o:
    o.write('// fabriqué par sources/monde.py : les 6 îles peintes, reliées par des ponts. Chaque case : voir TUILES dans jeu.js.\n')
    o.write('const MONDE = ' + json.dumps(dict(carte=carte, iles=INFO, pnj=PNJ, zones=ZG), ensure_ascii=False) + ';\n')
# un aperçu : la carte entière en petits carrés
C = {' ': (12, 30, 40), 'x': (120, 100, 140), '.': (130, 170, 100), '~': (60, 140, 220), 'b': (170, 110, 70), 'T': (30, 90, 50), '#': (150, 60, 50), 'P': (255, 255, 0)}
im = Image.new('RGB', (WW * 4, WH * 4)); d = ImageDraw.Draw(im)
for y in range(WH):
    for x in range(WW): d.rectangle((x * 4, y * 4, x * 4 + 3, y * 4 + 3), fill=C.get(M[y][x], (240, 240, 240)))
im.save(sys.argv[1] + '/monde.png'); print(WW, WH)
