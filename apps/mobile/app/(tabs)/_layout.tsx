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
        name="events"
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
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>👤</span>
          ),
        }}
      />
    </Tabs>
  );
}

