import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: Platform.select({ ios: 85, android: 65, web: 65 }),
          paddingBottom: Platform.select({ ios: 25, default: 10 }),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>🏠</span>
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>📅</span>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>🛒</span>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comm.',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>💬</span>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>👤</span>
          ),
        }}
      />

      {/* Routes masquées du menu mais avec menu visible */}
      <Tabs.Screen
        name="events/[id]"
        options={{
          href: null, // Masquer du menu
          title: 'Détails événement',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Masquer du menu
          title: 'Recherche',
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          href: null, // Masquer du menu
          title: 'Créer un événement',
        }}
      />
    </Tabs>
  );
}

