import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Configuration Supabase Cloud - valeurs directes pour éviter les problèmes de résolution
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

// Configuration Realtime adaptée selon la plateforme
const realtimeConfig: any = {
  params: {
    eventsPerSecond: 10, // Limite d'événements par seconde
  },
};

// Sur le web, ne pas spécifier le transport (Supabase le gère automatiquement)
// Sur React Native (iOS/Android), utiliser WebSocket explicitement
if (Platform.OS !== 'web') {
  realtimeConfig.transport = 'websocket';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: realtimeConfig,
});