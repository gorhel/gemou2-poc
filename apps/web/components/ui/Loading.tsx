import React from 'react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'gray' | 'white';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const getSpinnerClasses = (
  size: LoadingProps['size'] = 'md',
  color: LoadingProps['color'] = 'primary'
): string => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    gray: 'text-gray-500',
    white: 'text-white',
  };

  return `${sizeClasses[size]} ${colorClasses[color]}`;
};

export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const spinnerClasses = getSpinnerClasses(size, color);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${spinnerClasses}`}
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
      {text && (
        <span className={`ml-2 text-${color === 'white' ? 'white' : 'gray-600'}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export const LoadingPage: React.FC<{ text?: string }> = ({
  text = 'Chargement...'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  );
};

export const LoadingCard: React.FC<{ text?: string }> = ({
  text = 'Chargement...'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

export const LoadingButton: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  text = 'Chargement...',
  size = 'md'
}) => {
  return (
    <div className="inline-flex items-center">
      <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} color="white" />
      <span className="ml-2">{text}</span>
    </div>
  );
};

// Skeleton loading components
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}> = ({
  className = '',
  variant = 'rectangular'
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};