import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PageFooterProps {
  style?: any;
}

/**
 * Composant Footer centralisé pour toutes les pages mobile
 * 
 * Affiche les informations de l'application
 */
export default function PageFooter({ style }: PageFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Logo et nom */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎲</Text>
          <Text style={styles.appName}>Gémou2</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          L'application qui connecte les passionnés de jeux de société
        </Text>

        {/* Version et copyright */}
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© {currentYear} Gémou2</Text>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          Fait avec ❤️ pour les passionnés de jeux de société
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 'auto',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: '#6B7280',
  },
  copyright: {
    fontSize: 12,
    color: '#6B7280',
  },
  message: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});



