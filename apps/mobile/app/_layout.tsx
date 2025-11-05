import { Stack } from 'expo-router';
import { AuthProvider } from '../components/auth/AuthProvider';

export default function RootLayout() {
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