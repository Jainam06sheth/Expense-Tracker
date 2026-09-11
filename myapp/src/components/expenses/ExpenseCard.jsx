import React from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Calendar, Users, ArrowRight, Trash2, Edit3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { format, parseISO } from 'date-fns';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';

export const ExpenseCard = ({
  expense,
  group,
  payer,
  membersMap = {},
  currentUserId,
  onEdit,
  onDelete,
}) => {
  let displayDate = '';
  try {
    displayDate = format(parseISO(expense.date), 'dd MMM yyyy');
  } catch {
    displayDate = expense.date;
  }

  const userShare = expense.splits?.[currentUserId] || 0;
  const isPayer = expense.paidBy === currentUserId;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/expenses/${expense.id}`}
                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate"
              >
                {expense.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">
                  {group?.name || 'Personal'}
                </span>
                <span>•</span>
                <span className="capitalize">{expense.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Expense"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Big Amount and User Involvement */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Total Bill</span>
            <span className="font-black text-slate-900 text-base">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Your Involvement</span>
            {isPayer ? (
              <span className="font-bold text-emerald-600 text-sm">
                You paid {formatCurrency(expense.amount)}
              </span>
            ) : userShare > 0 ? (
              <span className="font-bold text-rose-600 text-sm">
                Your share: {formatCurrency(userShare)}
              </span>
            ) : (
              <span className="font-bold text-slate-500 text-sm">Not involved</span>
            )}
          </div>
        </div>

        {/* Participants avatars */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <span className="font-medium">Paid by:</span>
            <span className="font-bold text-slate-800">
              {isPayer ? 'You' : payer?.name || 'Member'}
            </span>
          </div>
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {expense.participants?.map((pid) => {
              const p = membersMap[pid] || { name: 'P' };
              return (
                <div key={pid} title={p.name}>
                  <Avatar name={p.name} size="xs" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>{displayDate}</span>
        </div>

        <Link
          to={`/expenses/${expense.id}`}
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
        >
          View Breakdown <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
