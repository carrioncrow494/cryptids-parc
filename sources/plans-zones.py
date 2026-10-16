# Les plans des 6 zones, vus en biais comme dans le jeu, à donner à ChatGPT pour peindre le sol de chaque zone d'un seul morceau.
# python3 sources/plans-zones.py <dossier>   → <dossier>/<zone>/plan-<zone>.png et plan-<zone>-grille.png
import re, sys, os
from PIL import Image, ImageDraw, ImageFont
src = open('sources/jeu.js').read()
G = re.findall(r'"([^"]+)"', re.search(r'const CARTE = \[(.*?)\];', src, re.S).group(1))
def zone(x, y):   # comme ZONES dans jeu.js
    if 15 <= x <= 30 and y >= 29: return 'cabane'
    if x <= 14 and y >= 14: return 'foret'
    if x >= 31 and y >= 14: return 'bayou'
    if y >= 14: return 'village'
    if x <= 21: return 'lande'
    return 'desert'
SOL = {'village': (126, 170, 96), 'foret': (46, 104, 100), 'bayou': (110, 130, 70), 'lande': (140, 160, 120), 'desert': (232, 190, 130), 'cabane': (230, 130, 50)}
CH = {'=': (196, 170, 220), 'p': (196, 170, 220), 'P': (255, 220, 120), ':': (232, 190, 130), '~': (80, 170, 210), 'b': (170, 110, 70), 'B': (170, 110, 70), 'n': (240, 244, 250), 'j': (236, 206, 150), '*': (200, 220, 140)}
BATI = 'RHDEGKkXQNYWFC'
NOMS = {'X': 'Excalibook', 'Q': 'Bergamotte', 'N': 'Ninamoto', 'Y': 'Supérette', 'E': 'Cathédrale', 'K': 'Cabane biscornue', 'W': 'Chupa la sopa', 'F': 'Ferme', 'C': 'Chalet', 'B': 'Pont couvert'}
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
W = 110; H = W * .675
for z in SOL:
    cs = [(x, y) for y in range(len(G)) for x in range(len(G[0])) if zone(x, y) == z]
    X0 = max(0, min(x for x, y in cs) - 1); X1 = min(len(G[0]) - 1, max(x for x, y in cs) + 1); Y0 = max(0, min(y for x, y in cs) - 1); Y1 = min(len(G) - 1, max(y for x, y in cs) + 1)
    P = lambda x, y: (((x - X0) - (y - Y0)) * W / 2 + (Y1 - Y0 + 1) * W / 2 + 20, ((x - X0) + (y - Y0)) * H / 2 + 20)
    w = int((X1 - X0 + 1 + Y1 - Y0 + 1) * W / 2 + 40); h = int((X1 - X0 + Y1 - Y0 + 2) * H / 2 + 40)
    os.makedirs(sys.argv[1] + '/' + z, exist_ok=True)
    for grille in (False, True):
        im = Image.new('RGB', (w, h), (0, 255, 0)); d = ImageDraw.Draw(im)
        for y in range(Y0, Y1 + 1):
            for x in range(X0, X1 + 1):
                if zone(x, y) != z: continue   # seulement la zone : les voisines sont peintes avec leur propre plan
                ch = G[y][x]; ax, ay = P(x, y); poly = [(ax, ay), (ax + W / 2, ay + H / 2), (ax, ay + H), (ax - W / 2, ay + H / 2)]
                c = (150, 145, 160) if ch in BATI else CH.get(ch, SOL[z])
                if ch == 'n' and z != 'lande': c = SOL[z]
                d.polygon(poly, fill=c, outline=(60, 60, 60) if grille else None)
                cx, cy = ax, ay + H / 2
                if ch in 'TA': d.ellipse((cx - W * .3, cy - H * .35, cx + W * .3, cy + H * .35), fill=(30, 70, 50) if ch == 'T' else (200, 200, 215))
                elif ch == 'M': d.ellipse((cx - W * .3, cy - H * .35, cx + W * .3, cy + H * .35), fill=(190, 90, 60))
                elif ch == 'j': d.ellipse((cx - W * .15, cy - H * .2, cx + W * .15, cy + H * .2), fill=(230, 90, 120))
                elif ch == 'L': d.ellipse((cx - W * .12, cy - H * .17, cx + W * .12, cy + H * .17), fill=(255, 210, 80))
                elif ch in 'S#ofctu': d.ellipse((cx - W * .12, cy - H * .17, cx + W * .12, cy + H * .17), fill=(150, 110, 70))
        for l, nom in NOMS.items():
            cl = [(a, b) for (a, b) in cs if G[b][a] == l or (l == 'E' and G[b][a] == 'G') or (l == 'K' and G[b][a] == 'k')]
            if not cl: continue
            ax, ay = P(sum(a for a, b in cl) / len(cl), sum(b for a, b in cl) / len(cl)); tw = d.textlength(nom, font=F)
            d.text((ax - tw / 2, ay + H / 2 - 14), nom, fill=(255, 255, 255), font=F, stroke_width=3, stroke_fill=(40, 30, 50))
        if z == 'desert':   # le ranch (maison du désert)
            cl = [(a, b) for (a, b) in cs if G[b][a] in 'RHD']; ax, ay = P(sum(a for a, b in cl) / len(cl), sum(b for a, b in cl) / len(cl)); tw = d.textlength('Ranch', font=F)
            d.text((ax - tw / 2, ay + H / 2 - 14), 'Ranch', fill=(255, 255, 255), font=F, stroke_width=3, stroke_fill=(40, 30, 50))
        if z == 'village':
            ax, ay = P(22.5, 26); t = 'Parc de jeux'; tw = d.textlength(t, font=F); d.text((ax - tw / 2, ay), t, fill=(255, 255, 255), font=F, stroke_width=3, stroke_fill=(40, 30, 50))
        im.save(sys.argv[1] + '/%s/plan-%s%s.png' % (z, z, '-grille' if grille else ''))
    print(z, w, h)
