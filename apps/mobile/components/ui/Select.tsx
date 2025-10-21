import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Select = React.forwardRef<any, SelectProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    size = 'md',
    options,
    placeholder,
    value,
    onValueChange,
    disabled = false,
    className = '',
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm h-10',
      md: 'text-base h-12',
      lg: 'text-lg h-14',
    };

    const selectClasses = `
      border rounded-lg
      ${error ? 'border-red-300' : 'border-gray-300'}
      ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}
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

        <View className={selectClasses}>
          <Picker
            ref={ref}
            selectedValue={value}
            onValueChange={onValueChange}
            enabled={!disabled}
            style={{ height: '100%' }}
          >
            {placeholder && (
              <Picker.Item label={placeholder} value="" />
            )}
            {options.map((option) => (
              <Picker.Item 
                key={option.value} 
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
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

Select.displayName = 'Select';

