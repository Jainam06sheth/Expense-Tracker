import React from 'react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';
import { Receipt, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ExpensePreview = ({
  formData,
  items = [],
  membersMap = {},
  calculatedSplits = {},
  validationErrors = [],
}) => {
  const payer = membersMap[formData.paidBy] || { name: 'Member' };
  const totalAmount = Number(formData.amount) || 0;

  // Compute who owes whom for this expense
  const whoOwesWhom = [];
  Object.entries(calculatedSplits).forEach(([debtorId, share]) => {
    if (debtorId !== formData.paidBy && Number(share) > 0.01) {
      whoOwesWhom.push({
        from: membersMap[debtorId] || { name: debtorId },
        to: payer,
        amount: Number(share),
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Validation alert if any error exists */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Please resolve the following issues before saving:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5 mt-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bill Overview Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {formData.category} Expense
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              {formData.name || 'Untitled Expense'}
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              Paid by <span className="font-bold underline">{payer.name}</span> on{' '}
              {formData.date ? formData.date.split('T')[0] : 'Today'}
            </p>
          </div>

          <div className="sm:text-right bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-xs border border-white/20">
            <p className="text-xs text-blue-200 font-semibold">Total Amount</p>
            <p className="text-2xl font-black">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Item Breakdown (if item-based) */}
      {formData.splitMethod === 'item-based' && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Item Breakdown</h4>
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                    <span>Shared by:</span>
                    <span className="font-medium text-slate-600">
                      {item.participants
                        ?.map((id) => membersMap[id]?.name || id)
                        .join(', ') || 'None'}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Contributions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Member Contributions / Shares
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(calculatedSplits).map(([userId, share]) => {
            const member = membersMap[userId] || { name: 'Member' };
            const isPayer = userId === formData.paidBy;

            return (
              <div
                key={userId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={member.name} size="xs" />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {member.name} {isPayer && <span className="text-blue-600">(Payer)</span>}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isPayer
                        ? `Paid ${formatCurrency(totalAmount)}`
                        : 'Participating'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm block">
                    {formatCurrency(share)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">share</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Who Owes Whom Direct Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Direct Debts Created by this Expense
        </h4>
        {whoOwesWhom.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3">
            Payer paid entire amount for themselves or amounts are zero.
          </p>
        ) : (
          <div className="space-y-2">
            {whoOwesWhom.map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{debt.from.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-blue-600">{debt.to.name}</span>
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
