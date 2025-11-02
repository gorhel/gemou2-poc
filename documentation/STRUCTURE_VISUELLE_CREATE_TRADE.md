# 🎨 Structure Visuelle de /create-trade

## 📐 Vue d'ensemble

Voici à quoi la page `/create-trade` doit ressembler, élément par élément :

---

## 🌳 Tree Structure

```
Page: /create-trade
│
├── 🔙 Bouton "Retour"
│   └── [← Retour]
│
├── 📋 En-tête
│   ├── Titre : "Créer une annonce"
│   └── Sous-titre : "Vendez ou échangez vos jeux de société"
│
└── 📦 Card (Formulaire principal)
    │
    ├── ⚠️ Zone d'erreur (si erreur générale)
    │   └── [Message d'erreur en rouge]
    │
    ├── 1️⃣ TYPE DE TRANSACTION
    │   ├── Label : "Type de transaction"
    │   └── 2 boutons côte à côte :
    │       ├── [💰 Vente]     ← bouton sélectionné par défaut
    │       └── [🔄 Échange]
    │
    ├── 2️⃣ TITRE
    │   ├── Label : "Titre de l'annonce *"
    │   ├── Input texte
    │   │   └── Placeholder : "Ex: Catan - Extension Marins"
    │   └── [Message d'erreur si invalide]
    │
    ├── 3️⃣ JEU (Composant GameSelect)
    │   ├── Label : "Identification du jeu *"
    │   ├── Input avec recherche
    │   │   ├── Placeholder : "Rechercher un jeu..."
    │   │   ├── Icône loupe à droite
    │   │   └── Dropdown qui apparaît lors de la saisie :
    │   │       ├── [Liste de jeux avec photos]
    │   │       ├── [Jeu 1]
    │   │       ├── [Jeu 2]
    │   │       ├── ...
    │   │       └── [➕ Mon jeu n'est pas dans la liste]
    │   └── OU Input texte personnalisé (si "Mon jeu n'est pas dans la liste" cliqué)
    │       └── [← Retour à la recherche]
    │
    ├── 4️⃣ ÉTAT
    │   ├── Label : "État du jeu *"
    │   └── Select dropdown
    │       ├── Neuf
    │       ├── Très bon état
    │       ├── Bon état  ← sélectionné par défaut
    │       ├── État correct
    │       └── Usé
    │
    ├── 5️⃣ DESCRIPTION
    │   ├── Label : "Description"
    │   ├── Textarea (4 lignes)
    │   └── Placeholder : "Décrivez l'état du jeu, ce qui est inclus, etc."
    │
    ├── 6️⃣ LOCALISATION (Composant LocationAutocomplete)
    │   ├── Label : "Localisation"
    │   ├── Input avec autocomplete
    │   │   ├── Placeholder : "Ex: Le Moufia, Saint-Denis"
    │   │   ├── Icône localisation à droite
    │   │   └── Dropdown avec suggestions :
    │   │       ├── [📍 Saint-Denis]
    │   │       ├── [📍 Le Moufia, Saint-Denis]
    │   │       ├── [📍 Bellepierre, Saint-Denis]
    │   │       └── ...
    │   └── Texte d'aide : "Localisation à La Réunion"
    │
    ├── 7️⃣ PHOTOS (Composant ImageUpload) ⚠️ VOUS NE VOYEZ PAS CECI
    │   ├── Label : "Photos (0/5)"
    │   ├── Zone de drag & drop
    │   │   ├── ┌─────────────────────────────┐
    │   │   │ │       📷 Icône               │
    │   │   │ │                              │
    │   │   │ │  Glissez-déposez vos        │
    │   │   │ │  images ici ou cliquez      │
    │   │   │ │  pour sélectionner          │
    │   │   │ │                              │
    │   │   │ │  PNG, JPG, GIF jusqu'à      │
    │   │   │ │  10MB                        │
    │   │   └ └─────────────────────────────┘
    │   └── Grille de prévisualisations (si images uploadées)
    │       ├── [Image 1] [X]
    │       ├── [Image 2] [X]
    │       └── ...
    │
    ├── 8️⃣ PRIX (conditionnel - si Type = Vente)
    │   ├── Label : "Prix (€) *"
    │   ├── Input number
    │   │   ├── Placeholder : "25.00"
    │   │   └── Attributs : min="0", step="0.01"
    │   └── [Message d'erreur si invalide]
    │
    ├── 9️⃣ JEU RECHERCHÉ (conditionnel - si Type = Échange)
    │   ├── Label : "Jeu recherché *"
    │   ├── Input texte
    │   │   └── Placeholder : "Ex: Wingspan ou Terraforming Mars"
    │   └── [Message d'erreur si invalide]
    │
    ├── 🔟 LIVRAISON
    │   ├── Ligne de séparation
    │   └── Toggle switch
    │       └── Label : "Livraison possible"
    │           └── [⬜ Désactivé] ou [✅ Activé]
    │
    └── 🔘 BOUTONS D'ACTION
        ├── Ligne de séparation
        └── 2 boutons côte à côte :
            ├── [Enregistrer et quitter]  ← bouton secondaire (outline)
            └── [Publier]                 ← bouton principal (primaire)
```

---

## 🎯 Ce que VOUS devriez voir

### ✅ Éléments VISIBLES

1. ✅ Bouton "← Retour"
2. ✅ Titre "Créer une annonce"
3. ✅ 2 boutons "💰 Vente" / "🔄 Échange"
4. ✅ Champ "Titre de l'annonce"
5. ✅ Champ "Identification du jeu" avec recherche
6. ✅ Select "État du jeu"
7. ✅ Textarea "Description"
8. ✅ Champ "Localisation" avec autocomplete
9. ✅ **⚠️ Zone d'upload de photos** ← VOUS NE VOYEZ PAS CECI
10. ✅ Champ "Prix" (si Vente sélectionné)
11. ✅ Toggle "Livraison possible"
12. ✅ 2 boutons "Enregistrer et quitter" / "Publier"

---

## ❌ Ce qui MANQUE (problème)

### Section 7️⃣ : Photos (ImageUpload)

**Ce que vous DEVRIEZ voir entre "Localisation" et "Prix" :**

```
┌─────────────────────────────────────────┐
│ Photos (0/5)                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │          📷                         │ │
│ │                                     │ │
│ │   Glissez-déposez vos images ici   │ │
│ │   ou cliquez pour sélectionner     │ │
│ │                                     │ │
│ │   PNG, JPG, GIF jusqu'à 10MB       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Si vous ne voyez PAS cette zone**, c'est le problème #2.

---

## 🔍 Diagnostic rapide

### Méthode 1 : Comptez les sections

À partir du titre "Créer une annonce", comptez les sections :

1. Type de transaction ✅
2. Titre ✅
3. Jeu ✅
4. État ✅
5. Description ✅
6. Localisation ✅
7. **Photos** ← Vous voyez ceci ?
8. Prix (si Vente) ✅
9. Livraison ✅
10. Boutons ✅

**Si vous passez directement de "Localisation" à "Prix" sans voir "Photos"**, le composant ImageUpload ne s'affiche pas.

---

### Méthode 2 : Ouvrir la console (F12)

1. Appuyez sur **F12** dans votre navigateur
2. Onglet **Console**
3. Cherchez des erreurs en rouge
4. Notez les erreurs liées à :
   - `ImageUpload`
   - `Storage`
   - `marketplace-images`

---

## 📸 Captures d'écran attendues

### Vue complète de la page

```
┌──────────────────────────────────────────────┐
│  ← Retour                                    │
│                                              │
│  Créer une annonce                           │
│  Vendez ou échangez vos jeux de société      │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Type de transaction                 │   │
│  │  [💰 Vente]  [🔄 Échange]            │   │
│  │                                       │   │
│  │  Titre de l'annonce *                │   │
│  │  [_________________________]         │   │
│  │                                       │   │
│  │  Identification du jeu *             │   │
│  │  [Rechercher un jeu...    🔍]       │   │
│  │                                       │   │
│  │  État du jeu *                       │   │
│  │  [Bon état             ▼]           │   │
│  │                                       │   │
│  │  Description                         │   │
│  │  [________________________]          │   │
│  │  [________________________]          │   │
│  │  [________________________]          │   │
│  │                                       │   │
│  │  Localisation                        │   │
│  │  [Ex: Le Moufia...     📍]          │   │
│  │                                       │   │
│  │  Photos (0/5)          ⚠️ ICI       │   │
│  │  ┌────────────────────┐             │   │
│  │  │      📷            │             │   │
│  │  │  Glissez-déposez   │             │   │
│  │  └────────────────────┘             │   │
│  │                                       │   │
│  │  Prix (€) *                          │   │
│  │  [_________________________]         │   │
│  │                                       │   │
│  │  ─────────────────────────           │   │
│  │  ☐ Livraison possible                │   │
│  │                                       │   │
│  │  ─────────────────────────           │   │
│  │  [Enregistrer et quitter] [Publier]  │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Actions

### Si la section "Photos" est ABSENTE

1. **Ouvrez la console** (F12)
2. **Regardez** s'il y a des erreurs
3. **Partagez** le message d'erreur exact

Causes possibles :
- Erreur JavaScript dans le composant `ImageUpload`
- Bucket `marketplace-images` inexistant
- Problème d'import du composant

### Si la section "Photos" est PRÉSENTE

Tout est OK ! Passez au test de création d'annonce.

---

## 💬 Questions pour vous

1. **Voyez-vous** la section "Photos (0/5)" entre Localisation et Prix ?
   - ✅ OUI → Tout va bien
   - ❌ NON → Problème à résoudre

2. **Si NON**, qu'est-ce qui apparaît directement après "Localisation" ?
   - Le champ "Prix" ?
   - Rien ?
   - Autre chose ?

3. **Y a-t-il des erreurs** dans la console (F12) ?
   - OUI → Copiez-les
   - NON → Décrivez ce que vous voyez

---

**Répondez à ces 3 questions et je pourrai vous aider plus précisément !** 🎯


