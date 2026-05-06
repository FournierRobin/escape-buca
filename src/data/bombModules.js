export const bombModules = [
  {
    id: "wires",
    title: "Fils suspects",
    device: {
      instruction: "Coupez un fil :",
      options: [
        { id: "red", label: "ROUGE", color: "#c44b4b" },
        { id: "blue", label: "BLEU", color: "#4b7cc4" },
        { id: "yellow", label: "JAUNE", color: "#c9a84c" },
        { id: "black", label: "NOIR", color: "#333" },
      ],
      answer: "yellow",
    },
    manual: {
      title: "MODULE FILS — Protocole du Passage",
      text: "Demandez à Mariarty les couleurs des fils.\n\nSi un fil jaune est présent :\n→ demandez si l'enquête mentionne un passage ou une lumière étrange.\n→ si oui, couper JAUNE.\n\nSinon :\n→ si un fil bleu est présent et qu'un lac est mentionné dans le dossier, couper BLEU.\n→ sinon couper NOIR.\n\nNe jamais couper rouge près d'un bâtiment officiel.\nSherlock refuse les incidents diplomatiques.",
    },
    successText: "Fil jaune sectionné.\nAucune explosion.\nC'est presque décevant.",
  },
  {
    id: "letters",
    title: "Lettres codées",
    device: {
      instruction: "Entrez les lettres dans le bon ordre :",
      scrambledLetters: ["U", "V", "S", "A", "L", "E"],
      answer: ["S", "A", "V", "U"],
    },
    manual: {
      title: "MODULE LETTRES — Inscription du Palace",
      text: "Demandez à Mariarty quelles lettres sont affichées sur son écran.\n\nL'indice est sur le bâtiment lui-même.\nCherchez une inscription gravée sur la façade du CEC Palace.\n\nLe nom commence par S et fait 9 lettres.\nLes 4 premières lettres de ce nom, dans l'ordre, forment le code.",
    },
    successText: "Lettres validées.\nL'inscription coopère. Le bâtiment aussi.",
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
      title: "MODULE CODE — CEC Palace",
      text: "Le code se lit sur le bâtiment.\n\n1er chiffre :\nnombre de grandes colonnes à l'entrée.\n\n2e chiffre :\nnombre total de dômes visibles de face, petits inclus.\n\n3e chiffre :\nnombre de statues principales à l'entrée.\n\n4e chiffre :\nnombre de détectives actuellement en mission.\n\nSi Mariarty répond \"je sais pas\",\nSherlock autorise un zoom dramatique.",
    },
    successText: "Code accepté.\nLe bâtiment coopère.\nC'est rare pour un bâtiment.",
  },
  {
    id: "maze",
    title: "Labyrinthe",
    device: {
      instruction: "Guidez le curseur jusqu'à la sortie.",
      gridSize: 5,
      start: [0, 0],
      end: [4, 4],
      wallsDevice: [
        [[0,0],[1,0]], [[1,0],[1,1]], [[2,0],[2,1]],
        [[0,1],[0,2]], [[2,1],[3,1]], [[3,1],[3,2]],
        [[1,2],[1,3]], [[3,2],[4,2]],
        [[0,3],[1,3]], [[2,3],[2,4]], [[4,3],[4,4]],
        [[1,4],[2,4]],
      ],
    },
    manual: {
      title: "MODULE LABYRINTHE — Croisement d'itinéraires",
      text: "Vous et Mariarty voyez chacun des murs différents.\nUn mur n'est RÉEL que s'il apparaît sur VOS DEUX écrans.\n\nDécrivez vos murs case par case pour trouver le vrai chemin.\nMariarty déplace le curseur. Guidez-la.",
      wallsManual: [
        [[0,0],[1,0]], [[2,0],[3,0]],
        [[0,1],[0,2]], [[1,1],[2,1]], [[3,1],[3,2]],
        [[1,2],[1,3]], [[2,2],[3,2]], [[4,2],[4,3]],
        [[0,3],[1,3]], [[3,3],[3,4]],
        [[1,4],[2,4]], [[3,4],[4,4]],
      ],
    },
    successText: "Chemin trouvé.\nLa géométrie vous remercie.",
  },
];
