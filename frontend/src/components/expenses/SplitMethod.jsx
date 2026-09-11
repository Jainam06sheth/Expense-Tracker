import React from 'react';
import { Users, Receipt, Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';
import { Input } from '../common/Input';

export const SplitMethod = ({
  splitMethod = 'equal',
  onSelectMethod,
  members = [],
  totalBill = 0,
  customSplits = {},
  onCustomSplitChange,
}) => {
  const methods = [
    {
      id: 'equal',
      title: 'Equal Split',
      description: 'Divide bill amount equally among selected participants.',
      icon: Users,
    },
    {
      id: 'item-based',
      title: 'Item-Based Split',
      description: 'Split each line item only among members who consumed it.',
      icon: Receipt,
    },
    {
      id: 'custom',
      title: 'Custom Split',
      description: 'Manually specify custom exact amounts for each member.',
      icon: Sliders,
    },
  ];

  const customSum = Object.values(customSplits).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );
  const diff = Math.round((Number(totalBill) - customSum) * 100) / 100;
  const isMatch = Math.abs(diff) < 0.01;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Choose Split Method</h4>
        <p className="text-xs text-slate-500">
          Select how you want to calculate individual shares for this bill.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((m) => {
          const Icon = m.icon;
          const isSelected = splitMethod === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h5 className="text-sm font-bold text-slate-900 mb-1">{m.title}</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-600">
                {isSelected ? '✓ Selected' : 'Click to select'}
              </div>
            </div>
          );
        })}
      </div>

      {/* If Custom Split is selected, render manual amount inputs */}
      {splitMethod === 'custom' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-slate-900">Custom Split Breakdown</h5>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                isMatch
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isMatch
                ? 'Balanced'
                : `Remaining: ${formatCurrency(Math.abs(diff))}`}
            </span>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between pt-3 first:pt-0 gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div className="w-36">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={customSplits[member.id] || ''}
                    onChange={(e) => onCustomSplitChange(member.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {!isMatch && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Split amounts must equal the total bill of{' '}
                <strong>{formatCurrency(totalBill)}</strong>. Current sum is{' '}
                <strong>{formatCurrency(customSum)}</strong>.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
