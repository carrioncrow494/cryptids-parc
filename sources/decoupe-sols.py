# Les sols de chaque zone, tirés des terrains peints par Sam (16/10) : jeu-sols.webp, 6 lignes (une par zone) de 7 tuiles de 256 :
#   sol, sol2 (une 2e variante), chemin, pavés, eau, planches, neige
# L'herbe (ou le sable, la mousse…), l'eau et la neige sont prises dans une grande zone calme du terrain, puis rendues raccordables.
# Les chemins, les pavés et les planches sont les anciennes tuiles, recolorées avec les couleurs du terrain.
# python3 sources/decoupe-sols.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
from planches import *
T = 256
ZONES = ['village', 'foret', 'cabane', 'desert', 'lande', 'bayou']   # le même ordre que SOLS_ZONE dans jeu.js
# terrain, puis pour chaque matière la boîte (x0, y0, x1, y1, en pixels du terrain) où la chercher
TERRAINS = {
  'village': ('a530268d-image.png', dict(sol=(507, 80, 760, 230), sol2=(130, 380, 360, 470), chemin=(840, 500, 960, 560), paves=(200, 650, 440, 775), eau=(1333, 520, 1470, 600))),
  'foret': ('f25b7b1b-image.png', dict(sol=(133, 400, 350, 495), sol2=(1000, 160, 1180, 250), chemin=(1173, 307, 1253, 373), paves=(267, 267, 440, 347), eau=(667, 640, 933, 750))),
  'cabane': ('4c234ca7-image.png', dict(sol=(18, 50, 100), chemin=(747, 440, 907, 507), paves=(293, 267, 440, 347), eau=(800, 800, 933, 880))),
  'desert': ('41412678-image.png', dict(sol=(173, 387, 347, 453), chemin=(800, 507, 933, 560), paves=(227, 640, 440, 747), eau=(29, 188, 225))),   # une couleur au lieu d'une boîte : on cherche cette couleur dans tout le terrain
  'lande': ('fa481f71-image.png', dict(sol=(133, 440, 333, 507), chemin=(507, 547, 613, 587), paves=(267, 293, 440, 373), eau=(827, 320, 960, 400), neige=(1040, 160, 1200, 240))),
  'bayou': ('2de40fb3-image.png', dict(sol=(640, 560, 827, 640), chemin=(533, 227, 667, 307), paves=(267, 267, 440, 360), eau=(1173, 440, 1333, 507))),
}
ANCIENNES = ['vertdeau', 'mousse', 'sarcelle', 'bayou', 'feuilles', 'sable', 'neige', 'chemin', 'paves', 'eau', 'marais', 'planches']
vieux = np.asarray(Image.open('jeu-sol.webp').convert('RGB')).astype(np.float32)
def ancienne(n): i = ANCIENNES.index(n); return vieux[(i // 4) * T:(i // 4 + 1) * T, (i % 4) * T:(i % 4 + 1) * T]
def couleur(a, box):
    """la couleur la plus fréquente de la boîte (la matière qu'on y cherche)"""
    if len(box) == 3: return np.array(box, np.float32)
    x0, y0, x1, y1 = box; f = a[y0:y1, x0:x1].reshape(-1, 3); q = (f // 12).astype(int); k = q[:, 0] * 10000 + q[:, 1] * 100 + q[:, 2]
    v, n = np.unique(k, return_counts=True); m = f[k == v[n.argmax()]]; return m.mean(0)
def fenetres(a, c, w, h, seuil=46):
    """les fenêtres de tout le terrain faites (presque) seulement de cette matière, de la plus calme à la moins calme"""
    ok = (np.abs(a - c).sum(2) < seuil * 1.7).astype(np.float32); I = ok.cumsum(0).cumsum(1); res = []
    for y in range(0, a.shape[0] - h, 6):
        for x in range(0, a.shape[1] - w, 6):
            n = I[y + h - 1, x + w - 1] - (I[y - 1, x + w - 1] if y else 0) - (I[y + h - 1, x - 1] if x else 0) + (I[y - 1, x - 1] if x and y else 0)
            if n >= .97 * w * h: res.append((a[y:y + h, x:x + w].std(axis=(0, 1)).sum(), x, y))
    res.sort(); return res
def calme(a, box, w=120, h=66, n=0, seuil=46):
    for ww, hh in ((w, h), (w * 3 // 4, h * 3 // 4), (w // 2, h // 2), (w // 3, h // 3)):
        r = fenetres(a, couleur(a, box), ww, hh, seuil)
        if r:
            x, y = r[0][1], r[0][2]
            if n:   # une 2e fenêtre, loin de la 1re
                loin = [q for q in r if abs(q[1] - x) > ww or abs(q[2] - y) > hh]; x, y = (loin or r)[0][1:]
            return a[y:y + hh, x:x + ww]
    return calme(a, box, w, h, n, seuil * 1.3)   # rien d'assez uni : on accepte un peu plus de détails
def autre(a, box): return calme(a, box, n=1)
def tuile(f): return (np.asarray(Image.fromarray(f.clip(0, 255).astype(np.uint8)).resize((T, T), Image.LANCZOS)).astype(np.float32))
def teinte(t, ref):
    """donne à une ancienne tuile les couleurs (moyenne et contraste, un peu adouci) de la zone du terrain"""
    m0, s0 = t.mean((0, 1)), t.std((0, 1)) + 1; m1, s1 = ref.mean((0, 1)), ref.std((0, 1))
    return (t - m0) / s0 * np.maximum(s1, s0 * .5) * .8 + m1
S = np.zeros((T * len(ZONES), T * 7, 3), np.float32)
for zi, z in enumerate(ZONES):
    f, B = TERRAINS[z]; a = np.asarray(Image.open(U + f).convert('RGB')).astype(np.float32)
    def boite(k): x0, y0, x1, y1 = B[k]; return a[y0:y1, x0:x1]
    sol = tuile(calme(a, B['sol'])); sol2 = tuile(calme(a, B['sol2']) if 'sol2' in B else autre(a, B['sol'])); eau = tuile(calme(a, B['eau']))
    chemin = teinte(ancienne('chemin'), calme(a, B['chemin'], 40, 24)); paves = teinte(ancienne('paves'), boite('paves'))
    neige = tuile(calme(a, B['neige'])) if 'neige' in B else ancienne('neige')
    for k, t in enumerate([sol, sol2, chemin, paves, eau, ancienne('planches'), neige]): S[zi * T:(zi + 1) * T, k * T:(k + 1) * T] = t
im = Image.fromarray(S.clip(0, 255).astype(np.uint8)); im.save('jeu-sols.webp', quality=88, method=6); im.resize((im.size[0] // 2, im.size[1] // 2)).save(sys.argv[1] + '/sols.png')
print(im.size)
