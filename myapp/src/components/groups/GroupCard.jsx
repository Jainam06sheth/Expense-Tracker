import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Receipt, ArrowRight, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

export const GroupCard = ({ group, totalSpent = 0, userNetBalance = 0, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {group.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <Link
                to={`/groups/${group.id}`}
                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate"
              >
                {group.name}
              </Link>
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                {group.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(group)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Group"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(group)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {group.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
            {group.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Total Spent</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Your Balance</span>
            <span
              className={`font-bold text-sm ${
                userNetBalance > 0
                  ? 'text-emerald-600'
                  : userNetBalance < 0
                  ? 'text-rose-600'
                  : 'text-slate-700'
              }`}
            >
              {userNetBalance > 0
                ? `+${formatCurrency(userNetBalance)}`
                : userNetBalance < 0
                ? `-${formatCurrency(Math.abs(userNetBalance))}`
                : 'Settled'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Users className="w-3.5 h-3.5" />
          <span>{group.members?.length || 0} members</span>
        </div>

        <Link
          to={`/groups/${group.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          Open Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
