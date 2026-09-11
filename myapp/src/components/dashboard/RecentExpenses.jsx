import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { StatusBadge } from '../common/StatusBadge';

export const RecentExpenses = ({ expenses = [], groupsMap = {}, usersMap = {} }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Expenses</h3>
          <p className="text-xs text-slate-500">Latest shared transactions</p>
        </div>
        <Link
          to="/expenses"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No expenses recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {expenses.slice(0, 5).map((expense) => {
            const group = groupsMap[expense.groupId] || { name: 'Personal' };
            const payer = usersMap[expense.paidBy] || { name: 'Member' };
            let formattedDate = 'Recently';
            try {
              formattedDate = formatDistanceToNow(parseISO(expense.date), {
                addSuffix: true,
              });
            } catch {
              formattedDate = 'Recently';
            }

            return (
              <Link
                key={expense.id}
                to={`/expenses/${expense.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {expense.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      Paid by <span className="font-semibold">{payer.name}</span> in{' '}
                      <span className="font-semibold text-slate-700">{group.name}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-[11px] text-slate-400">{formattedDate}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
