import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import MachiColors from '../../theme/colors';
import { useTotalUnreadCount } from '../../lib';

/**
 * Composant Badge pour afficher le nombre de messages non lus
 */
function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}

/**
 * Icône avec badge pour l'onglet Communauté
 */
function CommunityTabIcon({ color, size, unreadCount }: { color: string; size: number; unreadCount: number }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={{ fontSize: size }}>💬</Text>
      <UnreadBadge count={unreadCount} />
    </View>
  )
}

export default function TabLayout() {
  const unreadCount = useTotalUnreadCount()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MachiColors.primary,
        tabBarInactiveTintColor: MachiColors.textSecondary,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 2,
          borderTopColor: MachiColors.border,
          height: Platform.select({ ios: 85, android: 85, web: 85 }),
          paddingBottom: Platform.select({ ios: 25, default: 10 }),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
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
            <Text style={{ fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🛒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comm.',
          tabBarIcon: ({ color, size }) => (
            <CommunityTabIcon color={color} size={size} unreadCount={unreadCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>👤</Text>
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
      <Tabs.Screen
        name="create-trade"
        options={{
          href: null, // Masquer du menu
          title: 'Créer une annonce',
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
})
