import numpy as np, scipy.ndimage as nd
from PIL import Image
exec(open('decoupe.py').read().split('def cellules')[0])
im=detoure(Image.open(U+'c70885c4-Jauge_magique_inactive_et_activ_e.png')); W,H=im.size
off=np.array(im.crop((0,0,W//2,H))).astype(float); on=np.array(im.crop((W//2,0,W,H))).astype(float)
mo,mn=off[...,3]>128,on[...,3]>128
best=None
for dy in range(-20,21):
  for dx in range(-40,41):
    d=(np.roll(np.roll(mn,dy,0),dx,1)!=mo).sum()
    if best is None or d<best[0]: best=(d,dx,dy)
print('decalage',best)
on=np.roll(np.roll(on,best[2],0),best[1],1)
# zone utile : de l'antenne au début du manche
ys,xs=np.nonzero(mo[:600]); x0,x1,y0,y1=xs.min()-6,xs.max()+6,max(0,ys.min()-30),600
# voyants : là où l'image allumée est bien plus claire, dans la rangée des voyants
lum=lambda a:a[...,:3].sum(-1)
diff=(lum(on)-lum(off))>150
lab,n=nd.label(nd.binary_opening(diff[380:520],iterations=3)); t=nd.sum(np.ones_like(lab),lab,range(1,n+1))
gros=sorted([i+1 for i in np.argsort(t)[::-1][:5]], key=lambda i: nd.center_of_mass(lab==i)[1])
leds=[]
for i in gros:
  yy,xx=np.nonzero(lab==i); cx,cy=xx.mean(),yy.mean()+380; r=max(np.ptp(xx),np.ptp(yy))/2+14; leds.append((cx,cy,r))
print([(round(a),round(b),round(c)) for a,b,c in leds])
OFF=Image.fromarray(off.astype(np.uint8)).crop((x0,y0,x1,y1)); ON=Image.fromarray(on.clip(0,255).astype(np.uint8)).crop((x0,y0,x1,y1))
s=360/OFF.size[1]; T=(round(OFF.size[0]*s),360)
OFF=OFF.resize(T,Image.LANCZOS); ON=ON.resize(T,Image.LANCZOS)
# planche : éteint à gauche, allumé à droite
P=Image.new('RGBA',(T[0]*2,T[1])); P.paste(OFF,(0,0)); P.paste(ON,(T[0],0)); P.save('detecteur.webp',quality=90,method=6)
import json; json.dump({'w':T[0],'h':T[1],'leds':[[(cx-x0)*s,(cy-y0)*s,r*s] for cx,cy,r in leds]},open('detecteur.json','w'))
A=Image.new('RGBA',P.size,(40,60,70,255)); A.alpha_composite(P); A.convert('RGB').save('apercu-det.png')
print(open('detecteur.json').read())
