import React from 'react';

interface SmallPillProps {
  children: React.ReactNode;
  className?: string;
}

export default function SmallPill({ children, className = '' }: SmallPillProps) {
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${className}`}
      style={{
        backgroundColor: '#332940',
        color: '#A78BFA',
        borderColor: '#5B4B70'
      }}
    >
      {children}
    </span>
  );
}

