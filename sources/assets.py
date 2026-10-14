# Prépare les assets de Sam pour la carte : textures sans couture et sprites détourés, à 6 pixels par mètre
import glob, json, numpy as np
from PIL import Image
from scipy import ndimage
import sys, os
U=sys.argv[1].rstrip('/')+'/'; O=os.path.dirname(os.path.abspath(__file__))+'/../carte/'   # python3 sources/assets.py <dossier des images de Sam>
K=6
def src(i): return Image.open(glob.glob(U+i+'-*')[0]).convert('RGB')
def sans_couture(im):
    a=np.asarray(im).astype(float); h,w,_=a.shape
    b=np.roll(np.roll(a,h//2,0),w//2,1)       # version décalée de moitié : ses bords sont l'intérieur de l'original
    y=np.abs(np.linspace(-1,1,h))[:,None]; x=np.abs(np.linspace(-1,1,w))[None,:]
    m=np.clip((np.maximum(x,y)-.6)/.4,0,1)[...,None]   # près des bords, on prend la version décalée
    return Image.fromarray((a*(1-m)+b*m).astype(np.uint8))
def periode(v, lo, hi):
    v=v-v.mean(); c=[(v[:-p]*v[p:]).mean() for p in range(lo,hi)]; return lo+int(np.argmax(c))
def motif_regulier(im):   # tuiles : on coupe un nombre entier de rangées et de colonnes
    a=np.asarray(im.convert('L')).astype(float)
    py=periode(a.mean(1),40,200); px=periode(a.mean(0),40,200)
    ny=max(1,(a.shape[0]-40)//py); nx=max(1,(a.shape[1]-40)//px)
    return im.crop((20,20,20+nx*px,20+ny*py))
TEX={ # nom : (image, mètres couverts par la texture, régulière ?)
 'herbe':('436f5e70',24,0),'parc':('95f51221',24,0),'terrain':('79e6de9d',20,0),'bois':('8b78cf2c',16,0),
 'eau':('c9bd57a0',16,0),'trottoir':('aeb34498',8,0),'dalle':('b30d45d3',10,0),'chemin':('6720cb03',8,0),'gravier':('5db7025d',8,0),'route':('755d4bb7',10,0),
 'parking':('cb0dcaa2',13,0),'toitR':('6e2ddb4e',7,1),'toitM':('1da0c8f2',7,1),'toitA':('3829fa78',7,1),'toitB':('8f9520ae',6,1)}
for n,(i,m,reg) in TEX.items():
    im=src(i); im=motif_regulier(im) if reg else sans_couture(im)
    w=round(m*K); h=round(w*im.height/im.width)
    im.resize((w,h),Image.LANCZOS).save(O+'tex-'+n+'.png',optimize=True)
# façades : bande vue de face, hauteur d'un étage (3 m)
for n,i in [('brique','109fe13a'),('bois','f7edfdaa'),('pierre','a155935b'),('planches','5a945472')]:
    im=src(i); h=3*K*2; im.resize((round(h*im.width/im.height),h),Image.LANCZOS).save(O+'fac-'+n+'.png',optimize=True)
def detourer(cell, fond):
    a=np.asarray(cell).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]; mx=a.max(2); mn=a.min(2)
    bg=(mx<40) if fond=='noir' else ((mn>200)&(mx-mn<14))
    lab,_=ndimage.label(bg); bord=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]); bord.discard(0)
    fondc=np.isin(lab,list(bord))
    fondc=ndimage.binary_dilation(fondc,iterations=1)&(bg|ndimage.binary_dilation(bg))   # mange le liseré clair
    objet=~fondc; lab2,n2=ndimage.label(objet)
    if n2>1:   # on ne garde que l'objet principal (et ses morceaux importants), pas les bouts des cases voisines
        t=ndimage.sum(objet,lab2,range(1,n2+1)); objet=np.isin(lab2,[i+1 for i,v in enumerate(t) if v>=.12*t.max()])
    alpha=np.where(objet,255,0).astype(np.uint8)
    im=Image.fromarray(np.dstack([a.astype(np.uint8),alpha]),'RGBA'); bb=im.getbbox(); return im.crop(bb) if bb else None
SPR={}
def planche(i, cols, rows, noms, fond='clair', marge=.02):
    im=src(i); W,H=im.size; cw,ch=W/cols,H/rows
    for n,(nom,larg) in enumerate(noms):
        if not nom: continue
        x,y=(n%cols)*cw,(n//cols)*ch; cell=im.crop((int(x+cw*marge),int(y+ch*marge),int(x+cw*(1-marge)),int(y+ch*(1-marge))))
        s=detourer(cell,fond)
        if s is None: print('vide',nom); continue
        w=round(larg*K*2); s=s.resize((w,round(w*s.height/s.width)),Image.LANCZOS)   # 2 fois la taille utile : réduit au dessin
        s.save(O+'spr-'+nom+'.png',optimize=True); SPR[nom]=[s.width,s.height]
planche('07f291bc',4,4,[('arbre1',7),('arbre2',6.5),('arbre3',5.5),('arbre4',4.5),('sapin1',5),('sapin2',5),('marronnier',6.5),('automne',6),
  ('fruitier',5),('buisson1',2.6),('buisson2',2.8),('haie',4),('herbes',2),('fleurs',2.2),('lavande',2.2),('souche',1.6)],'noir')
planche('ea59986a',4,4,[('lampe',1.3),('lanterne',1.2),('lampe2',1.1),('banc',2.2),('poubelle',.9),('boite',1),('hydrant',.9),('stop',1.1),
  ('panneau',1.6),('feu',1),('abribus',4),('arret',1),('velos',2.6),('jardiniere',2.2),('statue',2),('cabine',1.4)])
planche('ea351ae6',3,3,[('maison%d'%n,12) for n in range(1,10)])
planche('ee8ce38b',3,2,[('immeuble1',18),('immeuble2',18),('commerce',14),('ecole',22),('eglise',16),('supermarche',24)],marge=.03)
planche('a1ca69a3',4,4,[('rive1',3),('rive2',3),('rive3',3),('rochers',3),('nenuphars',2.4),('lotus',2.4),('roseaux',2.4),('ponton',4),
  ('pont',5),('canard',.9),('jet',2),('fontaine',4),('boue',2.4),('rocher',2.4),('ilot',2.4),('touffe-eau',2.4)],marge=.03)
planche('f91e20a4',4,4,[('citrouille',.9),('lanterne-citrouille',.9),('citrouilles',1.6),('epouvantail',1.6),('toile',1.6),('chaudron',1.3),('lanterne-h',.8),('champignons',1.2),
  ('arbre-mort',4.5),('corbeau',.8),('chauve-souris',1),('bougies',.8),('chapeau',1),('balai',1.4),('feuilles',1.6),('brume',3)])
json.dump(SPR,open(O+'sprites.json','w'),separators=(',',':'))
print(len(SPR),'sprites')
