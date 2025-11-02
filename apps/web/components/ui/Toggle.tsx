import React from 'react';

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
  const sizeClasses = {
    sm: {
      switch: 'w-9 h-5',
      circle: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      circle: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const classes = sizeClasses[size];

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`${classes.switch} ${
            checked ? 'bg-primary-600' : 'bg-gray-300'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } rounded-full shadow-inner transition-colors duration-200 ease-in-out`}
        />
        <div
          className={`${classes.circle} ${
            checked ? classes.translate : 'translate-x-0.5'
          } absolute left-0.5 top-0.5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out`}
        />
      </div>
      {label && (
        <span className={`ml-3 text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

