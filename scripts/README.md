# 📜 Scripts Utilitaires

## check-marketplace-setup.js

Script de vérification automatique de la configuration du Marketplace.

### Usage

```bash
node scripts/check-marketplace-setup.js
```

### Ce qu'il vérifie

✅ Présence de tous les fichiers nécessaires  
✅ Utilisation correcte de Supabase dans les composants  
✅ Configuration du bucket Storage  
✅ Présence des colonnes dans la migration SQL  
✅ Vue enrichie et fonction SQL  

### Résultat attendu

```
🎉 TOUT EST OK !

Prochaines étapes :
1. ⚠️  CRÉER le bucket Supabase Storage "marketplace-images"
2. 🧪 Tester sur /create-trade
3. ✅ Tout devrait fonctionner !
```

### En cas d'erreur

Le script affichera les éléments manquants avec ❌.

Consultez la documentation dans `documentation/` pour corriger les problèmes.





