import React from 'react';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'
  | 'info';

type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const getButtonClasses = (
  variant: ButtonVariant = 'default',
  size: ButtonSize = 'default',
  fullWidth: boolean = false,
  className: string = ''
): string => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    default: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
    destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-primary-500',
    link: 'text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500',
    success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500',
    info: 'bg-info-500 text-white hover:bg-info-600 focus-visible:ring-info-500',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    lg: 'h-11 rounded-md px-8 text-base',
    xl: 'h-12 rounded-lg px-10 text-lg',
    icon: 'h-10 w-10 p-0',
    'icon-sm': 'h-8 w-8 p-0',
    'icon-lg': 'h-12 w-12 p-0',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim();
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'default',
    size = 'default',
    fullWidth = false,
    leftIcon,
    rightIcon,
    loading = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const buttonClasses = getButtonClasses(variant, size, fullWidth, className);

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };