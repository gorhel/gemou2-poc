import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface SmallPillProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export default function SmallPill({ children, className = '', style }: SmallPillProps) {
  return (
    <View 
      className={`inline-flex items-center px-3 py-1 rounded-full border ${className}`}
      style={[
        {
          backgroundColor: '#332940',
          borderColor: '#5B4B70',
        },
        style,
      ]}
    >
      <Text 
        className="text-sm font-medium"
        style={{ color: '#A78BFA' }}
      >
        {children}
      </Text>
    </View>
  );
}

