import React from 'react';
import { ArrowRight, CheckCircle2, HandCoins } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

export const SettlementCard = ({
  transaction,
  membersMap = {},
  onSettle,
  currentUserId,
}) => {
  const debtor = membersMap[transaction.fromUser] || { name: transaction.fromUserName || 'Member' };
  const creditor = membersMap[transaction.toUser] || { name: transaction.toUserName || 'Member' };

  const isUserDebtor = transaction.fromUser === currentUserId;
  const isUserCreditor = transaction.toUser === currentUserId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Debtor to Creditor Flow */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={debtor.name} size="sm" />
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              {debtor.name}
              {isUserDebtor && <span className="text-rose-600 text-xs ml-1">(You)</span>}
            </span>
            <span className="text-[11px] text-slate-400">Payer</span>
          </div>
        </div>

        <div className="px-2 py-1 bg-slate-100 rounded-lg text-slate-500">
          <ArrowRight className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          <Avatar name={creditor.name} size="sm" />
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              {creditor.name}
              {isUserCreditor && <span className="text-emerald-600 text-xs ml-1">(You)</span>}
            </span>
            <span className="text-[11px] text-slate-400">Recipient</span>
          </div>
        </div>
      </div>

      {/* Amount and Status */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        <div className="sm:text-right">
          <span className="text-xs text-slate-400 font-medium block">
            Suggested Amount
          </span>
          <span className="text-lg font-black text-slate-900">
            {formatCurrency(transaction.amount)}
          </span>
        </div>

        {onSettle && (
          <Button
            size="sm"
            variant="primary"
            icon={HandCoins}
            onClick={() => onSettle(debtor, creditor, transaction.amount)}
          >
            Mark Paid
          </Button>
        )}
      </div>
    </div>
  );
};
