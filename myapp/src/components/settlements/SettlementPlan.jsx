import React from 'react';
import { SettlementCard } from './SettlementCard';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const SettlementPlan = ({
  plans = [],
  membersMap = {},
  onSettle,
  currentUserId,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-600 text-white flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Smart Optimized Settlement Plan
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            CampusSettle calculates the minimum number of transactions needed to settle
            all debts between members, eliminating circular payments.
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-900">All Settled Up!</h4>
          <p className="text-xs text-slate-500 mt-1">
            There are no pending debts to settle in this group. Everyone is even.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <SettlementCard
              key={plan.id}
              transaction={plan}
              membersMap={membersMap}
              onSettle={onSettle}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
