import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getInputClasses = (
  size: InputProps['size'] = 'md',
  error: boolean = false,
  fullWidth: boolean = false,
  disabled: boolean = false,
  className: string = ''
): string => {
  const baseClasses = 'border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  const stateClasses = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

  const disabledClasses = disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white';

  const widthClass = fullWidth ? 'w-full' : '';

  return `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${widthClass} ${className}`.trim();
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    size = 'md',
    className = '',
    id,
    disabled,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputClasses = getInputClasses(size, !!error, fullWidth, disabled, className);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-error-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Composant Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
}

const getTextareaClasses = (
  size: TextareaProps['size'] = 'md',
  error: boolean = false,
  fullWidth: boolean = false,
  disabled: boolean = false,
  className: string = ''
): string => {
  const baseClasses = 'border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  const stateClasses = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

  const disabledClasses = disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white';

  const widthClass = fullWidth ? 'w-full' : '';

  return `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${widthClass} ${className}`.trim();
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    size = 'md',
    rows = 4,
    className = '',
    id,
    disabled,
    ...props
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaClasses = getTextareaClasses(size, !!error, fullWidth, disabled, className);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          disabled={disabled}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-error-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';