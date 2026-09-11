import React, { useState, useEffect, useMemo } from 'react';
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
import { format, parseISO } from 'date-fns';
import { HandCoins, CheckCircle2, History, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settlements = () => {
  const [currentUser, setCurrentUser] = useState(
    userService.getCurrentUser()
  );

  const currentUserId = currentUser?.id || '';

  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [activeTab, setActiveTab] = useState('plans');

  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  /*
   * Load all settlement-related data
   */
  useEffect(() => {
    const loadSettlementData = async () => {
      try {
        setLoading(true);

        /*
         * Refresh current user from backend
         */
        const profileResult =
          await userService.loadProfile();

        if (
          profileResult.success &&
          profileResult.user
        ) {
          setCurrentUser(profileResult.user);
        }

        /*
         * Load groups
         */
        const groupsData =
          await groupService.getAll();

        setGroups(groupsData || []);

        /*
         * Load expenses and payments.
         *
         * These service methods need to use backend APIs.
         */
        const allExpenses = [];
        const allPayments = [];

        for (const group of groupsData || []) {
          const groupId = group.id || group._id;

          const [
            groupExpenses,
            groupPayments,
          ] = await Promise.all([
            expenseService.getByGroup(groupId),
            paymentService.getByGroup(groupId),
          ]);

          allExpenses.push(
            ...(groupExpenses || [])
          );

          allPayments.push(
            ...(groupPayments || [])
          );
        }

        setExpenses(allExpenses);
        setPayments(allPayments);

        /*
         * The current backend does not expose GET /users.
         *
         * Therefore we cannot blindly call userService.getAll().
         *
         * We collect users from group members instead.
         */
        const usersMap = new Map();

        for (const group of groupsData || []) {
          const groupId =
            group.id || group._id;

          try {
            const members =
              await groupService.getMembers(
                groupId
              );

            (members || []).forEach((member) => {
              const user =
                member.user || member;

              const id =
                user.id ||
                user._id ||
                member.userId;

              if (id) {
                usersMap.set(String(id), {
                  ...user,
                  id,
                  _id: id,
                  name:
                    user.name ||
                    member.name ||
                    'Member',
                  email:
                    user.email ||
                    member.email ||
                    '',
                });
              }
            });
          } catch (error) {
            console.error(
              `Unable to load members for group ${groupId}:`,
              error
            );
          }
        }

        /*
         * Make sure current user is also available
         */
        if (profileResult.success && profileResult.user) {
          usersMap.set(
            String(
              profileResult.user.id
            ),
            profileResult.user
          );
        }

        setUsers(
          Array.from(usersMap.values())
        );
      } catch (error) {
        console.error(
          'Error loading settlement data:',
          error
        );

        toast.error(
          error.message ||
            'Unable to load settlement data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettlementData();
  }, []);

  const usersMap = useMemo(() => {
    const map = {};

    users.forEach((u) => {
      const id = u.id || u._id;

      if (id) {
        map[id] = u;
      }
    });

    return map;
  }, [users]);

  const groupsMap = useMemo(() => {
    const map = {};

    groups.forEach((g) => {
      const id = g.id || g._id;

      if (id) {
        map[id] = g;
      }
    });

    return map;
  }, [groups]);

  /*
   * Active Groups
   */
  const activeGroups = useMemo(() => {
    if (selectedGroupId === 'all') {
      return groups;
    }

    return groups.filter(
      (g) =>
        String(g.id || g._id) ===
        String(selectedGroupId)
    );
  }, [groups, selectedGroupId]);

  /*
   * Calculate optimized settlement plans
   */
  const plans = useMemo(() => {
    const allPlans = [];

    activeGroups.forEach((group) => {
      const groupId =
        group.id || group._id;

      const gExpenses = expenses.filter(
        (e) =>
          String(e.groupId) ===
          String(groupId)
      );

      const gPayments = payments.filter(
        (p) =>
          String(p.groupId) ===
          String(groupId)
      );

      /*
       * Your existing calculator expects group.members.
       *
       * Backend group objects may not contain members,
       * so we use the users belonging to this group.
       */
      const groupMembers =
        users.filter((user) => {
          const userId =
            String(user.id || user._id);

          return (
            group.members?.some(
              (member) =>
                String(
                  member.id ||
                    member.userId ||
                    member._id
                ) === userId
            ) ||
            group.members?.some(
              (member) =>
                String(member.userId) ===
                userId
            )
          );
        });

      const members =
        group.members?.length
          ? group.members
          : groupMembers;

      const balances =
        calculateGroupBalances(
          gExpenses,
          gPayments,
          members
        );

      const gPlans =
        calculateOptimizedSettlements(
          balances.netBalances,
          usersMap
        );

      gPlans.forEach((plan) => {
        allPlans.push({
          ...plan,
          groupId,
          groupName: group.name,
        });
      });
    });

    return allPlans;
  }, [
    activeGroups,
    expenses,
    payments,
    users,
    usersMap,
  ]);

  /*
   * Filter Payment History
   */
  const filteredPayments = useMemo(() => {
    if (selectedGroupId === 'all') {
      return payments;
    }

    return payments.filter(
      (p) =>
        String(p.groupId) ===
        String(selectedGroupId)
    );
  }, [payments, selectedGroupId]);

  const handleOpenSettle = (
    debtor,
    creditor,
    amount
  ) => {
    setSettleTarget({
      debtor,
      creditor,
      amount,
    });

    setPaymentModalOpen(true);
  };

  /*
   * Create real payment through backend
   */
  const handleConfirmPayment = async (
    paymentData
  ) => {
    try {
      setPaymentLoading(true);

      const created =
        await paymentService.create(
          paymentData,
          currentUser
        );

      if (!created) {
        toast.error(
          'Unable to record payment'
        );

        return;
      }

      /*
       * Payment was successfully stored
       * in MongoDB.
       */
      setPayments((prev) => [
        created,
        ...prev,
      ]);

      toast.success(
        `Payment of ₹${created.amount} successfully recorded!`
      );

      setPaymentModalOpen(false);
      setSettleTarget(null);
    } catch (error) {
      console.error(
        'Error creating payment:',
        error
      );

      toast.error(
        error.message ||
          'Unable to record payment'
      );
    } finally {
      setPaymentLoading(false);
    }
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
            onChange={(e) =>
              setSelectedGroupId(
                e.target.value
              )
            }
            options={[
              {
                value: 'all',
                label: 'All Groups',
              },
              ...groups.map((g) => ({
                value:
                  g.id || g._id,
                label: g.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'plans',
            label:
              'Optimized Settlement Plans',
            icon: HandCoins,
            count: plans.length,
          },
          {
            id: 'history',
            label: 'Payment History',
            icon: History,
            count:
              filteredPayments.length,
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

          {filteredPayments.length ===
          0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No simulated payments recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map(
                (p) => {
                  const from =
                    usersMap[
                      p.fromUser
                    ] || {
                      name: 'Member',
                    };

                  const to =
                    usersMap[
                      p.toUser
                    ] || {
                      name: 'Member',
                    };

                  const group =
                    groupsMap[
                      p.groupId
                    ] || {
                      name: 'Personal',
                    };

                  let pDate =
                    'Recently';

                  try {
                    pDate = format(
                      parseISO(p.date),
                      'dd MMM yyyy, hh:mm a'
                    );
                  } catch {
                    pDate = p.date;
                  }

                  return (
                    <div
                      key={
                        p.id ||
                        p._id
                      }
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {
                                from.name
                              }
                            </span>

                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                            <span className="font-bold text-blue-600">
                              {
                                to.name
                              }
                            </span>
                          </div>

                          <p className="text-slate-400 mt-0.5">
                            {
                              group.name
                            }{' '}
                            • Ref:{' '}
                            {p.reference ||
                              p.id ||
                              p._id}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <span className="text-sm font-black text-emerald-600">
                          {formatCurrency(
                            p.amount
                          )}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {pDate}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* Settle Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() =>
          setPaymentModalOpen(
            false
          )
        }
        debtor={
          settleTarget?.debtor
        }
        creditor={
          settleTarget?.creditor
        }
        amount={
          settleTarget?.amount
        }
        groups={groups}
        onConfirmPayment={
          handleConfirmPayment
        }
        loading={paymentLoading}
      />
    </div>
  );
};