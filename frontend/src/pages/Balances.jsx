import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';

import {
  calculateGroupBalances,
  calculateUserOverallSummary,
} from '../utils/balanceCalculator';

import { formatCurrency } from '../utils/currencyFormatter';

import { BalanceBreakdown } from '../components/balances/BalanceBreakdown';
import { PaymentModal } from '../components/settlements/PaymentModal';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';

import {
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

import toast from 'react-hot-toast';

export const Balances = () => {
  const [currentUser, setCurrentUser] =
    useState(
      userService.getCurrentUser()
    );

  const [groups, setGroups] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  /*
   * Keep members separately because the backend
   * stores GroupMember documents separately from Group.
   */
  const [groupMembers, setGroupMembers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [selectedGroupId, setSelectedGroupId] =
    useState('all');

  // Payment Modal State
  const [
    paymentModalOpen,
    setPaymentModalOpen,
  ] = useState(false);

  const [
    settlementTarget,
    setSettlementTarget,
  ] = useState(null);

  /*
   * Load balance data
   */
  useEffect(() => {
    const loadBalanceData =
      async () => {
        try {
          setLoading(true);

          /*
           * Current user
           */
          const profileResult =
            await userService.loadProfile();

          let loggedInUser =
            currentUser;

          if (
            profileResult.success &&
            profileResult.user
          ) {
            loggedInUser =
              profileResult.user;

            setCurrentUser(
              profileResult.user
            );
          }

          /*
           * Groups
           */
          const groupsData =
            await groupService.getAll();

          const safeGroups =
            groupsData || [];

          setGroups(
            safeGroups
          );

          const allExpenses = [];
          const allPayments = [];

          const membersMap = {};
          const usersMap = new Map();

          /*
           * Add current user first
           */
          if (loggedInUser) {
            const userId =
              loggedInUser.id ||
              loggedInUser._id;

            if (userId) {
              usersMap.set(
                String(userId),
                loggedInUser
              );
            }
          }

          /*
           * Load each group's:
           *
           * 1. Expenses
           * 2. Payments
           * 3. Members
           */
          for (
            const group of safeGroups
          ) {
            const groupId =
              group.id ||
              group._id;

            /*
             * Expenses
             */
            try {
              const groupExpenses =
                await expenseService.getByGroup(
                  groupId
                );

              allExpenses.push(
                ...(groupExpenses || [])
              );
            } catch (error) {
              console.error(
                `Unable to load expenses for group ${groupId}:`,
                error
              );
            }

            /*
             * Payments
             */
            try {
              const groupPayments =
                await paymentService.getByGroup(
                  groupId
                );

              allPayments.push(
                ...(groupPayments || [])
              );
            } catch (error) {
              console.error(
                `Unable to load payments for group ${groupId}:`,
                error
              );
            }

            /*
             * Members
             */
            try {
              const members =
                await groupService.getMembers(
                  groupId
                );

              membersMap[groupId] =
                members || [];

              /*
               * Build users map
               */
              (
                members || []
              ).forEach(
                (member) => {
                  const memberUser =
                    member.user ||
                    member;

                  const memberId =
                    memberUser.id ||
                    memberUser._id ||
                    member.userId;

                  if (!memberId) {
                    return;
                  }

                  usersMap.set(
                    String(memberId),
                    {
                      ...memberUser,
                      id: memberId,
                      _id: memberId,
                      name:
                        memberUser.name ||
                        member.name ||
                        'Member',
                      email:
                        memberUser.email ||
                        member.email ||
                        '',
                    }
                  );
                }
              );
            } catch (error) {
              console.error(
                `Unable to load members for group ${groupId}:`,
                error
              );

              membersMap[groupId] =
                [];
            }
          }

          setExpenses(
            allExpenses
          );

          setPayments(
            allPayments
          );

          setGroupMembers(
            membersMap
          );

          setUsers(
            Array.from(
              usersMap.values()
            )
          );
        } catch (error) {
          console.error(
            'Unable to load balances:',
            error
          );

          toast.error(
            error.message ||
              'Unable to load balances'
          );
        } finally {
          setLoading(false);
        }
      };

    loadBalanceData();
  }, []);

  /*
   * Users map
   */
  const usersMap = useMemo(() => {
    const map = {};

    users.forEach(
      (user) => {
        const userId =
          user.id ||
          user._id;

        if (userId) {
          map[userId] = {
            ...user,
            id: userId,
          };
        }
      }
    );

    return map;
  }, [users]);

  /*
   * Overall User Summary
   */
  const overallSummary =
    useMemo(() => {
      return calculateUserOverallSummary(
        currentUser?.id || '',
        expenses,
        payments,
        groups
      );
    }, [
      currentUser,
      expenses,
      payments,
      groups,
    ]);

  /*
   * Selected Group Data
   */
  const activeGroups =
    useMemo(() => {
      if (
        selectedGroupId ===
        'all'
      ) {
        return groups;
      }

      return groups.filter(
        (group) =>
          String(
            group.id ||
              group._id
          ) ===
          String(
            selectedGroupId
          )
      );
    }, [
      groups,
      selectedGroupId,
    ]);

  /*
   * Aggregate Pairwise Balances
   */
  const aggregatedBalances =
    useMemo(() => {
      const allDebts = [];

      activeGroups.forEach(
        (group) => {
          const groupId =
            group.id ||
            group._id;

          const groupExpenses =
            expenses.filter(
              (expense) =>
                String(
                  expense.groupId
                ) ===
                String(groupId)
            );

          const groupPayments =
            payments.filter(
              (payment) =>
                String(
                  payment.groupId
                ) ===
                String(groupId)
            );

          /*
           * IMPORTANT:
           *
           * calculateGroupBalances()
           * expects members directly.
           *
           * We provide the members loaded
           * from GET /groups/:groupId/members.
           */
          const members =
            groupMembers[
              groupId
            ] || [];

          const res =
            calculateGroupBalances(
              groupExpenses,
              groupPayments,
              members
            );

          res.directDebts.forEach(
            (debt) => {
              allDebts.push({
                ...debt,
                groupId,
                groupName:
                  group.name,
              });
            }
          );
        }
      );

      return allDebts;
    }, [
      activeGroups,
      expenses,
      payments,
      groupMembers,
    ]);

  /*
   * Open Settle Modal
   */
  const handleOpenSettle = (
    debtor,
    creditor,
    amount
  ) => {
    setSettlementTarget({
      debtor,
      creditor,
      amount,
    });

    setPaymentModalOpen(
      true
    );
  };

  /*
   * Create Payment
   */
  const handleConfirmPayment =
    async (paymentData) => {
      try {
        const created =
          await paymentService.create(
            paymentData
          );

        if (!created) {
          toast.error(
            'Unable to record payment'
          );

          return;
        }

        /*
         * Add newly created payment
         * to local React state.
         *
         * This avoids another complete
         * dashboard/balance reload.
         */
        setPayments(
          (prev) => [
            created,
            ...prev,
          ]
        );

        toast.success(
          `Payment of ${formatCurrency(
            created.amount
          )} successfully recorded!`
        );

        setPaymentModalOpen(
          false
        );

        setSettlementTarget(
          null
        );
      } catch (error) {
        console.error(
          'Unable to create payment:',
          error
        );

        toast.error(
          error.message ||
            'Unable to record payment'
        );
      }
    };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">
          Loading balances...
        </p>
      </div>
    );
  }

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
            value={
              selectedGroupId
            }
            onChange={(e) =>
              setSelectedGroupId(
                e.target.value
              )
            }
            options={[
              {
                value: 'all',
                label:
                  'All Groups',
              },
              ...groups.map(
                (group) => ({
                  value:
                    group.id ||
                    group._id,
                  label:
                    group.name,
                })
              ),
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
              overallSummary.netBalance >
              0
                ? 'text-emerald-600'
                : overallSummary.netBalance <
                  0
                ? 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {formatCurrency(
              Math.abs(
                overallSummary.netBalance
              )
            )}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            {overallSummary.netBalance >
            0
              ? 'You are owed money overall'
              : overallSummary.netBalance <
                0
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

            {formatCurrency(
              overallSummary.youAreOwed
            )}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Pending receivables from others
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            You Owe Friends
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-6 h-6" />

            {formatCurrency(
              overallSummary.youOwe
            )}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Payables you need to clear
          </p>
        </div>
      </div>

      {/* Pairwise Ledger Breakdowns */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Pairwise Debt Ledgers & Computation Breakdown
        </h3>

        {aggregatedBalances.length ===
        0 ? (
          <EmptyState
            icon={Scale}
            title="All balances are settled"
            description="There are currently no outstanding debts between members in this selection."
          />
        ) : (
          <div className="space-y-4">
            {aggregatedBalances.map(
              (
                debt,
                index
              ) => {
                const debtor =
                  usersMap[
                    debt.fromUser
                  ] || {
                    name:
                      debt.fromUser,
                  };

                const creditor =
                  usersMap[
                    debt.toUser
                  ] || {
                    name:
                      debt.toUser,
                  };

                return (
                  <div
                    key={`${debt.groupId}-${debt.fromUser}-${debt.toUser}-${index}`}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pl-1">
                      <span>
                        Group:
                      </span>

                      <span className="text-blue-600 font-bold">
                        {
                          debt.groupName
                        }
                      </span>
                    </div>

                    <BalanceBreakdown
                      debtor={
                        debtor
                      }
                      creditor={
                        creditor
                      }
                      history={
                        debt.history ||
                        []
                      }
                      totalAmount={
                        debt.amount
                      }
                      onSettleClick={
                        handleOpenSettle
                      }
                    />
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Settle Up Payment Modal */}
      <PaymentModal
        isOpen={
          paymentModalOpen
        }
        onClose={() =>
          setPaymentModalOpen(
            false
          )
        }
        debtor={
          settlementTarget?.debtor
        }
        creditor={
          settlementTarget?.creditor
        }
        amount={
          settlementTarget?.amount
        }
        groups={groups}
        onConfirmPayment={
          handleConfirmPayment
        }
      />
    </div>
  );
};