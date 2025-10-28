import React from 'react';
import { View, TextInput, Text, TextInputProps, Platform } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    editable = true,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg',
    };

    const inputClasses = `
      border rounded-lg
      ${error ? 'border-red-300' : 'border-gray-300'}
      ${!editable ? 'bg-gray-50 text-gray-400' : 'bg-white'}
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${className}
    `.trim();

    return (
      <View className={fullWidth ? 'w-full' : ''}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {label}
          </Text>
        )}

        <View className="relative">
          {leftIcon && (
            <View className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            className={inputClasses}
            editable={editable}
            placeholderTextColor="#9ca3af"
            {...props}
          />

          {rightIcon && (
            <View className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </View>
          )}
        </View>

        {error && (
          <Text className="mt-1 text-sm text-red-600">
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text className="mt-1 text-sm text-gray-500">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Composant Textarea
export interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    size = 'md',
    rows = 4,
    className = '',
    editable = true,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg',
    };

    const textareaClasses = `
      border rounded-lg
      ${error ? 'border-red-300' : 'border-gray-300'}
      ${!editable ? 'bg-gray-50 text-gray-400' : 'bg-white'}
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim();

    return (
      <View className={fullWidth ? 'w-full' : ''}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {label}
          </Text>
        )}

        <TextInput
          ref={ref}
          multiline
          numberOfLines={rows}
          textAlignVertical="top"
          className={textareaClasses}
          editable={editable}
          placeholderTextColor="#9ca3af"
          {...props}
        />

        {error && (
          <Text className="mt-1 text-sm text-red-600">
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text className="mt-1 text-sm text-gray-500">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';


