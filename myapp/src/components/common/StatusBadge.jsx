import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status = 'unsettled', size = 'sm' }) => {
  const configs = {
    settled: {
      label: 'Settled',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: CheckCircle2,
    },
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: CheckCircle2,
    },
    unsettled: {
      label: 'Unsettled',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      icon: Clock,
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      icon: Clock,
    },
    active: {
      label: 'Active',
      bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      icon: CheckCircle2,
    },
    admin: {
      label: 'Admin',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      icon: CheckCircle2,
    },
    member: {
      label: 'Member',
      bg: 'bg-slate-50 text-slate-700 border-slate-200/60',
      icon: null,
    },
  };

  const current = configs[status.toLowerCase()] || {
    label: status,
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: null,
  };

  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses[size]}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {current.label}
    </span>
  );
};
