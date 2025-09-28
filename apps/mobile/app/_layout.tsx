import { Stack } from 'expo-router';
import { AuthProvider } from '../components/auth/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="onboarding" options={{ title: 'Bienvenue sur Gémou2', headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ title: 'Tableau de bord', headerShown: false }} />
        <Stack.Screen name="index" options={{ title: 'Gémou2' }} />
      </Stack>
    </AuthProvider>
  );
}