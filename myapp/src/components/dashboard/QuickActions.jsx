import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FolderPlus,
  Scale,
  HandCoins,
  Share2,
  History,
} from 'lucide-react';

export const QuickActions = ({ onOpenCreateGroup, onOpenInvite }) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Expense',
      icon: PlusCircle,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100/80 border-blue-100',
      onClick: () => navigate('/expenses/add'),
    },
    {
      label: 'Create Group',
      icon: FolderPlus,
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/80 border-indigo-100',
      onClick: onOpenCreateGroup,
    },
    {
      label: 'View Balances',
      icon: Scale,
      color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 border-emerald-100',
      onClick: () => navigate('/balances'),
    },
    {
      label: 'Settle Up',
      icon: HandCoins,
      color: 'bg-amber-50 text-amber-600 hover:bg-amber-100/80 border-amber-100',
      onClick: () => navigate('/settlements'),
    },
    {
      label: 'Invite Friends',
      icon: Share2,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100/80 border-purple-100',
      onClick: onOpenInvite,
    },
    {
      label: 'View Activity',
      icon: History,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border-slate-200',
      onClick: () => navigate('/activity'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.label}
            type="button"
            onClick={act.onClick}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${act.color}`}
          >
            <Icon className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-bold">{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
