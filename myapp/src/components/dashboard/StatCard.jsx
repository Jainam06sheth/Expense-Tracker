import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue', // 'blue', 'green', 'rose', 'amber', 'purple'
  valueColor,
  bgColor = 'bg-white',
  className = '',
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
    },
    green: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'hover:border-rose-200',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div className={`${bgColor} rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${style.border} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className={`text-xl sm:text-2xl font-black mt-1.5 tracking-tight ${valueColor || 'text-slate-900'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${style.bg} ${style.text} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
