# Héros flat : découpe les 3 planches (marche 4×4, attente 4 colonnes × 2, actions 4×4) en atlas d'images de 320×320, alignées sur la tête,
# les pieds en bas. python3 sources/decoupe-flat.py <dossier d'aperçus>
import sys; sys.path.insert(0, 'sources')
from planches import *
FW, FH, PIED = 320, 320, 304
marche = cases('71b0bd85-Planche_de_sprites___chat_mage_violet_en_marche.png', 4, 4)
att = cases('20e205f0-Plaque_de_sprites_du_mage_chat_lunaire.png', 2, 4); att = [[att[0][c], att[1][c]] for c in range(4)]
act = cases('ef4e1d49-Planche_de_sprites_du_mage-chat___lanterne.png', 4, 4)
ech = lambda p: 280 / np.median([c.size[1] for row in p for c in row])
s_marche, s_att = ech(marche), ech(att)   # la planche d'attente est dessinée plus grand : on la ramène à la taille de la marche
def cadre(c, bas, s, FH=FH, PIED=PIED):
    w, h = c.size; c2 = c.resize((round(w * s), round(h * s)), Image.LANCZOS)
    f = Image.new('RGBA', (FW, FH)); f.paste(c2, (round(FW / 2 - tete_x(c) * s), round(PIED - bas * s)), c2); return f
def ligne(l, s, **k): return [cadre(c, bas_de(c), s, **k) for c in l]   # chaque image a les pieds sur la même ligne
ordre = {'bas': 0, 'droite': 1, 'haut': 3, 'gauche': 2}   # bas-gauche, bas-droite, haut-gauche, haut-droite (sans miroir : la lanterne reste dans la même main)
A = Image.new('RGBA', (FW * 6, FH * 4))
for i, k in enumerate(['bas', 'droite', 'haut', 'gauche']):
    for j, f in enumerate(ligne(marche[ordre[k]], s_marche) + ligne(att[ordre[k]], s_att)): A.paste(f, (j * FW, i * FH))
A.save('jeu-heros.webp', quality=88, method=6)
B = Image.new('RGBA', (FW * 4, 360 * 4))   # images plus hautes (320×360) : on saute de joie   # actions : fouille (vers la gauche), fouille (vers la droite), surprise, joie
for i in range(4):
    for j, f in enumerate(ligne(act[i], s_marche, FH=360, PIED=344)): B.paste(f, (j * FW, i * 360))
B.save('jeu-heros-actions.webp', quality=88, method=6)
apercu(A, sys.argv[1] + '/heros-A.png'); apercu(B, sys.argv[1] + '/heros-B.png')
