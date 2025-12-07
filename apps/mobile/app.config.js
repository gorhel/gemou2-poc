import 'dotenv/config';

export default {
  expo: {
    name: "Machi",
    slug: "machi",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#6366F1",
      resizeMode: "contain"
    },
    
    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.machi.app",
      // Configuration des notifications push
      infoPlist: {
        UIBackgroundModes: ["remote-notification"]
      }
    },
    
    // Android Configuration
    android: {
      package: "com.machi.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#6366F1"
      },
      // Configuration des notifications push
      useNextNotificationsApi: true
    },
    
    // Web Configuration - Optimisée pour production
    web: {
      bundler: "metro",
      output: "static", // Pour génération de site statique
      favicon: "./assets/favicon.png",
      // Configuration SEO
      meta: {
        title: "Machi - Trouve ton game",
        description: "Trouve ton game - Découvre des joueurs, organise des événements et partage ta passion pour les jeux de société",
        keywords: "jeux de société, board games, communauté, événements, marketplace, machi, trouve ton game"
      }
    },
    
    // Expo Router & Plugins
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          "photosPermission": "L'application accède à vos photos pour vous permettre de les ajouter à vos événements et annonces.",
          "cameraPermission": "L'application accède à votre caméra pour prendre des photos."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3b82f6",
          "sounds": ["./assets/notification-sound.wav"],
          "defaultChannel": "default"
        }
      ]
    ],
    
    // Configuration des notifications
    notification: {
      icon: "./assets/notification-icon.png",
      color: "#3b82f6",
      iosDisplayInForeground: true,
      androidMode: "default",
      androidCollapsedTitle: "Machi"
    },
    scheme: "machi",
    experiments: {
      typedRoutes: true
    },
    
    // Supabase Configuration
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qpnofwgxjgvmpwdrhzid.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0',
      router: {
        origin: process.env.EXPO_PUBLIC_URL || 'http://localhost:8082'
      },
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "your-eas-project-id"
      }
    }
  }
};
