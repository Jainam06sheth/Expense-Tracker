import React, { useState, useMemo } from 'react';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import { calculateGroupBalances } from '../utils/balanceCalculator';
import { calculateOptimizedSettlements } from '../utils/settlementCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { SettlementPlan } from '../components/settlements/SettlementPlan';
import { PaymentModal } from '../components/settlements/PaymentModal';
import { Select } from '../components/common/Select';
import { Tabs } from '../components/common/Tabs';
import { StatusBadge } from '../components/common/StatusBadge';
import { format, parseISO } from 'date-fns';
import { HandCoins, CheckCircle2, History, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settlements = () => {
  const currentUser = userService.getCurrentUser();
  const currentUserId = currentUser?.id || 'user-bharat';

  const [groups] = useState(() => groupService.getAll());
  const [expenses] = useState(() => expenseService.getAll());
  const [payments, setPayments] = useState(() => paymentService.getAll());
  const [users] = useState(() => userService.getAll());

  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'history'

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const groupsMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, [groups]);

  // Active Groups
  const activeGroups = useMemo(() => {
    if (selectedGroupId === 'all') return groups;
    return groups.filter((g) => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  // Calculate optimized plans for active groups
  const plans = useMemo(() => {
    const allPlans = [];
    activeGroups.forEach((group) => {
      const gExpenses = expenses.filter((e) => e.groupId === group.id);
      const gPayments = payments.filter((p) => p.groupId === group.id);
      const balances = calculateGroupBalances(gExpenses, gPayments, group.members || []);
      const gPlans = calculateOptimizedSettlements(balances.netBalances, usersMap);

      gPlans.forEach((plan) => {
        allPlans.push({
          ...plan,
          groupId: group.id,
          groupName: group.name,
        });
      });
    });
    return allPlans;
  }, [activeGroups, expenses, payments, usersMap]);

  // Filtered Payments History
  const filteredPayments = useMemo(() => {
    if (selectedGroupId === 'all') return payments;
    return payments.filter((p) => p.groupId === selectedGroupId);
  }, [payments, selectedGroupId]);

  const handleOpenSettle = (debtor, creditor, amount) => {
    setSettleTarget({ debtor, creditor, amount });
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (paymentData) => {
    const created = paymentService.create(paymentData, currentUser);
    setPayments((prev) => [created, ...prev]);
    toast.success(`Payment of ₹${created.amount} successfully recorded!`);
    setPaymentModalOpen(false);
    setSettleTarget(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Settlement Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate repayments and review debt-minimization settlement graphs.
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

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'plans',
            label: 'Optimized Settlement Plans',
            icon: HandCoins,
            count: plans.length,
          },
          {
            id: 'history',
            label: 'Payment History',
            icon: History,
            count: filteredPayments.length,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab: Plans */}
      {activeTab === 'plans' && (
        <SettlementPlan
          plans={plans}
          membersMap={usersMap}
          onSettle={handleOpenSettle}
          currentUserId={currentUserId}
        />
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Simulated Payments Log
          </h3>

          {filteredPayments.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No simulated payments recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const from = usersMap[p.fromUser] || { name: 'Member' };
                const to = usersMap[p.toUser] || { name: 'Member' };
                const group = groupsMap[p.groupId] || { name: 'Personal' };

                let pDate = 'Recently';
                try {
                  pDate = format(parseISO(p.date), 'dd MMM yyyy, hh:mm a');
                } catch {
                  pDate = p.date;
                }

                return (
                  <div
                    key={p.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{from.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-blue-600">{to.name}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">
                          {group.name} • Ref: {p.reference || p.id}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <span className="text-sm font-black text-emerald-600">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[11px] text-slate-400">{pDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settle Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        debtor={settleTarget?.debtor}
        creditor={settleTarget?.creditor}
        amount={settleTarget?.amount}
        groups={groups}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
