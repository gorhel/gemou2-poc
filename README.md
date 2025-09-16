# 🎲 Gémou2 POC - Application Jeux de Société

Application mobile & web dédiée aux passionnés de jeux de société.

## 🚀 Installation Rapide

```bash
# 1. Aller dans le dossier projet
cd gemou2-poc

# 2. Installer les dépendances
npm install

# 3. Lancer le développement
npm run dev:web      # Web app sur localhost:3000
npm run dev:mobile   # Mobile app avec Expo
```

## 🏗️ Architecture

- **Frontend Mobile**: React Native + Expo Router
- **Frontend Web**: Next.js 14 + Tailwind CSS  
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL
- **Deploy**: Vercel (Web) + EAS (Mobile)

## 📁 Structure

```
gemou2-poc/
├── apps/
│   ├── mobile/     # React Native Expo
│   └── web/        # Next.js
├── packages/       # Code partagé (à venir)
└── supabase/       # Configuration backend (à venir)
```

## 🔧 Commandes Disponibles

```bash
npm run dev           # Lance tous les projets en dev
npm run dev:web       # Web uniquement
npm run dev:mobile    # Mobile uniquement
npm run build         # Build de production
npm run lint          # Vérification du code
npm run type-check    # Vérification TypeScript
```

## 🎯 Fonctionnalités Prévues

- 🔐 Authentification (Email, Google, Facebook)
- 📅 Événements (Création, recherche, participation)
- 💬 Messagerie temps réel
- 🛒 Marketplace (Vente/échange)
- 👥 Communauté et profils
- 📱 Applications iOS/Android/Web

## 📖 Prochaines Étapes

1. ✅ Structure de base créée
2. ✅ Configuration mobile (Issue OUT-99)
3. 🔄 Configuration Supabase
4. 🔄 Authentification 
5. 🔄 CRUD Événements
6. 🔄 Système de messagerie
7. 🔄 Interface marketplace

## 📚 Documentation

- [Configuration Mobile](./docs/MOBILE_SETUP.md) - Setup React Native + Expo
- [Configuration Supabase](./docs/SUPABASE_SETUP.md) - Backend et base de données

---

*Développé avec ❤️ pour la communauté des jeux de société*

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que Node.js 18+ est installé
2. Utilisez `npm run clean` puis `npm install`
3. Pour mobile, installez Expo Go sur votre téléphone