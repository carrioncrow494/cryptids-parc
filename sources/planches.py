# Outils communs pour découper les planches flat (fond vert, ou magenta) : chaque dessin est repéré par sa tache, pas par une grille stricte
# (les dessins débordent parfois de leur case). Une tache va dans la case où tombe son centre.
import numpy as np, scipy.ndimage as nd
from PIL import Image
U = '/root/.claude/uploads/af7a31c2-4253-517e-b27c-20e579b50415/'
def detoure(im, fond='vert'):
    a = np.asarray(im.convert('RGB')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if fond == 'vert':
        d = g - np.maximum(r, b); al = np.clip(1 - (d - 40) / 120, 0, 1); g = np.minimum(g, np.maximum(r, b) + np.clip(d, 0, 40) * .3)
    else:   # magenta : rouge et bleu forts, peu de vert
        d = np.minimum(r, b) - g; al = np.clip(1 - (d - 40) / 120, 0, 1); e = np.clip(d, 0, None) * .7   # on enlève le reflet rose des bords
        r = r - e; b = b - e
    return Image.fromarray(np.dstack([r, g, b, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
def cases(path, rows, cols, fond='vert', min_px=40):
    """renvoie [[image RGBA recadrée]] : le contenu de chaque case, taches débordantes comprises"""
    im = detoure(Image.open(U + path), fond); A = np.array(im); W, H = im.size; cw, ch = W / cols, H / rows
    m = A[..., 3] > 30; lab, n = nd.label(nd.binary_dilation(m, iterations=3))
    out = [[np.zeros(m.shape, bool) for c in range(cols)] for r in range(rows)]
    taille = nd.sum(m, lab, range(1, n + 1)); centres = nd.center_of_mass(m, lab, range(1, n + 1))
    gros = [i for i in range(n) if taille[i] >= 1500]   # les dessins ; les petits bouts (étincelles, gouttes) vont avec le dessin le plus proche
    pts = {i: np.argwhere(lab[::4, ::4] == i + 1) * 4 for i in gros}
    for i in range(n):
        if taille[i] < min_px: continue
        cy, cx = centres[i]
        if i not in gros and gros: i0 = min(gros, key=lambda j: np.min(np.hypot(pts[j][:, 0] - cy, pts[j][:, 1] - cx))); cy, cx = centres[i0]
        k = lab == i + 1
        if i in gros:   # deux dessins qui se touchent (ailes…) : on coupe la tache le long de la grille
            ys, xs = np.nonzero(k)
            if xs.max() - xs.min() > 1.25 * cw or ys.max() - ys.min() > 1.25 * ch:
                for r in range(rows):
                    for c in range(cols):
                        sub = np.zeros_like(k); sub[round(r * ch):round((r + 1) * ch), round(c * cw):round((c + 1) * cw)] = True; out[r][c] |= k & sub
                continue
        r, c = min(rows - 1, int(cy // ch)), min(cols - 1, int(cx // cw))
        out[r][c] |= k
    res = []
    for r in range(rows):
        ligne = []
        for c in range(cols):
            k = out[r][c]; ys, xs = np.nonzero(k)
            if not len(ys): ligne.append(None); continue
            B = A.copy(); B[..., 3] = B[..., 3] * k
            d = Image.fromarray(B, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)); d.info['x'], d.info['y'] = xs.min(), ys.min()
            ligne.append(d)
        res.append(ligne)
    return res
def bas_de(c):   # le bas du « corps » (là où l'opacité est forte), pas les petits traits qui dépassent
    a = np.asarray(c)[..., 3] > 128; ys = np.nonzero(a.any(1))[0]; return ys.max()
def tete_x(c):
    a = np.asarray(c)[..., 3] > 128; ys, xs = np.nonzero(a); y0 = ys.min(); h = ys.max() - y0
    _, hx = np.nonzero(a[y0:y0 + int(h * .5)]); return hx.mean()
def apercu(im, chemin, fond=(40, 60, 70, 255), red=2):
    P = Image.new('RGBA', im.size, fond); P.alpha_composite(im); P.convert('RGB').resize((im.size[0] // red, im.size[1] // red)).save(chemin)
def cases_fixes(path, rows, cols, fond='vert', marge=.08):
    """comme cases(), mais chaque image garde sa place dans la case (pour une animation : rien ne saute d'une image à l'autre)"""
    im = detoure(Image.open(U + path), fond); W, H = im.size; cw, ch = W / cols, H / rows
    brut = cases(path, rows, cols, fond); A = np.array(im)
    # on retrouve où était chaque dessin : on refait le masque case par case à partir de la découpe
    res = []
    for r in range(rows):
        ligne = []
        for c in range(cols):
            x0, y0 = c * cw - cw * marge, r * ch - ch * marge
            f = Image.new('RGBA', (round(cw * (1 + 2 * marge)), round(ch * (1 + 2 * marge))))
            d = brut[r][c]
            if d is not None: f.paste(d, (round(d.info['x'] - x0), round(d.info['y'] - y0)), d)
            ligne.append(f)
        res.append(ligne)
    return res
