# Plans des 4 petits cubes de la région du lac (17/10) : un plan par cube + l'assemblage.
import math, random
from PIL import Image, ImageDraw, ImageFont
random.seed(3)
N=20            # côté d'un cube, en cases (le héros fait 1 case)
T=7             # épaisseur en cases, comme le grand plan (un tiers du côté)
GAP=4           # vide entre deux cubes, franchi par un pont de planches
hw=30; hh=hw*.543; TV=T*hw*(1-.543**2)**.5/.7071
COL={'g':(108,158,92),'M':(140,140,150),'~':(80,170,215),'C':(200,235,250),'p':(200,175,225),
     'P':(150,120,95),'A':(150,150,160),'K':(150,150,160),'O':(108,158,92),'d':(70,120,175)}
def cube(f):
    G=[['g']*N for _ in range(N)]
    f(G); return G
def chemin(G,pts,w=1.1,eau=False):
    for (a,b),(c,e) in zip(pts,pts[1:]):
        n=int(max(abs(c-a),abs(e-b))*3)+1
        for t in range(n+1):
            x=a+(c-a)*t/n; y=b+(e-b)*t/n
            for i in range(N):
                for j in range(N):
                    if (i+.5-x)**2+(j+.5-y)**2<w*w:
                        if G[j][i]=='g': G[j][i]='p'
                        elif G[j][i]=='~' and eau: G[j][i]='P'
def disque(G,cx,cy,r,c,sur='g'):
    for j in range(N):
        for i in range(N):
            if (i+.5-cx)**2+(j+.5-cy)**2<r*r and G[j][i] in sur: G[j][i]=c
# i croît vers le bas à droite, j vers le bas à gauche ; faces visibles : j=N (avant gauche), i=N (avant droite)
def montagnes(G):
    for j in range(N):
        for i in range(N):
            if i+j<9+2*math.sin(i*.7)+ (2 if 6<i<12 else 0): G[j][i]='M'
    for k,(cx,cy,r) in enumerate([(7,6.5,1.8),(9.5,9,2),(12,11.5,2),(15,14,1.8)]):
        disque(G,cx,cy,r,'~','gM')
    for (x,y) in [(5.5,4),(8.5,7.5),(11,10),(13.5,12.5),(16.5,15.5),(18,17.5),(19.4,19.4)]:
        disque(G,x,y,1.1,'~','gMp')
    for j in range(0,6):
        for i in (5,6):
            if G[j][i]=='M': G[j][i]='C'
    chemin(G,[(9.5,19.9),(9.5,16),(12,14.5),(16,13.5),(19.9,14)],eau=True)
def lac(G):
    for j in range(N):
        for i in range(N):
            if ((i+.5-9)/8.5)**2+((j+.5-12)/8)**2<1 or j>=12 and 2<i<16: G[j][i]='~'
    disque(G,9,11,2.2,'d','~')
    chemin(G,[(9.5,0.1),(9.5,2.5),(14,4),(17,7),(19.9,9.5)],1.0)
def bois(G):
    chemin(G,[(0.1,14),(5,12),(10,10),(14,11),(19.9,11)])
    chemin(G,[(10,10),(9.5,19.9)])
    for j in range(5,9):
        for i in range(11,15): G[j][i]='A'
    for j in range(13,16):
        for i in range(12,16): G[j][i]='A'
def cromlech(G):
    chemin(G,[(9.5,0.1),(10,4.5)]); chemin(G,[(0.1,9.5),(4.5,10)]); chemin(G,[(10,15.5),(9.5,19.9)])
CUBES={'montagnes':cube(montagnes),'lac':cube(lac),'bois':cube(bois),'cromlech':cube(cromlech)}
# place des cubes dans l'assemblage (en cases) et ponts entre eux
POS={'montagnes':(0,0),'lac':(0,N+GAP),'bois':(N+GAP,0),'cromlech':(N+GAP,N+GAP)}
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
def dessine(d,G,oi,oj,X0,Y0,nom,seul):
    P=lambda i,j:(X0+(i+oi-j-oj)*hw, Y0+(i+oi+j+oj)*hh)
    for j in range(N):
        for i in range(N):
            d.polygon([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],fill=COL[G[j][i]])
            if G[j][i]=='O':
                x,y=P(i+.5,j+.5); d.ellipse([x-9,y-9,x+9,y+9],fill=(120,150,110),outline=(60,80,60),width=2)
    def face(a,b,eau,k):
        for t0,t1,c in [(0,.12,(90,140,75)),(.12,1,(122,86,60))]:
            if eau and t1==1: c=(70,150,200)
            c=tuple(int(v*k) for v in c)
            d.polygon([(a[0],a[1]+TV*t0),(b[0],b[1]+TV*t0),(b[0],b[1]+TV*t1),(a[0],a[1]+TV*t1)],fill=c)
    for i in range(N): face(P(i,N),P(i+1,N),G[N-1][i] in '~d',1)
    for j in range(N): face(P(N,j),P(N,j+1),G[j][N-1] in '~d',.86)
    FG=lambda i,t:(P(i,N)[0],P(i,N)[1]+TV*t); FD=lambda j,t:(P(N,j)[0],P(N,j)[1]+TV*t)
    def lab(xy,t):
        w=d.textlength(t,font=f); d.text((xy[0]-w/2,xy[1]-11),t,font=f,fill=(255,255,255),stroke_width=3,stroke_fill=(40,40,40))
    NOIR=(45,30,22); OS=(235,228,205)
    if nom=='montagnes':
        a=FD(19.2,0); d.polygon([a,(a[0]+22,a[1]-12),(a[0]+22,a[1]+TV-12),(a[0],a[1]+TV)],fill=(200,235,250))
        lab(P(4,3),'montagnes'); lab(P(8,5.5),'vasques'); lab(P(15,13.6),'pont de pierre'); lab(FD(17,.55),'cascade')
    if nom=='lac':
        d.polygon([FG(7,.45),FG(13,.45),FG(12.2,.75),FG(7.8,.75)],fill=(110,70,40))
        d.line([FG(10,.45),FG(10,.15)],fill=(90,60,35),width=5); d.polygon([FG(10.1,.17),FG(12,.24),FG(10.1,.35)],fill=(60,60,60))
        lab(FG(10,.88),'épave pirate'); (None if seul else (lab(P(9,11),'socle de la statue'))); lab(P(6,7),'lac')
    if nom=='bois':
        g=FD(9,.5); d.ellipse([g[0]-60,g[1]-45,g[0]+60,g[1]+55],fill=NOIR); d.rectangle([g[0]-60,g[1]+5,g[0]+60,g[1]+55],fill=NOIR)
        lab(FD(9,.9),'grotte'); (None if seul else (lab(P(13,7),'chalet en A'), lab(P(14,14.5),'atelier'))); lab(P(4,13),'bois')
    if nom=='cromlech':
        e=FG(15,.3); d.ellipse([e[0]-14,e[1]-10,e[0]+14,e[1]+10],fill=NOIR)
        d.line([FG(15,.3),FG(16.5,.5),FG(14.5,.65),FG(16,.8)],fill=NOIR,width=12)
        c=[FG(3+k*.6,.6-.1*math.sin(k/14*math.pi)) for k in range(15)]
        d.line(c,fill=OS,width=6)
        for (x,y) in c[2:12:2]: d.line([(x,y),(x+4,y+20)],fill=OS,width=4)
        x,y=c[-1]; d.polygon([(x,y-10),(x+40,y),(x,y+8)],fill=OS)
        d.polygon([c[4],(c[4][0]-20,c[4][1]+18),(c[4][0]+5,c[4][1]+10)],fill=OS)
        for k in range(9):
            a=k*2*math.pi/9; x,y=P(10+4.5*math.cos(a),10+4.5*math.sin(a)); d.ellipse([x-10,y-10,x+10,y+10],fill=(120,150,110),outline=(60,80,60),width=2)
        lab(FG(15.5,.92),'terrier'); lab(FG(7,.92),'squelette de mosasaure'); (None if seul else (lab(P(10,10),'cromlech')))
    if seul:   # repère d'échelle : le héros fait une case
        x,y=P(16.5,3.5)
        d.ellipse([x-9,y-4,x+9,y+4],fill=(40,60,40)); d.rectangle([x-5,y-26,x+5,y-2],fill=(120,70,160)); d.ellipse([x-7,y-40,x+7,y-24],fill=(230,200,160))
        lab((x,y+22),'héros')
    return P
# un plan par cube
for nom,G in CUBES.items():
    W=int(2*N*hw+120); H=int(2*N*hh+TV+140)
    im=Image.new('RGB',(W,H),(0,255,0)); d=ImageDraw.Draw(im)
    dessine(d,G,0,0,N*hw+60,60,nom,True)
    im.save(f'/mnt/project-files/cryptids-parc/biomes/lac/cube-{nom}.png')
# assemblage
M=2*N+GAP
im=Image.new('RGB',(int(2*M*hw+120),int(2*M*hh+TV+140)),(16,40,52)); d=ImageDraw.Draw(im)
X0=M*hw+60; Y0=60
PL=(150,105,65)
def pont(i0,j0,i1,j1):
    P=lambda i,j:(X0+(i-j)*hw, Y0+(i+j)*hh)
    d.polygon([P(i0,j0),P(i1,j0),P(i1,j1),P(i0,j1)],fill=PL)
dessine(d,CUBES['montagnes'],*POS['montagnes'],X0,Y0,'montagnes',False)
pont(8.5,N,10.5,N+GAP)                    # montagnes -> lac
pont(N,13,N+GAP,15)                       # montagnes -> bois
for nom in ['lac','bois']:
    oi,oj=POS[nom]; dessine(d,CUBES[nom],oi,oj,X0,Y0,nom,False)
pont(N,N+GAP+8.5,N+GAP,N+GAP+10.5)        # lac -> cromlech
pont(N+GAP+8.5,N,N+GAP+10.5,N+GAP)        # bois -> cromlech
dessine(d,CUBES['cromlech'],*POS['cromlech'],X0,Y0,'cromlech',False)
im.save('/mnt/project-files/cryptids-parc/biomes/lac/assemblage-lac.png')
