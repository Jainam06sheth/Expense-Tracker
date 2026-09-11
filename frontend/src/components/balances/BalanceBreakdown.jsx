import React from 'react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';
import { ArrowRight, History, Calendar, Receipt, HandCoins } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const BalanceBreakdown = ({
  debtor,
  creditor,
  history = [],
  totalAmount = 0,
  onSettleClick,
}) => {
  // Separate into historic/previous vs latest/new transaction
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const previousTransactions = sortedHistory.slice(0, -1);
  const latestTransaction = sortedHistory[sortedHistory.length - 1];

  const previousBalance = previousTransactions.reduce(
    (acc, t) => acc + (t.amount || 0),
    0
  );
  const latestAmount = latestTransaction ? latestTransaction.amount : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Pair Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar name={debtor?.name} size="md" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base">{debtor?.name}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <Avatar name={creditor?.name} size="sm" />
            <span className="font-bold text-blue-600 text-base">{creditor?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Net Balance
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          {onSettleClick && (
            <button
              type="button"
              onClick={() => onSettleClick(debtor, creditor, totalAmount)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <HandCoins className="w-3.5 h-3.5" />
              Settle
            </button>
          )}
        </div>
      </div>

      {/* Previous vs New Balance Calculation Visualizer */}
      {previousTransactions.length > 0 && latestTransaction && (
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-blue-800 mb-1">
            <History className="w-4 h-4" />
            <span>Balance Computation Breakdown</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
              <span className="text-slate-500 block text-[11px]">Previous Balance</span>
              <span className="font-bold text-slate-800 text-sm">
                {formatCurrency(previousBalance)}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
              <span className="text-slate-500 block text-[11px]">
                New Expense ({latestTransaction.name})
              </span>
              <span className="font-bold text-slate-800 text-sm">
                +{formatCurrency(latestAmount)}
              </span>
            </div>
            <div className="bg-blue-600 text-white p-2.5 rounded-lg shadow-2xs">
              <span className="text-blue-100 block text-[11px]">Total Net Owed</span>
              <span className="font-black text-sm">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Ledger Timeline */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Itemized Transactions Leading to this Balance
        </h5>

        <div className="divide-y divide-slate-100 text-xs">
          {sortedHistory.map((item, index) => {
            let itemDate = '';
            try {
              itemDate = format(parseISO(item.date), 'dd MMM yyyy, hh:mm a');
            } catch {
              itemDate = item.date;
            }

            const isPayment = item.type === 'payment';

            return (
              <div
                key={index}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isPayment ? <HandCoins className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-[11px] text-slate-400 block">{itemDate}</span>
                  </div>
                </div>

                <span
                  className={`font-black text-sm ${
                    isPayment ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {isPayment ? '-' : '+'}
                  {formatCurrency(Math.abs(item.amount))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
