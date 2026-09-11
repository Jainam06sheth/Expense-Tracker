import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, HandCoins } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';

export const BalanceOverview = ({
  youAreOwed = 0,
  youOwe = 0,
  netBalance = 0,
  debtsByOtherUser = {},
  usersMap = {},
}) => {
  const debtors = []; // People who owe current user
  const creditors = []; // People current user owes

  Object.entries(debtsByOtherUser).forEach(([userId, amount]) => {
    if (amount > 0.01) {
      debtors.push({ userId, amount });
    } else if (amount < -0.01) {
      creditors.push({ userId, amount: Math.abs(amount) });
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Balance Overview</h3>
            <p className="text-xs text-slate-500">Your net financial standing</p>
          </div>
          <Link
            to="/balances"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Big Net Balance Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between mb-4 ${
            netBalance > 0
              ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-900'
              : netBalance < 0
              ? 'bg-rose-50/70 border-rose-200/70 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Net Balance
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">
              {netBalance > 0
                ? `+${formatCurrency(netBalance)}`
                : netBalance < 0
                ? `-${formatCurrency(Math.abs(netBalance))}`
                : formatCurrency(0)}
            </h2>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              netBalance > 0
                ? 'bg-emerald-200/60 text-emerald-800'
                : netBalance < 0
                ? 'bg-rose-200/60 text-rose-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'Settled'}
          </span>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2.5">
          {debtors.slice(0, 3).map((item) => {
            const user = usersMap[item.userId] || { name: 'Friend' };
            return (
              <div
                key={item.userId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size="xs" />
                  <span className="font-semibold text-slate-800">
                    {user.name} owes you
                  </span>
                </div>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  {formatCurrency(item.amount)}
                </span>
              </div>
            );
          })}

          {creditors.slice(0, 3).map((item) => {
            const user = usersMap[item.userId] || { name: 'Friend' };
            return (
              <div
                key={item.userId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size="xs" />
                  <span className="font-semibold text-slate-800">
                    You owe {user.name}
                  </span>
                </div>
                <span className="font-bold text-rose-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {formatCurrency(item.amount)}
                </span>
              </div>
            );
          })}

          {debtors.length === 0 && creditors.length === 0 && (
            <p className="text-center py-4 text-xs text-slate-400">
              All balances are currently settled! 🎉
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-slate-500">Owed: </span>
          <span className="font-bold text-emerald-600">{formatCurrency(youAreOwed)}</span>
          <span className="text-slate-400 mx-1.5">•</span>
          <span className="text-slate-500">Owe: </span>
          <span className="font-bold text-rose-600">{formatCurrency(youOwe)}</span>
        </div>
        <Link
          to="/settlements"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <HandCoins className="w-3.5 h-3.5" />
          Settle up
        </Link>
      </div>
    </div>
  );
};
