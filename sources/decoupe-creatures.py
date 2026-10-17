# Les 13 créatures animées (planches flat 4×4) : une image par créature, jeu-crea-<clé>.webp, 4 lignes de 4 images de 256×256.
# Lignes : apparition, attente, action, disparition (Sporran : attente, attente, disparition, réapparition).
import sys; sys.path.insert(0, 'sources')
from planches import *
P = {'kraken': ('32a7e53a-Anim_flat_KRAKEN.png', 'vert'), 'nessie': ('4181d39b-Anim_flat_NESSIE.png', 'vert'), 'swamp': ('42fefc7e-Anim_flat_SWAMP.png', 'magenta'),
     'barghest': ('53078063-Anim_flat_BARGHEST.png', 'magenta'), 'chupacabra': ('6a4af453-Anim_flat_CHUPACABRA.png', 'vert'),
     'gargouille': ('6cf86465-Anim_flat_GARGOUILLE.png', 'vert'), 'lutins': ('763b3904-Anim_flat_LUTINS.png', 'magenta'), 'yeti': ('974ef1bf-Anim_flat_YETI.png', 'vert'),
     'faery': ('a1b71b10-Anim_flat_FAERY.png', 'vert'), 'mothman': ('c1fe2c20-Anim_flat_MOTHMAN.png', 'vert'), 'thunderbird': ('cab91507-Anim_flat_THUNDERBIRD.png', 'vert'),
     'catsith': ('ced7192c-Anim_flat_CAT_SITH.png', 'magenta'), 'jackalope': ('f4ba3851-Anim_flat_JACKALOPE.png', 'vert')}
F = 256
for k in (sys.argv[2:] or P):
    f, fond = P[k]; L = cases_fixes(f, 4, 4, fond)
    A = Image.new('RGBA', (F * 4, F * 4))
    for r in range(4):
        for c in range(4): A.paste(L[r][c].resize((F, F), Image.LANCZOS), (c * F, r * F))
    A.save('jeu-crea-' + k + '.webp', quality=86, method=6); apercu(A, sys.argv[1] + '/crea-' + k + '.png')
    print(k, 'ok')
