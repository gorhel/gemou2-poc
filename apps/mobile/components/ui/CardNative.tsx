/**
 * Card universelle utilisant NativeWind (Tailwind CSS)
 * Fonctionne sur Web, iOS et Android
 */

import React from 'react';
import { View } from 'react-native';

interface CardNativeProps {
  children: React.ReactNode;
  className?: string;
}

export function CardNative({ children, className = '' }: CardNativeProps) {
  return (
    <View className={`bg-white rounded-xl p-4 shadow-md ${className}`}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {children}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <View className={className}>
      {children}
    </View>
  );
}

