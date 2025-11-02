import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle } from 'react-native';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const colorMap = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  gray: '#6b7280',
  white: '#ffffff',
};

export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = 'large',
  color = 'primary',
  text,
}) => {
  const spinnerColor = colorMap[color as keyof typeof colorMap] || colorMap.primary;

  return (
    <View className="flex items-center justify-center">
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text className={`mt-2 ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </Text>
      )}
    </View>
  );
};

export const LoadingPage: React.FC<{ text?: string }> = ({
  text = 'Chargement...'
}) => {
  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
      <LoadingSpinner size="large" color="primary" />
      <Text className="text-gray-600 text-lg mt-4">{text}</Text>
    </View>
  );
};

export const LoadingCard: React.FC<{ text?: string }> = ({
  text = 'Chargement...'
}) => {
  return (
    <View className="bg-white rounded-lg shadow-md p-8 items-center">
      <LoadingSpinner size="large" color="primary" />
      <Text className="text-gray-600 mt-4">{text}</Text>
    </View>
  );
};

export const LoadingButton: React.FC<{ text?: string; size?: 'small' | 'large' }> = ({
  text = 'Chargement...',
  size = 'large'
}) => {
  return (
    <View className="flex-row items-center">
      <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color="white" />
      <Text className="ml-2 text-white">{text}</Text>
    </View>
  );
};

// Skeleton loading components
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
}> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  const style: ViewStyle = {};
  if (width) style.width = width as any;
  if (height) style.height = height as any;

  return (
    <View 
      className={`bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View className="bg-white rounded-lg shadow-md p-6">
      <View className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <View className="flex-row space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </View>
      </View>
    </View>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <View className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </View>
      ))}
    </View>
  );
};

