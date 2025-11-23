# Génération des assets PNG depuis SVG

Les fichiers SVG ont été créés. Pour générer les fichiers PNG nécessaires, vous pouvez utiliser l'une des méthodes suivantes :

## Méthode 1 : Utiliser un convertisseur en ligne
1. Ouvrez le fichier `logo-icon.svg`
2. Utilisez un convertisseur SVG vers PNG (ex: https://cloudconvert.com/svg-to-png)
3. Générez les tailles suivantes :
   - `icon.png` : 1024x1024px
   - `adaptive-icon.png` : 1024x1024px (même que icon.png)
   - `splash.png` : 1284x2778px (avec fond #6366F1)
   - `favicon.png` : 48x48px

## Méthode 2 : Utiliser ImageMagick (ligne de commande)
```bash
# Installer ImageMagick si nécessaire
# brew install imagemagick (Mac)
# apt-get install imagemagick (Linux)

# Générer icon.png (1024x1024)
convert -background none -resize 1024x1024 logo-icon.svg icon.png

# Générer adaptive-icon.png (1024x1024)
cp icon.png adaptive-icon.png

# Générer favicon.png (48x48)
convert -background none -resize 48x48 logo-icon.svg favicon.png

# Générer splash.png (1284x2778 avec fond)
convert -size 1284x2778 xc:#6366F1 -gravity center logo-icon.svg -composite splash.png
```

## Méthode 3 : Utiliser un éditeur graphique
1. Ouvrez `logo-icon.svg` dans Figma, Sketch, ou Adobe Illustrator
2. Exportez aux dimensions requises
3. Pour le splash screen, créez un canvas 1284x2778px avec fond #6366F1 et centrez le logo

## Fichiers à générer
- `icon.png` : 1024x1024px (icône principale)
- `adaptive-icon.png` : 1024x1024px (Android adaptive icon)
- `splash.png` : 1284x2778px (splash screen avec fond #6366F1)
- `favicon.png` : 48x48px (favicon web)

Une fois générés, placez ces fichiers dans `apps/mobile/assets/` et copiez `favicon.png` vers `apps/web/public/favicon.ico` (convertir en ICO si nécessaire).

