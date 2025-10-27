import React from 'react';
import { View, Text, Switch, Platform } from 'react-native';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  // Pour React Native, on utilise le Switch natif qui s'adapte à la plateforme
  const scaleMap = {
    sm: 0.8,
    md: 1,
    lg: 1.2,
  };

  const scale = scaleMap[size];

  return (
    <View className="flex-row items-center">
      <Switch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
        ios_backgroundColor="#d1d5db"
        style={{ transform: [{ scale }] }}
      />
      {label && (
        <Text 
          className={`ml-3 text-gray-700 ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </Text>
      )}
    </View>
  );
};






