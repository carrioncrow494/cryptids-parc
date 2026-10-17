import math, random
from PIL import Image, ImageDraw, ImageFont
random.seed(7)
W,H=60,48
G=[['g']*W for _ in range(H)]   # G[j][i]
def fill(f,c):
    for j in range(H):
        for i in range(W):
            if f(i,j): G[j][i]=c
# montagnes au fond (bords i=0 et j=0)
fill(lambda i,j: j< 6+2*math.sin(i*.35)+ (3 if 20<i<34 else 0) or i< (5+2*math.cos(j*.4))*max(0,min(1,(36-j)/8)), 'M')
# cascades + vasques (faery pools) le long de la rivière
riv=[]
x=27.0
for j in range(5,22):
    x+= math.sin(j*.5)*.6
    riv.append((x,j))
for (x,j) in riv:
    for i in range(W):
        if abs(i-x)<1.6+(0.6 if j>14 else 0): G[j][i]='~'
for (cx,cy,r) in [(26,8,2.2),(28,11,2.4),(27,15,2.0)]:
    fill(lambda i,j: (i-cx)**2+(j-cy)**2<r*r,'~')
casc=[(27,4),(36,5),(14,5)]
for (cx,cy) in casc:
    for j in range(0,cy+3):
        for i in (cx,cx+1): G[j][i]='C'
# 2e petit ruisseau depuis la cascade de gauche
for j in range(5,21):
    i=14+int(round(math.sin(j*.6)*1.2))
    G[j][i]='~'; G[j][i+1]='~'
# lac
fill(lambda i,j: ((i-20)/11)**2+((j-39)/11)**2<1 or ((i-26)/6)**2+((j-24)/4)**2<1 ,'~')
fill(lambda i,j: (i-18)**2+(j-40)**2<5,'K')   # statue kelpie
# chemins
def chemin(pts,w=1):
    for (a,b),(c,d) in zip(pts,pts[1:]):
        n=int(max(abs(c-a),abs(d-b))*2)+1
        for t in range(n+1):
            x=a+(c-a)*t/n; y=b+(d-b)*t/n
            for di in range(-w,w+1):
                for dj in range(-w,w+1):
                    ii,jj=int(round(x+di*.5)),int(round(y+dj*.5))
                    if 0<=ii<W and 0<=jj<H and G[jj][ii]=='g': G[jj][ii]='p'
chemin([(59,31),(48,30),(40,24),(33,19),(22,19),(17,21)])   # entrée village -> pont -> rive
chemin([(45,30),(46,36)])                          # vers cromlech / sud
chemin([(4,47),(3,37),(6,26),(13,21),(17,21)])             # entrée cabane -> rive ouest
chemin([(40,24),(45,25)])                                  # vers chalet
# pont de pierre (Sligachan) sur la rivière
for j in range(18,21):
    for i in range(26,33):
        if G[j][i]=='~': G[j][i]='P'
# bâtiments
def bat(i0,j0,w,h,c): fill(lambda i,j: i0<=i<i0+w and j0<=j<j0+h, c)
bat(44,22,4,4,'A'); bat(50,22,4,3,'E')
# bois derrière le chalet
for j in range(8,21):
    for i in range(38,W):
        if G[j][i]=='g' and random.random()<.5: G[j][i]='T'
# pins épars + rive
for j in range(H):
    for i in range(W):
        if G[j][i]=='g' and random.random()<.035: G[j][i]='T'
# cromlech
fill(lambda i,j: abs(math.hypot(i-50,j-39)-4)<.6 and G[j][i] in 'gT' and (math.atan2(j-39,i-50)*12/math.pi)%2<1.1,'O')
fill(lambda i,j: (i-50)**2+(j-39)**2<9 and G[j][i]=='T','g')
# bruyère, ajoncs
for (cx,cy,c) in [(8,13,'b'),(20,10,'b'),(34,30,'b'),(55,44,'b'),(30,44,'b'),(46,12,'b'),(10,44,'y'),(36,11,'y'),(56,33,'y'),(33,38,'y'),(21,15,'y')]:
    r=random.uniform(1.8,2.8)
    fill(lambda i,j: (i-cx)**2+((j-cy)*1.2)**2<r*r and G[j][i] in 'gT', c)
# rendu iso : on ramène le plan dans un carré N×N
N=54
G=[[G[int(j*H/N)][int(i*W/N)] for i in range(N)] for j in range(N)]
W=H=N
hw=30; hh=hw*.543
T=int(N/6*hw*(1-.543**2)**.5/.7071)   # épaisseur = un sixième du côté, vue sous le même angle
X0=H*hw+40; Y0=100
img=Image.new('RGB',(int((W+H)*hw+80),int((W+H)*hh+T+160)),(0,255,0))
d=ImageDraw.Draw(img)
def P(i,j): return (X0+(i-j)*hw, Y0+(i+j)*hh)
col={'g':(108,158,92),'M':(140,140,150),'~':(80,170,215),'C':(200,235,250),'K':(150,150,160),'p':(200,175,225),
'P':(150,120,95),'A':(150,150,160),'E':(150,150,160),'T':(108,158,92),'O':(108,158,92),'b':(190,95,160),'y':(230,195,60)}
for j in range(H):
    for i in range(W):
        d.polygon([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],fill=col[G[j][i]])
# faces avant : herbe, terre, roche ; l'eau du lac en coupe
COUCHES=[(.12,(90,140,75)),(.8,(122,86,60)),(1,(110,78,55))]
def face(a,b,eau,sombre):
    k=.86 if sombre else 1
    t0=0
    for t1,c in COUCHES:
        if eau and t1<=.8: c=(110,185,220) if t1<.2 else (70,150,200)
        c=tuple(int(v*k) for v in c)
        d.polygon([(a[0],a[1]+T*t0),(b[0],b[1]+T*t0),(b[0],b[1]+T*t1),(a[0],a[1]+T*t1)],fill=c)
        t0=t1
for i in range(W): face(P(i,H),P(i+1,H),G[H-1][i]=='~',False)
for j in range(H): face(P(W,j),P(W,j+1),G[j][W-1]=='~',True)
# ronds
for j in range(H):
    for i in range(W):
        x,y=P(i+.5,j+.5)
        g=G[j][i]
        if g=='T': d.ellipse([x-11,y-11,x+11,y+11],fill=(30,70,50))
        if g=='M' and (i+j)%2==0: d.ellipse([x-12,y-12,x+12,y+12],fill=(110,110,122))
        if g=='O': d.ellipse([x-8,y-8,x+8,y+8],fill=(120,150,110),outline=(60,80,60),width=2)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
def lab(i,j,t):
    x,y=P(i*N/60,j*N/48); w=d.textlength(t,font=f)
    d.text((x-w/2,y-11),t,font=f,fill=(255,255,255),stroke_width=3,stroke_fill=(40,40,40))
lab(46,24,'Chalet en A'); lab(52,23.5,"Atelier d'art"); lab(18,40,'Statue du kelpie')
lab(29.5,19.5,'Pont de pierre'); lab(50,39,'Cromlech'); lab(27,9,'Vasques et cascades')
lab(48,14,'Bois'); lab(22,33,'Lac'); lab(3,22,'Montagnes'); lab(59,31.5,'vers le village'); lab(8,49.5,'vers la cabane')
img.save('/mnt/project-files/cryptids-parc/biomes/lac/plan-lac.png')
s=img.copy(); s.thumbnail((1400,1400)); s.save('/tmp/claude-0/-home-claude-cryptids-parc/af7a31c2-4253-517e-b27c-20e579b50415/scratchpad/pl.png')
