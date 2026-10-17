
/* ===================== Aventure réelle : 3 indices à QR code par cryptide =====================
   Chaque indice a sa carte à QR code (adresse …/cryptids-parc/?indice=<n° de la créature>-<1 à 3>).
   lieu : où le parent cache la carte SUIVANTE (après l'indice 3 : la carte du cryptide). L'indice 1 se cache où l'on veut.
   vis : le dessin affiché sur le téléphone (VISUELS ci-dessous). */
const INDICES = {
  "1": [ { vis: "poudre", titre: "De la poudre qui brille !", texte: "Elle est tombée des ailes d'un papillon géant. Il adore la lumière…", lieu: "près d'une lampe" },
         { vis: "ampoule", titre: "Une ampoule grignotée !", texte: "Quelqu'un a essayé de manger la lumière. Maintenant, il vole vers le ciel…", lieu: "près d'une fenêtre" },
         { vis: "yeux", titre: "Deux yeux rouges !", texte: "Ils brillent dans le noir et te regardent. Il est tout près…", lieu: "près d'une porte" } ],
  "2": [ { vis: "mouille", titre: "Des traces mouillées !", texte: "Elles font des zigzags : quelque chose est sorti de l'eau en rampant.", lieu: "près d'un robinet ou d'un arrosoir" },
         { vis: "ecaille", titre: "Une écaille bleue !", texte: "Grande comme une main ! Elle aime se cacher en dessous des choses…", lieu: "sous une chaise ou un banc" },
         { vis: "bulles", titre: "Des bulles !", texte: "Ça fait des bulles là-bas. Elle se cache dans les feuilles, comme dans les algues…", lieu: "près d'une plante" } ],
  "3": [ { vis: "plume", titre: "Une plume qui pique !", texte: "Elle fait des étincelles quand on la touche. Cet oiseau géant vole très haut…", lieu: "en hauteur (étagère, rebord)" },
         { vis: "eclair", titre: "Un caillou tout noir !", texte: "Un éclair est tombé ici… mais il n'y a pas d'orage ! L'oiseau aime se poser sur ce qui est grand…", lieu: "près d'un grand meuble ou d'un arbre" },
         { vis: "orage", titre: "Ça gronde !", texte: "Un petit nuage d'orage ! L'oiseau surveille le ciel…", lieu: "près d'une fenêtre" } ],
  "4": [ { vis: "patte", titre: "Des pattes de chien… énormes !", texte: "Un chien grand comme un poney ? Les chiens aiment dormir près de l'entrée…", lieu: "près d'un paillasson ou d'une entrée" },
         { vis: "os", titre: "Un vieil os mâchouillé !", texte: "Il cache ses trésors là où il fait noir…", lieu: "dans un coin sombre" },
         { vis: "grogne", titre: "Grrr… ça grogne !", texte: "Deux yeux turquoise et une fumée froide, tout en bas…", lieu: "sous un meuble (lit, table, buffet)" } ],
  "5": [ { vis: "champignons", titre: "Un rond de champignons !", texte: "C'est la piste de danse des fées. Elles adorent les fleurs…", lieu: "près d'une plante ou de fleurs" },
         { vis: "clochette", titre: "Une clochette minuscule !", texte: "Elle sonne toute seule. La fée adore la musique…", lieu: "près de quelque chose qui fait de la musique (radio, instrument, carillon)" },
         { vis: "notes", titre: "Une petite musique !", texte: "Des notes et des étincelles qui dansent. Suis la petite lumière…", lieu: "près d'une veilleuse ou d'une petite lumière" } ],
  "6": [ { vis: "bogue", titre: "Des bogues de marrons !", texte: "Ouvertes et vides : quelqu'un s'est fait un festin ! Les lutins adorent se cacher dans les chaussures…", lieu: "près des chaussures ou des bottes" },
         { vis: "chapeau", titre: "Un tout petit chapeau !", texte: "Le chapeau pointu d'un tout petit bonhomme. Les lutins aiment les endroits douillets…", lieu: "sous un coussin ou une couverture" },
         { vis: "feuilles", titre: "Des feuilles qui rigolent !", texte: "Elles gigotent et elles chuchotent. Les lutins se cachent dans un panier…", lieu: "dans un panier ou une boîte" } ],
  "7": [ { vis: "lapin", titre: "Des traces de lapin !", texte: "Très loin les unes des autres : il fait des bonds immenses ! Il saute sur les marches…", lieu: "près d'un escalier ou d'une marche" },
         { vis: "bois", titre: "Un petit bois de cerf !", texte: "Un lapin… avec des cornes ? Il a faim de carottes…", lieu: "dans la cuisine ou le potager" },
         { vis: "carotte", titre: "Une carotte croquée !", texte: "Il vient juste de la croquer. Son terrier est tout près…", lieu: "sous une table" } ],
  "8": [ { vis: "pied", titre: "Une empreinte géante !", texte: "Plus grande que tes deux pieds ! Il adore le froid…", lieu: "près du frigo, ou à l'ombre dehors" },
         { vis: "poils", titre: "Des poils blancs tout doux !", texte: "Doux comme une peluche. Il adore les câlins…", lieu: "près d'une peluche ou d'une couverture" },
         { vis: "neige", titre: "Une boule de neige… qui éternue !", texte: "Atchoum ! Il est caché derrière quelque chose de grand…", lieu: "derrière un grand meuble ou un arbre" } ],
  "9": [ { vis: "cailloux", titre: "Des petits cailloux !", texte: "Et de la poussière de pierre. Quelque chose de pierre s'est gratté contre un mur…", lieu: "près d'un mur ou d'une grosse pierre" },
         { vis: "corne", titre: "Une corne en pierre !", texte: "Avec une fleur coincée dedans. Elle aime surveiller dehors…", lieu: "près d'une fenêtre" },
         { vis: "clin", titre: "Un clin d'œil de pierre !", texte: "Cette statue vient de te faire un clin d'œil. Elle est perchée tout en haut…", lieu: "en hauteur (étagère, rebord)" } ],
  "10": [ { vis: "piquants", titre: "Des piquants rouges !", texte: "Ils viennent d'un dos tout piquant. Lui, il a toujours faim…", lieu: "dans la cuisine" },
          { vis: "fruit", titre: "Un fruit tout croqué !", texte: "Il a encore faim ! Il cherche la table du repas…", lieu: "près de la table à manger" },
          { vis: "ventre", titre: "Grrrou… un ventre qui gargouille !", texte: "Il a fouillé partout pour trouver un goûter…", lieu: "près d'un sac ou d'un panier" } ],
  "11": [ { vis: "ventouses", titre: "Des ronds de ventouses !", texte: "Plein de petits ronds collants : une pieuvre est passée par là ! Elle aime l'eau…", lieu: "près de l'eau (évier, lavabo, arrosoir)" },
          { vis: "piece", titre: "Une pièce d'or !", texte: "Elle est tombée de son trésor. Elle range ses trésors dans un coffre…", lieu: "près d'une boîte ou d'un coffre" },
          { vis: "tentacule", titre: "Un tentacule qui fait coucou !", texte: "Coucou ! Il dépasse de quelque chose de tout plat…", lieu: "sous un tapis ou une serviette" } ],
  "12": [ { vis: "palme", titre: "Des pieds palmés pleins de boue !", texte: "Des pieds de grenouille, mais énormes ! Il adore les bottes sales…", lieu: "près des bottes ou des chaussures" },
          { vis: "nenuphar", titre: "Une feuille de nénuphar !", texte: "Elle est tombée de sa tête en marchant. Il cherche des plantes…", lieu: "près d'une plante" },
          { vis: "boue", titre: "Bloup, bloup… de la boue !", texte: "Elle fait des bulles, et deux yeux te regardent ! Il veut prendre un bain de boue…", lieu: "près d'un seau, d'une bassine ou de la baignoire" } ]
};

/* ---------- Les dessins des indices (SVG, 120 × 120) ---------- */
const VIS = (() => {
  const C = { cyan: "#4ff3ff", menthe: "#9dffc8", vert: "#00ffcc", orange: "#ffb347", violet: "#e58cff", rouge: "#ff4d5e", brume: "#d8f7f5", nuit: "#04121a", or: "#ffd34d", boue: "#8a6a3c", pierre: "#9aa7a8" };
  const g = (s, x, y, r = 0, k = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})">${s}</g>`;
  const pattechien = c => `<ellipse cx="0" cy="6" rx="9" ry="8" fill="${c}"/><ellipse cx="-10" cy="-6" rx="3.6" ry="4.6" fill="${c}"/><ellipse cx="-3.6" cy="-11" rx="3.6" ry="4.8" fill="${c}"/><ellipse cx="3.6" cy="-11" rx="3.6" ry="4.8" fill="${c}"/><ellipse cx="10" cy="-6" rx="3.6" ry="4.6" fill="${c}"/>`;
  const piedlapin = c => `<ellipse cx="0" cy="0" rx="4" ry="10" fill="${c}"/><circle cx="0" cy="-13" r="3" fill="${c}"/>`;
  const palme = c => `<path d="M0 14 C-8 10 -12 2 -14 -12 L-7 -4 L-4 -16 L0 -5 L4 -16 L7 -4 L14 -12 C12 2 8 10 0 14Z" fill="${c}"/>`;
  const etincelle = (x, y, r, c) => `<path d="M${x} ${y - r}L${x + r * .28} ${y - r * .28}L${x + r} ${y}L${x + r * .28} ${y + r * .28}L${x} ${y + r}L${x - r * .28} ${y + r * .28}L${x - r} ${y}L${x - r * .28} ${y - r * .28}Z" fill="${c}"/>`;
  const d = {
    poudre: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<circle cx="${22 + i * 10}" cy="${88 - i * 7 + (i % 2) * 8}" r="${2 + (i % 3)}" fill="${C.orange}"/>`).join("") + etincelle(92, 30, 10, C.or) + etincelle(70, 50, 6, C.orange) + etincelle(40, 62, 5, C.or),
    ampoule: `<path d="M60 18 C40 18 32 34 34 48 C36 60 46 66 48 76 L72 76 C74 66 84 60 86 48 C88 34 80 18 60 18Z" fill="${C.or}" opacity=".9"/><circle cx="86" cy="40" r="10" fill="${C.nuit}"/><circle cx="80" cy="54" r="7" fill="${C.nuit}"/><rect x="48" y="78" width="24" height="8" rx="2" fill="${C.pierre}"/><rect x="50" y="88" width="20" height="7" rx="2" fill="${C.pierre}"/><path d="M52 60 L56 46 L60 58 L64 46 L68 60" stroke="${C.orange}" stroke-width="3" fill="none"/>`,
    yeux: `<ellipse cx="60" cy="60" rx="50" ry="30" fill="#000" opacity=".5"/><ellipse cx="40" cy="58" rx="13" ry="10" fill="${C.rouge}"/><ellipse cx="80" cy="58" rx="13" ry="10" fill="${C.rouge}"/><circle cx="40" cy="58" r="4" fill="#fff"/><circle cx="80" cy="58" r="4" fill="#fff"/><path d="M14 40 Q30 28 46 42 M106 40 Q90 28 74 42" stroke="${C.violet}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    mouille: `<ellipse cx="86" cy="98" rx="28" ry="9" fill="${C.cyan}" opacity=".35"/><path d="M84 96 L40 80 L84 62 L40 44 L72 28" stroke="${C.cyan}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>` + [[24, 66], [98, 46], [54, 18], [100, 76]].map(([x, y]) => `<path d="M${x} ${y - 9} C${x + 5} ${y - 2} ${x + 7} ${y + 3} ${x + 7} ${y + 6} A7 7 0 0 1 ${x - 7} ${y + 6} C${x - 7} ${y + 3} ${x - 5} ${y - 2} ${x} ${y - 9}Z" fill="${C.menthe}"/>`).join(""),
    ecaille: `<path d="M60 16 C88 30 96 60 60 104 C24 60 32 30 60 16Z" fill="#1fb5a8"/><path d="M60 26 C80 38 84 60 60 92 C36 60 40 38 60 26Z" fill="${C.cyan}" opacity=".6"/><path d="M60 30 L60 90 M46 48 Q60 58 74 48 M44 64 Q60 74 76 64" stroke="${C.nuit}" stroke-width="2" fill="none" opacity=".5"/>`,
    bulles: `<ellipse cx="60" cy="92" rx="44" ry="10" fill="none" stroke="${C.cyan}" stroke-width="3"/><ellipse cx="60" cy="92" rx="26" ry="6" fill="none" stroke="${C.cyan}" stroke-width="3" opacity=".6"/>` + [[60, 70, 9], [44, 50, 6], [74, 44, 7], [56, 28, 5], [82, 22, 4], [38, 24, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.menthe}" stroke-width="3"/>`).join(""),
    plume: `<path d="M30 100 C40 60 70 26 98 16 C92 44 70 80 30 100Z" fill="#3a8dff"/><path d="M30 100 L92 22" stroke="${C.brume}" stroke-width="3"/><path d="M50 72 L40 60 M62 58 L54 44 M74 44 L68 32 M56 80 L70 80 M68 66 L82 64" stroke="${C.nuit}" stroke-width="2" opacity=".5"/>` + etincelle(96, 50, 9, C.or) + etincelle(22, 70, 7, C.or) + etincelle(80, 90, 6, C.cyan),
    eclair: `<ellipse cx="60" cy="96" rx="36" ry="12" fill="#2a2f33"/><ellipse cx="60" cy="92" rx="24" ry="10" fill="#14181b"/><path d="M66 10 L42 56 L58 56 L48 92 L80 44 L62 44 L74 10Z" fill="${C.or}"/>` + etincelle(28, 80, 6, C.cyan) + etincelle(92, 78, 6, C.cyan),
    orage: `<path d="M30 64 A16 16 0 0 1 36 34 A22 22 0 0 1 78 28 A18 18 0 0 1 96 62 Z" fill="#5d6b8a"/><path d="M60 62 L48 86 L60 86 L52 108 L74 78 L62 78 L70 62Z" fill="${C.or}"/>` + [[34, 76], [86, 74], [96, 92]].map(([x, y]) => `<path d="M${x} ${y} l-4 10" stroke="${C.cyan}" stroke-width="3" stroke-linecap="round"/>`).join(""),
    patte: g(pattechien(C.vert), 40, 86, -15, 1.4) + g(pattechien(C.vert), 80, 40, 10, 1.4) + `<path d="M24 60 q10 -8 20 0 M60 104 q10 -8 20 0" stroke="${C.cyan}" stroke-width="3" fill="none" opacity=".6"/>`,
    os: g(`<rect x="-30" y="-7" width="60" height="14" rx="6" fill="${C.brume}"/><circle cx="-32" cy="-8" r="9" fill="${C.brume}"/><circle cx="-32" cy="8" r="9" fill="${C.brume}"/><circle cx="32" cy="-8" r="9" fill="${C.brume}"/><circle cx="32" cy="8" r="9" fill="${C.brume}"/><path d="M-10 -7 l4 6 l4 -6 M8 7 l4 -6 l4 6" stroke="${C.pierre}" stroke-width="2" fill="none"/>`, 60, 60, -25, 1.1),
    grogne: `<rect x="10" y="30" width="100" height="10" rx="3" fill="#3b2a1c"/><rect x="16" y="40" width="8" height="40" fill="#3b2a1c"/><rect x="96" y="40" width="8" height="40" fill="#3b2a1c"/><ellipse cx="48" cy="62" rx="8" ry="5" fill="${C.vert}"/><ellipse cx="72" cy="62" rx="8" ry="5" fill="${C.vert}"/><path d="M14 92 Q30 82 46 92 T78 92 T110 92" stroke="${C.cyan}" stroke-width="4" fill="none" opacity=".7"/><path d="M20 104 Q36 96 52 104 T84 104" stroke="${C.cyan}" stroke-width="3" fill="none" opacity=".4"/>`,
    champignons: `<ellipse cx="60" cy="72" rx="44" ry="18" fill="none" stroke="${C.menthe}" stroke-width="2" stroke-dasharray="3 5"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => { const a = i / 7 * Math.PI * 2, x = 60 + Math.cos(a) * 44, y = 72 + Math.sin(a) * 18; return g(`<rect x="-2.5" y="-2" width="5" height="10" fill="${C.brume}"/><path d="M-9 -1 A9 8 0 0 1 9 -1Z" fill="${C.rouge}"/><circle cx="-3" cy="-5" r="1.5" fill="#fff"/><circle cx="3" cy="-4" r="1.2" fill="#fff"/>`, x, y - 4, 0, 1.2); }).join("") + etincelle(60, 40, 8, C.violet),
    clochette: `<path d="M60 20 C42 20 38 40 38 56 C38 70 32 76 28 80 L92 80 C88 76 82 70 82 56 C82 40 78 20 60 20Z" fill="${C.or}"/><circle cx="60" cy="88" r="7" fill="${C.or}"/><circle cx="60" cy="16" r="5" fill="none" stroke="${C.or}" stroke-width="3"/><path d="M18 44 q-6 10 0 20 M102 44 q6 10 0 20 M10 38 q-8 16 0 32 M110 38 q8 16 0 32" stroke="${C.cyan}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    notes: `<path d="M36 84 L36 34 L66 26 L66 76" stroke="${C.violet}" stroke-width="4" fill="none"/><ellipse cx="30" cy="86" rx="8" ry="6" fill="${C.violet}"/><ellipse cx="60" cy="78" rx="8" ry="6" fill="${C.violet}"/><path d="M36 34 L66 26 L66 34 L36 42Z" fill="${C.violet}"/><path d="M88 60 L88 24 Q96 30 100 36" stroke="${C.menthe}" stroke-width="4" fill="none"/><ellipse cx="82" cy="62" rx="7" ry="5" fill="${C.menthe}"/>` + etincelle(96, 84, 7, C.or) + etincelle(20, 30, 6, C.or) + etincelle(80, 100, 4, C.cyan),
    bogue: [[34, 76], [76, 70], [56, 44]].map(([x, y]) => g(`<circle r="16" fill="#7fae3a"/>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${Math.cos(a) * 14} ${Math.sin(a) * 14} L${Math.cos(a) * 22} ${Math.sin(a) * 22}" stroke="#a7d65a" stroke-width="2.5"/>`; }).join("") + `<path d="M-10 -4 Q0 -14 10 -4 Q0 4 -10 -4Z" fill="#5b3a1e"/>`, x, y)).join(""),
    chapeau: `<path d="M60 14 C66 40 78 66 92 84 L28 84 C40 66 52 42 60 14Z" fill="#e8742c"/><path d="M60 14 C58 8 50 6 46 10" stroke="#e8742c" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="86" rx="42" ry="9" fill="#5fae3a"/><rect x="34" y="70" width="52" height="8" fill="${C.or}"/>`,
    feuilles: [[30, 84, -30, "#e8742c"], [56, 88, 10, "#d4462b"], [86, 82, 40, "#f0b030"], [44, 64, 60, "#f0b030"], [76, 64, -50, "#e8742c"], [60, 48, 0, "#d4462b"]].map(([x, y, r, c]) => g(`<path d="M0 -18 C14 -8 14 8 0 18 C-14 8 -14 -8 0 -18Z" fill="${c}"/><path d="M0 -16 L0 16" stroke="${C.nuit}" stroke-width="1.5" opacity=".4"/>`, x, y, r)).join("") + `<text x="60" y="22" text-anchor="middle" font-size="15" fill="${C.menthe}" font-family="Georgia">hi hi</text>`,
    lapin: [[18, 104, 20], [44, 72, 20], [72, 46, 30], [98, 22, 35]].map(([x, y, r]) => g(piedlapin(C.menthe) + g(piedlapin(C.menthe), 12, 4), x, y, r, 1.15)).join(""),
    bois: `<path d="M44 104 C40 80 46 60 60 46 C66 40 70 30 68 16 M58 52 C48 44 40 36 36 22 M62 72 C74 64 86 60 96 46 M80 62 C84 52 84 44 82 36" stroke="#c9a46a" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    carotte: `<path d="M30 92 L76 40 C84 34 92 40 88 50 Z" fill="#ff8a2a"/><path d="M38 76 l8 4 M50 62 l8 4 M62 50 l7 4" stroke="#c45a10" stroke-width="2"/><circle cx="30" cy="92" r="9" fill="${C.nuit}"/><circle cx="40" cy="84" r="6" fill="${C.nuit}"/><path d="M84 40 C88 26 84 18 78 14 M86 44 C98 36 104 30 106 22 M88 46 C100 46 108 42 112 36" stroke="#5fae3a" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    pied: g(`<path d="M0 -40 C18 -40 24 -20 22 0 C20 24 14 40 0 42 C-14 40 -20 24 -20 0 C-22 -20 -16 -40 0 -40Z" fill="${C.brume}"/>` + [[-16, -48, 6], [-4, -54, 7], [9, -52, 6], [19, -45, 5], [25, -36, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.brume}"/>`).join(""), 60, 66, 8, 1) + `<path d="M8 110 L112 110" stroke="${C.cyan}" stroke-width="2" opacity=".5"/>`,
    poils: `<path d="M24 30 L96 30" stroke="#6b4a2a" stroke-width="7" stroke-linecap="round"/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${44 + i * 3} 32 C${40 + i * 4} 56 ${36 + i * 5} 76 ${30 + i * 6} ${92 + (i % 3) * 6}" stroke="${C.brume}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join(""),
    neige: `<circle cx="60" cy="64" r="36" fill="${C.brume}"/><circle cx="46" cy="56" r="4" fill="${C.nuit}"/><circle cx="72" cy="56" r="4" fill="${C.nuit}"/><path d="M50 76 Q60 70 70 76" stroke="${C.nuit}" stroke-width="3" fill="none"/>` + [[14, 30], [104, 26], [100, 96], [18, 92], [60, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.brume}" opacity=".8"/>`).join("") + `<text x="60" y="20" text-anchor="middle" font-size="15" fill="${C.cyan}" font-family="Georgia">atchoum !</text>`,
    cailloux: `<rect x="76" y="10" width="34" height="100" fill="#55606a"/><path d="M76 30 h34 M76 54 h34 M76 78 h34 M93 10 v20 M86 30 v24 M100 54 v24 M90 78 v32" stroke="#3a434b" stroke-width="2"/>` + [[26, 98, 8], [44, 102, 6], [58, 96, 5], [36, 88, 4], [64, 104, 7]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="${C.pierre}"/>`).join("") + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${50 + i * 4}" cy="${30 + i * 9}" r="1.8" fill="${C.pierre}"/>`).join(""),
    corne: `<path d="M30 100 C34 70 56 40 92 22 C80 46 70 72 66 100Z" fill="${C.pierre}"/><path d="M40 86 l20 0 M46 70 l18 2 M56 54 l16 2" stroke="#6c7779" stroke-width="3"/>` + [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return `<ellipse cx="${84 + Math.cos(a) * 8}" cy="${30 + Math.sin(a) * 8}" rx="6" ry="4" transform="rotate(${i * 72} ${84 + Math.cos(a) * 8} ${30 + Math.sin(a) * 8})" fill="${C.violet}"/>`; }).join("") + `<circle cx="84" cy="30" r="4" fill="${C.or}"/>`,
    clin: `<path d="M20 70 C20 34 40 18 60 18 C80 18 100 34 100 70 L100 104 L20 104Z" fill="${C.pierre}"/><path d="M28 28 L20 8 L40 20 M92 28 L100 8 L80 20" fill="${C.pierre}"/><circle cx="44" cy="58" r="9" fill="${C.vert}"/><circle cx="44" cy="58" r="4" fill="${C.nuit}"/><path d="M68 58 Q76 52 86 58" stroke="${C.nuit}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M48 84 Q60 90 72 84" stroke="#6c7779" stroke-width="3" fill="none"/>`,
    piquants: [[30, 96, -20], [48, 98, -5], [64, 96, 8], [82, 98, 22], [40, 82, -12], [72, 84, 14], [56, 80, 0]].map(([x, y, r]) => g(`<path d="M-4 0 L0 -30 L4 0Z" fill="${C.rouge}"/>`, x, y, r)).join("") + `<ellipse cx="56" cy="100" rx="46" ry="8" fill="#d8b46a" opacity=".6"/>`,
    fruit: `<circle cx="56" cy="64" r="34" fill="#e2384a"/><circle cx="88" cy="56" r="13" fill="${C.nuit}"/><circle cx="84" cy="76" r="10" fill="${C.nuit}"/><path d="M56 30 C56 22 60 16 66 14" stroke="#6b4a2a" stroke-width="4" fill="none"/><path d="M60 22 C70 12 84 14 86 20 C76 26 66 26 60 22Z" fill="#5fae3a"/><path d="M78 58 l4 4 M76 70 l4 3" stroke="#fff3c4" stroke-width="3"/>`,
    ventre: `<circle cx="60" cy="68" r="34" fill="#c9566a"/><circle cx="60" cy="68" r="22" fill="#e5899a"/><path d="M48 60 q6 6 12 0 q6 -6 12 0 M48 72 q6 6 12 0 q6 -6 12 0" stroke="#8a2a3c" stroke-width="3" fill="none"/><text x="60" y="24" text-anchor="middle" font-size="15" fill="${C.or}" font-family="Georgia">grrrou…</text>`,
    ventouses: `<path d="M8 96 Q40 70 70 80 Q100 90 112 70 L112 112 L8 112Z" fill="#55606a"/>` + [[24, 30, 9], [46, 24, 7], [64, 34, 10], [86, 26, 8], [36, 52, 7], [58, 58, 8], [80, 52, 9], [100, 46, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.violet}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * .35}" fill="${C.violet}"/>`).join(""),
    piece: `<circle cx="60" cy="58" r="36" fill="${C.or}"/><circle cx="60" cy="58" r="28" fill="none" stroke="#c9952a" stroke-width="3"/><path d="M60 36 L66 51 L82 52 L70 62 L74 78 L60 69 L46 78 L50 62 L38 52 L54 51Z" fill="#c9952a"/>` + etincelle(96, 22, 9, "#fff") + `<path d="M20 106 C26 96 38 94 44 102 C38 110 26 112 20 106Z" fill="#ffd6e0"/>`,
    tentacule: `<path d="M44 112 C40 80 50 60 62 50 C74 40 76 26 66 20 C58 16 52 24 58 30" stroke="${C.violet}" stroke-width="16" fill="none" stroke-linecap="round"/>` + [[50, 92], [52, 74], [60, 58], [72, 44]].map(([x, y]) => `<circle cx="${x + 8}" cy="${y}" r="3.5" fill="#ffd6f7"/>`).join("") + `<path d="M6 104 Q30 94 56 104 T112 104" stroke="${C.cyan}" stroke-width="4" fill="none"/>`,
    palme: g(palme(C.boue), 40, 86, -20, 1.5) + g(palme(C.boue), 84, 40, 15, 1.5) + [[60, 70], [100, 80], [24, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.boue}" opacity=".7"/>`).join(""),
    nenuphar: `<path d="M60 64 L104 54 A46 30 0 1 1 100 44Z" fill="#3c9a4a"/><path d="M60 64 L22 52 M60 64 L40 88 M60 64 L84 90" stroke="#2c7a38" stroke-width="2"/>` + [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="60" cy="42" rx="5" ry="14" transform="rotate(${i * 30 - 75} 60 54)" fill="#ffc0dd"/>`).join("") + `<circle cx="60" cy="52" r="5" fill="${C.or}"/>`,
    boue: `<ellipse cx="60" cy="80" rx="50" ry="22" fill="${C.boue}"/><ellipse cx="60" cy="80" rx="38" ry="14" fill="#6e522c"/>` + [[40, 74, 6], [72, 82, 5], [86, 70, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#c9a46a" stroke-width="2.5"/>`).join("") + `<circle cx="52" cy="62" r="6" fill="#fff"/><circle cx="68" cy="62" r="6" fill="#fff"/><circle cx="53" cy="63" r="3" fill="${C.nuit}"/><circle cx="69" cy="63" r="3" fill="${C.nuit}"/><text x="60" y="30" text-anchor="middle" font-size="15" fill="${C.menthe}" font-family="Georgia">bloup !</text>`
  };
  return d;
})();
const VISUELS = new Proxy(VIS, { get: (o, k) => '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + (o[k] || "") + "</svg>" });

// lit « 3-2 » (adresse du QR code) en { k: "3", i: 2 }
function lireIndice(code) {
  let v = null; try { v = new URL(code, location.href).searchParams.get("indice"); } catch (e) {}
  const m = /^(\d{1,2})-([123])$/.exec(v || "");
  return m && INDICES[m[1]] ? { k: m[1], i: +m[2] } : null;
}
const indicesTrouves = k => (((partie() || {}).indices || {})[k] || []);
function noterIndice(k, i) { majPartie(p => { p.indices = p.indices || {}; const l = p.indices[k] = p.indices[k] || []; if (!l.includes(i)) l.push(i); }); }

// l'œil magique a lu la carte d'un indice : on l'affiche par-dessus la caméra
function montrerIndice(k, i, retour) {
  const ind = INDICES[k][i - 1], deja = indicesTrouves(k).length;
  noterIndice(k, i);
  const n = indicesTrouves(k).length;
  $("indiceNum").textContent = "Indice " + i + " / 3";
  $("indiceVisuel").innerHTML = VISUELS[ind.vis];
  $("indiceTitre").textContent = ind.titre;
  $("indiceTexte").textContent = ind.texte;
  $("indiceLieuTitre").textContent = i < 3 ? "Le prochain indice est caché…" : "Le cryptide se cache…";
  $("indiceLieu").textContent = ind.lieu;
  $("indiceAvance").innerHTML = [1, 2, 3].map(j => '<i class="' + (indicesTrouves(k).includes(j) ? "ok" : "") + '"></i>').join("");
  $("indiceAutre").hidden = !(i > 1 && deja < i - 1 && n < i);
  $("indice").hidden = false; $("viseur").hidden = true;
  sfx(i < 3 ? "revele" : "proche"); if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  $("indiceOk").onclick = () => { $("indice").hidden = true; sfx("clic"); retour(); };
}

// pour les parents : où cacher chaque carte, du 1er indice jusqu'au cryptide
function cheminIndices(k) {
  const l = INDICES[k];
  return '<li><b>n° ' + k + '</b> ' + TRAQUES[k].nom.split(",")[0] + '<ol class="chemin">'
    + '<li>Indice 1 : où vous voulez, pour commencer</li>'
    + '<li>Indice 2 : ' + l[0].lieu + '</li>'
    + '<li>Indice 3 : ' + l[1].lieu + '</li>'
    + '<li>Carte du cryptide : ' + l[2].lieu + '</li></ol></li>';
}

// carte d'indice scannée avec l'appareil photo du téléphone (hors de l'appli)
{ const d = lireIndice(location.href);
  if (d) $("intro-accueil").textContent = "Tu as trouvé un indice ! Ouvre l'œil magique et vise de nouveau la carte pour le lire."; }
