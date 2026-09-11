import React from 'react';

export const Avatar = ({
  name = 'User',
  avatar,
  size = 'md',
  color = 'bg-blue-600',
  className = '',
}) => {
  const initial = (avatar || name || 'U').charAt(0).toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const colors = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-emerald-600',
    'bg-teal-600',
    'bg-rose-600',
    'bg-amber-600',
  ];

  // Derive stable color from name if color not specified
  const charCode = (name || 'U').charCodeAt(0);
  const derivedColor = color || colors[charCode % colors.length];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-xs select-none flex-shrink-0 ${sizeClasses[size]} ${derivedColor} ${className}`}
    >
      {initial}
    </div>
  );
};
