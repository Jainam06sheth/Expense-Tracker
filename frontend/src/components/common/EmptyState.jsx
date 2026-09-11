import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'Get started by creating a new one.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
