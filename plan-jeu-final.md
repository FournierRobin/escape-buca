# Escape Game Urbain Bucarest — Plan Final

## Vision

Webapp mobile-first pour une balade surprise à Bucarest avec Marion.

**Thème :** Sherlock Holmes. Marion = **Mariarty** — l'acolyte brillante, un peu trop intelligente, légèrement suspecte. Sherlock la recrute pour résoudre des missions absurdes à travers la ville.

**Ton :** drôle, léger, complice, faussement dramatique, jamais trop solennel. Pas de romantisme direct avant le final.

**Objectif réel :** créer une balade mémorable avec mini-jeux, private jokes, pause snack, photos souvenir et final en pédalo.

**Durée :** 30 min à 1h de jeu effectif (+ marche entre les points).

**Distance :** ~2.5 km, Lipscani / Calea Victoriei → Cișmigiu Gardens.

**Contraintes :**
- Aucun QR code ou objet caché sur place — tout passe par l'app
- Jouable à deux sur deux téléphones (sync temps réel)
- GPS quand possible, bouton manuel de secours partout
- Le jeu ne bloque jamais : en cas d'échec, Sherlock donne une blague et débloque la suite

---

## Parcours & flow émotionnel

| # | Lieu | Mission | Émotion |
|---|------|---------|---------|
| 1 | Scovergăria Micăi | Fausse alerte pâtisserie | Mise en route drôle |
| 2 | CEC Palace | La Bombe de Bucarest (coop KTANE) | Grosse mission intense |
| 3 | Pasajul Macca-Vilacrosse | Fausse alerte Mariarty | Respiration + running gag |
| 4 | Calea Victoriei (en marchant) | Rébus PÉ-DAL-O sprint | Chasse aux objets + private joke |
| 5 | Ateneul Român | Pose for duo | Souvenir photo + fragment O |
| 6 | Cișmigiu Gardens (lac) | Assemblage rébus → pédalo → reveal | Final romantico-absurde |

**Running gag :** fausse alerte (mission 1) → vraie bombe (mission 2) → fausse alerte Mariarty (mission 3). Pattern faux-vrai-faux.

---

## Mission 1 — Fausse alerte pâtisserie

**Lieu :** Scovergăria Micăi, Calea Victoriei 14
**Type :** dialogue
**Durée :** ~3 min

### Flow

1. **Alerte dramatique**
```
ALERTE SHERLOCK

Mariarty, activité suspecte détectée à proximité.
Sherlock signale une concentration anormale de farine, sucre
et intentions croustillantes.

Entrez dans le bâtiment. Un indice semble se cacher à l'intérieur.
```
Bouton : `Entrer dans la zone suspecte`

2. **Inspection**
```
Scène localisée. Analyse en cours...
Quand Mariarty est prête, lancez l'inspection.
```
Bouton : `Analyser la scène`

3. **Reveal comique**
```
Fausse alerte.

Ce n'était pas un indice.
C'était juste une pâtisserie.

Mais maintenant qu'on est là...
Tant qu'à faire, prends un truc mdrr.
```
Bouton : `Preuve comestible récupérée`

4. **Succès**
```
Sherlock note officiellement :
Mariarty fonctionne mieux avec du carburant.

Prochaine anomalie détectée : CEC Palace.
```

**Unlock → Mission 2**

---

## Mission 2 — La Bombe de Bucarest

**Lieu :** CEC Palace, Calea Victoriei 11
**Type :** coop-bomb (KTANE)
**Durée :** ~10-15 min

### Concept

Mini-jeu coopératif façon "Keep Talking and Nobody Explodes".
Chaque joueur sur son propre téléphone. Interdiction de montrer son écran.

- **Mariarty** → écran BOMBE (timer, modules interactifs)
- **Sherlock** → écran MANUEL (instructions textuelles pour guider)

Communication orale uniquement.

### Intro

```
MISSION CRITIQUE — LA BOMBE DE BUCAREST

Un dispositif logique a été détecté près du CEC Palace.
Il ne menace pas vraiment Bucarest.
Mais il pourrait sérieusement endommager la réputation de Sherlock.

Cette mission nécessite deux rôles.
```

Boutons :
- `Je suis Mariarty — j'ai la bombe`
- `Je suis Sherlock — j'ai le manuel`

```
Règle absolue :
Mariarty ne doit pas voir le manuel.
Sherlock ne doit pas voir la bombe.

Communiquez clairement.
Ou faites exploser diplomatiquement Bucarest.
```

### Paramètres

- Timer : **7 minutes**
- Erreurs max : **3** (à la 3e → explosion comique)
- 4 modules, dans l'ordre

### Module 1 — Fils suspects

**Écran bombe :**
```
MODULE 1 — FILS SUSPECTS

Coupez un fil :

[ROUGE]  [BLEU]  [JAUNE]  [NOIR]
```

**Écran manuel :**
```
MODULE FILS — Protocole du Passage

Demandez à Mariarty les couleurs des fils.

Si un fil jaune est présent :
→ demandez si l'enquête mentionne un passage ou une lumière étrange.
→ si oui, couper JAUNE.

Sinon :
→ si un fil bleu est présent et qu'un lac est mentionné
  dans le dossier, couper BLEU.
→ sinon couper NOIR.

Ne jamais couper rouge près d'un bâtiment officiel.
Sherlock refuse les incidents diplomatiques.
```

**Réponse : JAUNE**

**Succès module :**
```
Fil jaune sectionné.
Aucune explosion.
C'est presque décevant.
```

### Module 2 — Lettres codées (SAVU)

**Écran bombe :**
```
MODULE 2 — LETTRES CODÉES

Entrez les lettres dans le bon ordre :

[U]  [V]  [S]  [A]  [L]  [E]
```
(6 touches, mélangées. Le joueur doit taper les 4 bonnes dans l'ordre.)

**Écran manuel :**
```
MODULE LETTRES — Inscription du Palace

Demandez à Mariarty quelles lettres sont affichées sur son écran.

L'indice est sur le bâtiment lui-même.
Cherchez une inscription gravée sur la façade du CEC Palace.

Le nom commence par S et fait 9 lettres.
Les 4 premières lettres de ce nom, dans l'ordre, forment le code.
```

**Réponse : S-A-V-U** (de SAVULESCU)

Mariarty voit les lettres mélangées. Sherlock sait qu'il faut chercher l'inscription SAVULESCU sur la façade. Ni l'un ni l'autre ne peut résoudre seul.

**Succès module :**
```
Lettres validées.
L'inscription coopère. Le bâtiment aussi.
```

### Module 3 — Code architectural

**Écran bombe :**
```
MODULE 3 — CODE ARCHITECTURAL

Entrez le code à 4 chiffres :

[_] [_] [_] [_]
```

**Écran manuel :**
```
MODULE CODE — CEC Palace

Le code se lit sur le bâtiment.

1er chiffre :
nombre de grandes colonnes à l'entrée.

2e chiffre :
nombre total de dômes visibles de face, petits inclus.

3e chiffre :
nombre de statues principales à l'entrée.

4e chiffre :
nombre de détectives actuellement en mission.

Si Mariarty répond "je sais pas",
Sherlock autorise un zoom dramatique.
```

**Réponse : 4-3-2-2**

**Succès module :**
```
Code accepté.
Le bâtiment coopère.
C'est rare pour un bâtiment.
```

### Module 4 — Labyrinthe

**Écran bombe :**
Grille 5×5 interactive. Point de départ (vert) et point d'arrivée (rouge). Des murs sont visibles sur la grille. Le joueur peut déplacer un curseur (swipe ou boutons directionnels).

**Écran manuel :**
La même grille 5×5 mais avec des murs différents. Le manuel explique :

```
MODULE LABYRINTHE — Croisement d'itinéraires

Vous et Mariarty voyez chacun des murs différents.
Un mur n'est RÉEL que s'il apparaît sur VOS DEUX écrans.

Décrivez vos murs case par case pour trouver le vrai chemin.

Mariarty déplace le curseur. Guidez-la.
```

Les joueurs doivent communiquer leurs murs respectifs pour déduire quels murs sont réels (intersection des deux grilles). Puis Mariarty navigue le curseur jusqu'à la sortie.

**Validation :** le curseur atteint la case d'arrivée.

**Succès module :**
```
Chemin trouvé.
La géométrie vous remercie.
```

### Échec (3 erreurs)

```
BOUM.

Explosion purement administrative.
Aucun dégât, sauf dans le dossier de réputation de Sherlock.

Mode secours activé :
la bombe révèle quand même l'indice,
parce que Mariarty avait presque raison.
```
→ débloque quand même la suite

### Succès final bombe

```
Bombe désamorcée.

Résultat :
- Bucarest est sauvée.
- Mariarty est officiellement dangereuse avec un téléphone.
- Sherlock a récupéré un indice.

INDICE : PASSAGE JAUNE
```

**Unlock → Mission 3**

---

## Mission 3 — Fausse alerte Mariarty

**Lieu :** Pasajul Macca-Vilacrosse
**Type :** dialogue
**Durée :** ~3 min

### Flow

Running gag : après la fausse alerte de la mission 1, c'est maintenant Mariarty qui "signale" quelque chose.

1. **Alerte**
```
SIGNALEMENT MARIARTY

Sherlock a reçu un message de Mariarty :
"Activité suspecte dans un passage à verrière jaune.
Lumière anormalement dorée. Ambiance de complot."

Rejoignez le passage immédiatement.
```
Bouton : `Entrer dans le passage`

2. **Arrivée**
```
Passage localisé.
Verrière jaune confirmée.
Cafés autour.
Ambiance effectivement suspecte.

Analyse en cours...
```
Bouton : `Analyser la zone`

3. **Reveal**
```
Fausse alerte.
Encore.

Mais Sherlock note :
"Le signalement de Mariarty était impeccable.
Description précise, vocabulaire adapté.
Peut-être trop adapté. Hmm."

Note pour le dossier : Mariarty est soit une excellente
enquêtrice, soit une excellente suspecte.
Les deux options sont acceptables.
```

4. **Transition**
```
Nouvelle piste :
Mariarty doit retrouver un mot découpé en trois fragments.

Fragments connus : PÉ — DAL — ???

Le dernier fragment est encore inconnu.
```

**Unlock → Mission 4**

---

## Mission 4 — Rébus PÉ-DAL-O (sprint)

**Lieu :** Calea Victoriei, en marchant vers l'Ateneul
**Type :** rebus
**Durée :** ~8 min

### Flow

1. **Intro**
```
MISSION — LE MOT VOLÉ

Mariarty, Sherlock a retrouvé un mot découpé en fragments.
Malheureusement, les fragments sont comestibles ou presque.

Trouvez les 2 premiers fragments.
Le dernier arrivera plus tard.
```
Bouton : `Lancer la chasse`

2. **Fragment PÉ**
```
FRAGMENT 1 — PÉ

Trouvez et photographiez quelque chose
qui représente "PÉ" : une pêche, une pâtisserie,
un panneau, ou toute preuve phonétiquement discutable.
```
Bouton : `Preuve PÉ trouvée`

3. **Fragment DAL**
```
FRAGMENT 2 — DAL

Trouvez des lentilles.
Idéalement pour un dahl.
Sherlock sait que c'est le plat préféré de Mariarty.

Un magasin, un restaurant, un menu affiché...
```
Bouton : `Preuve DAL trouvée`

4. **Transition**
```
Fragments PÉ et DAL récupérés.

PÉ + DAL + ??? = ???

Il manque un fragment.
Sherlock murmure :
"La suite n'est pas dans un magasin."
```

**Unlock → Mission 5**

---

## Mission 5 — Pose for duo

**Lieu :** Ateneul Român / statue Mihai Eminescu
**Type :** photo
**Durée :** ~5 min

### Flow

1. **Intro**
```
MISSION — PREUVES PHOTOGRAPHIQUES

Mariarty, Sherlock a besoin de preuves.
Pas des preuves solides.
Des preuves dramatiques.

3 poses de duo à reproduire devant le monument.
Plus c'est ridicule, plus c'est recevable
au tribunal de Sherlock.
```

2. **Pose 1 — Détectives professionnels**
```
POSE 1 — Détectives professionnels

Un de vous pointe un indice invisible.
L'autre regarde dans la mauvaise direction
avec beaucoup de sérieux.

Le monument doit apparaître dans le cadre.
```
Bouton : `Pose 1 validée`

3. **Pose 2 — Duo suspect**
```
POSE 2 — Duo suspect

Mariarty doit avoir l'air d'avoir compris toute l'enquête.
Sherlock doit avoir l'air de faire semblant.

Bonus : expression beaucoup trop dramatique.
```
Bouton : `Pose 2 validée`

4. **Pose 3 — La lettre O**
```
POSE 3 — Mission spéciale

Formez la lettre O avec vos corps.
Bras, jambes, créativité.

Sherlock ne vous explique pas pourquoi.
Faites-le.
```
Bouton : `Pose 3 validée`

5. **Assemblage du rébus**
```
Preuves photographiques acceptées.

Qualité scientifique : discutable.
Qualité émotionnelle : élevée.
Qualité ridicule : excellente.

Un instant...

Sherlock assemble les fragments :

   PÉ  +  DAL  +  O  =  PÉDALO

"Ce mot ne veut rien dire dans une enquête terrestre.
C'est donc forcément important."
```

6. **Transition**
```
Mot récupéré : PÉDALO

Dernière piste détectée : un lieu avec de l'eau.
```

**Unlock → Mission 6**

---

## Mission 6 — Final pédalo

**Lieu :** Cișmigiu Gardens, lac
**Type :** gps-final
**Durée :** ~10 min (marche + pédalo)

### Flow

1. **Marqueur mystère**
Quand mission 5 validée → marqueur ★ apparaît sur la carte au centre du lac de Cișmigiu.

2. **Arrivée au parc**
```
DERNIÈRE POSITION DE SHERLOCK

Coordonnées reçues.
Problème : elles pointent au milieu du lac.

Mariarty, deux hypothèses :
1. Sherlock a été enlevé par un canard.
2. Le mot PÉDALO était important.
```
Bouton : `Afficher le marqueur final`

3. **Carte + marqueur**
Marqueur ★ au centre du lac (~44.4368, 26.0853).
```
Objectif : rejoindre le marqueur.
Moyen recommandé : pédalo.
Moyen déconseillé : nage, panique, téléportation.
```

4. **GPS reveal**
Quand le GPS est à <50m du centre du lac → message final.
Bouton secours : `Sherlock valide le pédalo manuellement`

5. **Message final**
```
MISSION ACCOMPLIE

La vérité :
Sherlock voulait juste une excuse
pour faire du pédalo avec Mariarty.

Bucarest est sauvée.
L'enquête est close.
Le niveau de ridicule est satisfaisant.
```

[GIF kitsch de bisou — volontairement ringard]

```
BON OFFICIEL

Mariarty gagne :
une activité ou un resto de son choix.

Validité : jusqu'à ce que Sherlock
fasse semblant d'avoir oublié.
```

---

## Ton et personnages

### Sherlock
- Faussement sérieux, dramatique, rationnel de manière absurde
- Jamais trop romantique directement
- Exemples :
  - "Sherlock refuse les conclusions hâtives, sauf quand elles sont pratiques."
  - "Indice hautement suspect : il donne envie de manger."
  - "Cette preuve est juridiquement fragile, mais émotionnellement convaincante."

### Mariarty
- Brillante, suspecte dans le bon sens, centre du jeu
- Pas l'ennemie — l'acolyte officielle
- Formulations :
  - "Agent Mariarty"
  - "Votre cerveau est requis."
  - "Sherlock soupçonne Mariarty d'avoir déjà compris la mission."

### À éviter
- Trop de lore avant chaque action
- Puzzles trop longs dans la rue
- Blocages si GPS imprécis
- Romantisme direct avant le final
- Ton trop solennel

---

## Stack technique

- **React + Vite** (JSX)
- **Mapbox GL JS** — carte 3D tiltable, style sombre
- **Supabase Realtime** — sync deux téléphones via room code
- **Geolocation API** — déblocage GPS + pédalo final
- **localStorage** — backup progression
- **Vercel** — déploiement (gratuit, HTTPS)
- **Mobile-first** (100% usage sur téléphone)

### Room system (Supabase)

1. Joueur 1 crée une room → code 4 lettres affiché
2. Joueur 2 entre le code → rejoint la room
3. Progression synchronisée en temps réel
4. Mission bombe : chacun choisit son rôle → écran différent
5. Timer et erreurs synchronisés

### Design

- Fonts : **Cormorant Garamond** (titres) + **DM Mono** (corps)
- Palette :
  - Fond : `#0d0f0e`
  - Or : `#c9a84c`
  - Texte : `#e0d9cc`
  - Résolu : `#4a7c59`
- Animations : shake (erreur), glow (succès), typewriter (texte Sherlock)
- Marqueurs carte : or (actif), gris (verrouillé), vert (résolu), ★ (final)

### Structure des fichiers

```
src/
  App.jsx                  — Router + état global + room system
  components/
    IntroScreen.jsx        — Accueil Mariarty, bouton "Ouvrir le dossier"
    RoomJoin.jsx           — Création/join de room (code partagé)
    MapScreen.jsx          — Carte Mapbox GL + marqueurs + navigation
    MissionScreen.jsx      — Écran mission générique (dialogue, rebus, photo)
    BombDevice.jsx         — Écran bombe (timer, modules interactifs)
    BombManual.jsx         — Écran manuel (instructions textuelles)
    BombMaze.jsx           — Module labyrinthe interactif
    FinalReveal.jsx        — GIF + message perso + bon
  data/
    missions.js            — Config des 6 missions
    bombModules.js         — Config des 4 modules de la bombe
  lib/
    supabase.js            — Client Supabase + fonctions room
    geolocation.js         — Helpers GPS
  styles/
    global.css             — Thème sombre, fonts, animations
```

---

## Données missions

```js
export const missions = [
  {
    id: "scovergaria-fausse-alerte",
    title: "Fausse alerte pâtisserie",
    locationName: "Scovergăria Micăi",
    coordinates: [44.4314, 26.0965],
    radiusMeters: 50,
    type: "dialogue",
    unlocks: "cec-bomb",
  },
  {
    id: "cec-bomb",
    title: "La Bombe de Bucarest",
    locationName: "CEC Palace",
    coordinates: [44.4336, 26.0941],
    radiusMeters: 50,
    type: "coop-bomb",
    unlocks: "passage-mariarty",
  },
  {
    id: "passage-mariarty",
    title: "Fausse alerte Mariarty",
    locationName: "Pasajul Macca-Vilacrosse",
    coordinates: [44.4385, 26.0968],
    radiusMeters: 50,
    type: "dialogue",
    unlocks: "rebus-pedalo",
  },
  {
    id: "rebus-pedalo",
    title: "Le mot volé : PÉ-DAL-O",
    locationName: "Calea Victoriei",
    coordinates: [44.4400, 26.0960],
    radiusMeters: 200,
    type: "rebus",
    unlocks: "pose-for-duo",
  },
  {
    id: "pose-for-duo",
    title: "Preuves photographiques",
    locationName: "Ateneul Român",
    coordinates: [44.4411, 26.0974],
    radiusMeters: 80,
    type: "photo",
    unlocks: "final-pedalo",
  },
  {
    id: "final-pedalo",
    title: "La dernière position de Sherlock",
    locationName: "Cișmigiu Gardens",
    coordinates: [44.4368, 26.0853],
    radiusMeters: 50,
    type: "gps-final",
  },
];
```

---

## Règle d'or

Le jeu doit rester fluide.

Si une mission menace de devenir trop longue, Sherlock doit pouvoir dire une blague et faire avancer l'histoire.

Le but n'est pas de tester Marion.
Le but est de créer une aventure marrante où elle est l'héroïne.
