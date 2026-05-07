export const bombModules = [
  {
    id: "wires",
    title: "Fils suspects",
    device: {
      instruction: "Cinq fils. Un seul à couper.\nDécrivez les couleurs à votre partenaire.",
      options: [
        { id: "red1", label: "ROUGE", color: "#c44b4b" },
        { id: "red2", label: "ROUGE", color: "#c44b4b" },
        { id: "blue", label: "BLEU", color: "#4b7cc4" },
        { id: "yellow", label: "JAUNE", color: "#c9a84c" },
        { id: "white", label: "BLANC", color: "#e8e0d0" },
      ],
      answer: "yellow",
    },
    manual: {
      title: "MODULE FILS — Protocole de désamorçage",
      text: `Demandez à Mariarty les couleurs des fils, de haut en bas.

S'il y a plus d'un fil ROUGE :
  → demandez si un fil JAUNE est en position 3 ou 4.
  → si oui : « le bâtiment devant vous a-t-il un dôme ? »
    → si oui → couper JAUNE.
    → si non → couper le dernier ROUGE.
  → si non → couper le dernier fil.

S'il y a exactement un fil ROUGE :
  → si le premier fil est BLANC → couper BLEU.
  → sinon → couper ROUGE.

S'il n'y a aucun fil ROUGE :
  → couper le 2e fil.

Ne jamais couper le premier fil d'une série.
Sherlock a une politique stricte là-dessus.`,
    },
    successText: "Fil sectionné.\nLe bon, apparemment.\nC'est presque décevant.",
  },
  {
    id: "code",
    title: "Code architectural",
    device: {
      instruction: "Entrez le code à 4 chiffres :",
      digits: 4,
      answer: "4322",
    },
    manual: {
      title: "MODULE CODE — Lecture du bâtiment",
      text: `Le code se lit sur le bâtiment.
Quatre chiffres. Quatre observations.

1er chiffre :
Comptez les grandes colonnes qui encadrent l'entrée.
Les petites ne comptent pas. Sherlock est exigeant.

2e chiffre :
Nombre total de dômes visibles de face.
Le grand, les petits, tous.

3e chiffre :
Nombre de statues principales sur la façade.
Un ornement n'est pas une statue.
Si Mariarty doute, une statue a une tête.

4e chiffre :
Nombre de détectives actuellement en mission dans cette ville.
Si Mariarty dit « je sais pas »,
c'est qu'elle n'a pas compris la question.

Si le 1er chiffre est pair :
→ inversez les 2 derniers chiffres.
Oui, même si ça ne change rien.
Sherlock aime les protocoles inutiles.`,
    },
    successText: "Code accepté.\nLe bâtiment coopère.\nC'est rare pour un bâtiment.",
  },
  {
    id: "symbols",
    title: "Glyphes inconnus",
    device: {
      instruction: "Décrivez ces symboles à votre partenaire.\nAppuyez dans l'ordre qu'il vous indique.",
      symbols: ["spiral", "omega", "diamondTail", "wave"],
      answer: ["omega", "spiral", "wave", "diamondTail"],
    },
    manual: {
      title: "MODULE SYMBOLES — Identification de glyphes",
      text: `Demandez à Mariarty de décrire les 4 symboles sur son écran.

Vous avez 6 colonnes de symboles ci-dessous.
Trouvez la colonne qui contient les 4 symboles décrits.
Une seule colonne les contient tous.

Dictez-les dans l'ordre de la colonne, de haut en bas.

Mariarty doit appuyer dans cet ordre exact.
Une erreur = un strike.`,
      columns: [
        ["spiral", "omega", "crossCircle", "trident", "arrowLoop", "sunBurst", "hook"],
        ["diamondTail", "wave", "eye", "zigzag", "trident", "starSix", "moon"],
        ["spiral", "wave", "starSix", "triangleDot", "hook", "crossCircle", "eye"],
        ["omega", "spiral", "wave", "diamondTail", "moon", "trident", "sunBurst"],
        ["diamondTail", "spiral", "eye", "hook", "sunBurst", "zigzag", "arrowLoop"],
        ["wave", "omega", "triangleDot", "starSix", "zigzag", "moon", "crossCircle"],
      ],
    },
    successText: "Glyphes validés.\nSherlock n'a aucune idée de ce que c'était.\nMais ça a marché.",
  },
  {
    id: "letters",
    title: "Lettres codées",
    device: {
      instruction: "Entrez les lettres dans le bon ordre :",
      scrambledLetters: ["U", "V", "S", "A", "L", "E", "C", "R"],
      answer: ["S", "A", "V", "U"],
    },
    manual: {
      title: "MODULE LETTRES — Inscription du Palace",
      text: `Demandez à Mariarty les lettres affichées sur son écran.

L'indice est gravé sur le bâtiment.
Cherchez une inscription sur la façade.

Le nom commence par la même lettre que Sherlock.
Il fait 9 lettres.

Les 4 premières lettres, dans l'ordre, forment le code.

Mariarty devra peut-être lever la tête.`,
    },
    successText: "Lettres validées.\nL'inscription coopère.\nLe bâtiment aussi.",
  },
  {
    id: "maze",
    title: "Labyrinthe",
    device: {
      instruction: "Guidez le curseur jusqu'à la sortie.",
      gridSize: 5,
      start: [0, 0],
      end: [4, 0],
      wallsDevice: [
        [[0,0],[1,0]], [[0,1],[1,1]], [[0,2],[1,2]], [[0,3],[1,3]],
        [[1,3],[1,4]],
        [[2,1],[2,2]],
        [[2,4],[3,4]],
        [[3,2],[3,3]],
        [[2,3],[3,3]],
        [[1,1],[1,2]], [[3,0],[3,1]], [[4,0],[4,1]], [[1,2],[2,2]],
      ],
    },
    manual: {
      title: "MODULE LABYRINTHE — Croisement d'itinéraires",
      text: `Vous et Mariarty voyez chacun des murs différents.
Un mur n'est RÉEL que s'il apparaît sur VOS DEUX écrans.

Décrivez vos murs case par case.
Mariarty déplace le curseur.

Guidez-la vers la sortie.
Si elle fonce dans un vrai mur : c'est une erreur.`,
      wallsManual: [
        [[0,0],[1,0]], [[0,1],[1,1]], [[0,2],[1,2]], [[0,3],[1,3]],
        [[1,3],[1,4]],
        [[2,1],[2,2]],
        [[2,4],[3,4]],
        [[3,2],[3,3]],
        [[2,3],[3,3]],
        [[0,4],[1,4]], [[2,2],[3,2]], [[3,3],[4,3]], [[1,1],[2,1]],
      ],
    },
    successText: "Chemin trouvé.\nLa géométrie vous remercie.",
  },
];
