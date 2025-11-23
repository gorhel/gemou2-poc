import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import MachiColors from '../../theme/colors';

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
          backgroundColor: MachiColors.secondary + '20', // 20% opacity
          borderColor: MachiColors.secondary,
        },
        style,
      ]}
    >
      <Text 
        className="text-sm font-medium"
        style={{ color: MachiColors.secondary }}
      >
        {children}
      </Text>
    </View>
  );
}






