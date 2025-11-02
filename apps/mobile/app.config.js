import 'dotenv/config';

export default {
  expo: {
    name: "Gémou2",
    slug: "gemou2-poc",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    
    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gemou2.poc"
    },
    
    // Android Configuration
    android: {
      package: "com.gemou2.poc",
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      }
    },
    
    // Web Configuration - Optimisée pour production
    web: {
      bundler: "metro",
      output: "static", // Pour génération de site statique
      favicon: "./assets/favicon.png",
      // Configuration SEO
      meta: {
        title: "Gémou2 - Communauté de passionnés de jeux de société",
        description: "Trouvez des joueurs, organisez des événements et partagez votre passion pour les jeux de société",
        keywords: "jeux de société, board games, communauté, événements, marketplace"
      }
    },
    
    // Expo Router
    plugins: ["expo-router"],
    scheme: "gemou2",
    experiments: {
      typedRoutes: true
    },
    
    // Supabase Configuration
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qpnofwgxjgvmpwdrhzid.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0',
      router: {
        origin: process.env.EXPO_PUBLIC_URL || 'http://localhost:8082'
      }
    }
  }
};
