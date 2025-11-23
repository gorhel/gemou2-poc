import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import MachiColors from '../../theme/colors';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? 'white' : MachiColors.primary}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  
  // Variants
  button_primary: {
    backgroundColor: MachiColors.primary,
  },
  button_secondary: {
    backgroundColor: MachiColors.neutral,
    borderWidth: 1,
    borderColor: MachiColors.border,
  },
  button_danger: {
    backgroundColor: MachiColors.error,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  button_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  button_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  button_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  
  buttonFullWidth: {
    width: '100%',
  },
  
  buttonDisabled: {
    backgroundColor: MachiColors.textSecondary,
    opacity: 0.6,
  },
  
  // Text variants
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: 'white',
  },
  text_secondary: {
    color: MachiColors.text,
  },
  text_danger: {
    color: 'white',
  },
  text_ghost: {
    color: MachiColors.primary,
  },
  
  // Text sizes
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
});

