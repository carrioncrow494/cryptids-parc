import numpy as np, sys
from PIL import Image
U='/root/.claude/uploads/af7a31c2-4253-517e-b27c-20e579b50415/'
def detoure(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32); r,g,b=a[...,0],a[...,1],a[...,2]
    gm=g-np.maximum(r,b)
    al=np.clip(1-(gm-40)/120,0,1)
    g2=np.minimum(g,np.maximum(r,b)*1.0+ (g-np.maximum(r,b))*0.0)
    out=np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def cellules(path,rows,cols):
    im=detoure(Image.open(U+path)); W,H=im.size; cw,ch=W/cols,H/rows
    return [[nettoie(im.crop((round(c*cw),round(r*ch),round((c+1)*cw),round((r+1)*ch)))) for c in range(cols)] for r in range(rows)]
import scipy.ndimage as nd
def nettoie(c):   # garde le personnage (la plus grosse tache) et ce qui le touche presque ; enlève les bouts des cases voisines
    a=np.array(c); m=a[...,3]>20; lab,n=nd.label(nd.binary_dilation(m,iterations=6))
    if n>1:
        t=nd.sum(m,lab,range(1,n+1)); garde=lab==(1+int(np.argmax(t))); a[...,3]=a[...,3]*garde
    return Image.fromarray(a,'RGBA')
def bbox(c):
    a=np.asarray(c)[...,3]>128; ys,xs=np.nonzero(a); return xs.min(),ys.min(),xs.max(),ys.max()
FW,FH,PIED,HT=256,320,304,280
def normalise(rows):
    hs=[bbox(c)[3]-bbox(c)[1] for row in rows for c in row]; s=HT/np.median(hs)
    res=[]
    for row in rows:
        bb=[bbox(c) for c in row]; bas=max(b[3] for b in bb); cx=np.mean([(b[0]+b[2])/2 for b in bb])
        out=[]
        for c in row:
            w,h=c.size; c2=c.resize((round(w*s),round(h*s)),Image.LANCZOS)
            f=Image.new('RGBA',(FW,FH)); f.alpha_composite(c2,(round(FW/2-cx*s),round(PIED-bas*s)) if False else (0,0)) if False else None
            f.paste(c2,(round(FW/2-cx*s),round(PIED-bas*s)),c2); out.append(f)
        res.append(out)
    return res
marche=normalise(cellules('afd91521-Sprite_sheet_du_chat_sorcier_lumineux.png',4,4))
att=normalise(cellules('ad76544b-Planche_de_sprites___chat_magicien_anim_.png',2,4))
# face = vers le bas à droite (droite), dos = vers le haut à droite (haut) ; miroir pour bas et gauche
face_m=marche[0]; dos_m=marche[2]
face_a=[att[0][1],att[1][1]]; dos_a=[att[0][3],att[1][3]]
miroir=lambda l:[f.transpose(Image.FLIP_LEFT_RIGHT) for f in l]
lignes={'droite':face_m+face_a,'bas':miroir(face_m+face_a),'haut':dos_m+dos_a,'gauche':miroir(dos_m+dos_a)}
A=Image.new('RGBA',(FW*6,FH*4))
for i,k in enumerate(['bas','droite','haut','gauche']):
    for j,f in enumerate(lignes[k]): A.paste(f,(j*FW,i*FH))
A.save('heros.png'); A.save('heros.webp',quality=88,method=6)
# aperçu sur fond sombre
P=Image.new('RGBA',A.size,(40,60,70,255)); P.alpha_composite(A); P.convert('RGB').save('apercu.png')
