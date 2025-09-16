import { Stack } from 'expo-router';
import { AuthProvider } from '../components/auth/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Gémou2' }} />
      </Stack>
    </AuthProvider>
  );
}