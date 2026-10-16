import os
P=os.path.dirname(os.path.abspath(__file__))+'/'
html='''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>Cryptids · Parc</title>
<style>
'''+open(P+'style.css').read()+'''</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>
<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
} }
</script>
</head>
<body>
'''+open(P+'corps.html').read()+'''
<script type="module">
'''+open(P+'app.js').read()+open(P+'decor-atlas.js').read()+open(P+'jeu.js').read()+'''</script>
</body>
</html>
'''
open(P+'../index.html','w').write(html)
open(P+'check.mjs','w').write(open(P+'app.js').read()+open(P+'decor-atlas.js').read()+open(P+'jeu.js').read())   # puis : node --check check.mjs
