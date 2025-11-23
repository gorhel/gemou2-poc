/**
 * Bouton universel utilisant NativeWind (Tailwind CSS)
 * Fonctionne sur Web, iOS et Android
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonNativeProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ButtonNative({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = ''
}: ButtonNativeProps) {
  // Classes de base
  const baseClasses = 'items-center justify-center rounded-lg';
  
  // Variants
  const variantClasses = {
    primary: 'bg-[#6366F1] active:bg-[#4F46E5]',
    secondary: 'bg-[#F0F2F5] border border-[#E5E7EB] active:bg-[#E5E7EB]',
    danger: 'bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent active:bg-gray-100'
  };
  
  // Sizes
  const sizeClasses = {
    sm: 'py-2 px-3',
    md: 'py-3 px-4',
    lg: 'py-4 px-6'
  };
  
  // Text classes
  const textBaseClasses = 'font-semibold text-center';
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-[#1F2937]',
    danger: 'text-white',
    ghost: 'text-[#6366F1]'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `.trim();
  
  const textClasses = `
    ${textBaseClasses}
    ${textVariantClasses[variant]}
    ${textSizeClasses[size]}
  `.trim();

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? 'white' : '#6366F1'}
        />
      ) : (
        <Text className={textClasses}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

