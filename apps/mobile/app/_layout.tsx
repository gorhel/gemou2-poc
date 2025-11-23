import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from '../components/auth/AuthProvider';

// Empêcher le splash screen de se fermer automatiquement
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Plus Jakarta Sans': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'Plus Jakarta Sans Light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'Plus Jakarta Sans Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'Plus Jakarta Sans SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'Plus Jakarta Sans Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'Plus Jakarta Sans ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Cacher le splash screen une fois les polices chargées
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError]);

  // Afficher un écran de chargement si les polices ne sont pas encore chargées
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        {/* Routes publiques */}
        <Stack.Screen 
          name="index" 
          options={{ title: 'Gémou2', headerShown: false }} 
        />
        <Stack.Screen 
          name="onboarding" 
          options={{ title: 'Bienvenue', headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ title: 'Connexion', headerShown: false }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ title: 'Inscription', headerShown: false }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{ title: 'Mot de passe oublié', headerShown: false }} 
        />

        {/* Routes protégées avec tabs */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />

        {/* Routes protégées avec tabs */}
        <Stack.Screen 
          name="create-event" 
          options={{ title: 'Créer un événement', headerShown: false }} 
        />
        <Stack.Screen 
          name="create-trade" 
          options={{ title: 'Créer une annonce', headerShown: false }} 
        />
        <Stack.Screen 
          name="trade/[id]" 
          options={{ title: 'Détail annonce', headerShown: false }} 
        />
        <Stack.Screen 
          name="profile/[username]" 
          options={{ title: 'Profil', headerShown: false }} 
        />
        <Stack.Screen 
          name="components-demo" 
          options={{ title: 'Composants UI', headerShown: false }} 
        />

        {/* Routes protégées sans tabs */}
        

        {/* Routes protégées sans tabs */}
        

        {/* Routes admin */}
        <Stack.Screen 
          name="admin/create-event" 
          options={{ title: 'Admin - Créer événement', headerShown: false }} 
        />
      </Stack>
    </AuthProvider>
  );
}