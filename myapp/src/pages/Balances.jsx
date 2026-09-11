import React, { useState, useMemo } from 'react';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import {
  calculateGroupBalances,
  calculateUserOverallSummary,
} from '../utils/balanceCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { BalanceCard } from '../components/balances/BalanceCard';
import { BalanceBreakdown } from '../components/balances/BalanceBreakdown';
import { PaymentModal } from '../components/settlements/PaymentModal';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { Scale, ArrowDownLeft, ArrowUpRight, HandCoins } from 'lucide-react';
import toast from 'react-hot-toast';

export const Balances = () => {
  const currentUser = userService.getCurrentUser();
  const currentUserId = currentUser?.id || 'user-bharat';

  const [groups] = useState(() => groupService.getAll());
  const [expenses] = useState(() => expenseService.getAll());
  const [payments, setPayments] = useState(() => paymentService.getAll());
  const [users] = useState(() => userService.getAll());

  const [selectedGroupId, setSelectedGroupId] = useState('all');

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState(null);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Overall User Summary
  const overallSummary = useMemo(() => {
    return calculateUserOverallSummary(currentUserId, expenses, payments, groups);
  }, [currentUserId, expenses, payments, groups]);

  // Selected Group Data
  const activeGroups = useMemo(() => {
    if (selectedGroupId === 'all') return groups;
    return groups.filter((g) => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  // Aggregate Pairwise Balances across active groups
  const aggregatedBalances = useMemo(() => {
    const allDebts = [];
    activeGroups.forEach((group) => {
      const groupExpenses = expenses.filter((e) => e.groupId === group.id);
      const groupPayments = payments.filter((p) => p.groupId === group.id);
      const res = calculateGroupBalances(groupExpenses, groupPayments, group.members || []);

      res.directDebts.forEach((d) => {
        allDebts.push({
          ...d,
          groupId: group.id,
          groupName: group.name,
        });
      });
    });

    return allDebts;
  }, [activeGroups, expenses, payments]);

  const handleOpenSettle = (debtor, creditor, amount) => {
    setSettlementTarget({ debtor, creditor, amount });
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (paymentData) => {
    const created = paymentService.create(paymentData, currentUser);
    setPayments((prev) => [created, ...prev]);
    toast.success(`Payment of ₹${created.amount} successfully recorded!`);
    setPaymentModalOpen(false);
    setSettlementTarget(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Balances & Ledgers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track historical contributions, who owes whom, and net settlements.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            options={[
              { value: 'all', label: 'All Groups' },
              ...groups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Net Standing
          </span>
          <h3
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${
              overallSummary.netBalance > 0
                ? 'text-emerald-600'
                : overallSummary.netBalance < 0
                ? 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {overallSummary.netBalance > 0
              ? `+${formatCurrency(overallSummary.netBalance)}`
              : overallSummary.netBalance < 0
              ? `-${formatCurrency(Math.abs(overallSummary.netBalance))}`
              : formatCurrency(0)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {overallSummary.netBalance > 0
              ? 'You are owed money overall'
              : overallSummary.netBalance < 0
              ? 'You owe money to friends'
              : 'All your accounts are settled'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Friends Owe You
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight mt-1 flex items-center gap-1">
            <ArrowDownLeft className="w-6 h-6" />
            {formatCurrency(overallSummary.youAreOwed)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Pending receivables from others</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            You Owe Friends
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-6 h-6" />
            {formatCurrency(overallSummary.youOwe)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Payables you need to clear</p>
        </div>
      </div>

      {/* Pairwise Ledger Breakdowns */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Pairwise Debt Ledgers & Computation Breakdown
        </h3>

        {aggregatedBalances.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="All balances are settled"
            description="There are currently no outstanding debts between members in this selection."
          />
        ) : (
          <div className="space-y-4">
            {aggregatedBalances.map((debt, idx) => {
              const debtor = usersMap[debt.fromUser] || { name: debt.fromUser };
              const creditor = usersMap[debt.toUser] || { name: debt.toUser };

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pl-1">
                    <span>Group:</span>
                    <span className="text-blue-600 font-bold">{debt.groupName}</span>
                  </div>

                  <BalanceBreakdown
                    debtor={debtor}
                    creditor={creditor}
                    history={debt.history || []}
                    totalAmount={debt.amount}
                    onSettleClick={handleOpenSettle}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settle Up Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        debtor={settlementTarget?.debtor}
        creditor={settlementTarget?.creditor}
        amount={settlementTarget?.amount}
        groups={groups}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
