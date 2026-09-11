import React from 'react';
import { ArrowUpRight, ArrowDownLeft, HandCoins } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const BalanceCard = ({
  user,
  netAmount = 0,
  type = 'owed', // 'owed' (they owe you) or 'owe' (you owe them)
  onSettle,
}) => {
  const isOwed = type === 'owed';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <Avatar name={user?.name} size="md" />
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
              isOwed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isOwed ? (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Owes you
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                You owe
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-base sm:text-lg font-black ${
            isOwed ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {formatCurrency(Math.abs(netAmount))}
        </span>

        {onSettle && (
          <Button
            size="sm"
            variant={isOwed ? 'outline' : 'primary'}
            icon={HandCoins}
            onClick={() => onSettle(user, Math.abs(netAmount))}
          >
            Settle
          </Button>
        )}
      </div>
    </div>
  );
};
