import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import { invitationService } from '../services/invitationService';
import { calculateGroupBalances } from '../utils/balanceCalculator';
import { calculateOptimizedSettlements } from '../utils/settlementCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { MemberList } from '../components/groups/MemberList';
import { AddMemberModal } from '../components/groups/AddMemberModal';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { BalanceBreakdown } from '../components/balances/BalanceBreakdown';
import { SettlementPlan } from '../components/settlements/SettlementPlan';
import { PaymentModal } from '../components/settlements/PaymentModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { EmptyState } from '../components/common/EmptyState';
import {
  ArrowLeft,
  Plus,
  UserPlus,
  Users,
  Receipt,
  Scale,
  HandCoins,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    userService.getCurrentUser()
  );

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('expenses');

  // Modals
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] =
    useState(false);

  const [
    selectedSettlementPair,
    setSelectedSettlementPair,
  ] = useState(null);

  const [expenseToDelete, setExpenseToDelete] =
    useState(null);

  const [
    deleteExpenseConfirmOpen,
    setDeleteExpenseConfirmOpen,
  ] = useState(false);

  const [memberToRemove, setMemberToRemove] =
    useState(null);

  const [
    removeMemberConfirmOpen,
    setRemoveMemberConfirmOpen,
  ] = useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  /*
   * Load group, members, expenses and payments
   */
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);

        /*
         * Get latest authenticated user
         */
        const profileResult =
          await userService.loadProfile();

        if (
          profileResult.success &&
          profileResult.user
        ) {
          setCurrentUser(
            profileResult.user
          );
        }

        /*
         * Get group
         */
        const groupData =
          await groupService.getById(id);

        if (!groupData) {
          setGroup(null);
          return;
        }

        setGroup(groupData);

        /*
         * Get group members
         */
        const membersData =
          await groupService.getMembers(id);

        setMembers(
          membersData || []
        );

        /*
         * Get group expenses
         */
        const expensesData =
          await expenseService.getByGroup(id);

        setExpenses(
          expensesData || []
        );

        /*
         * Get group payments
         */
        const paymentsData =
          await paymentService.getByGroup(id);

        setPayments(
          paymentsData || []
        );

        /*
         * Users are needed by AddMemberModal.
         * Fetch all users from the backend.
         */
        try {
          const usersResult = await userService.getAll();
          setUsers(usersResult || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          // Fallback to building from group data if API fails
          const userMap = new Map();

          if (
            profileResult.success &&
            profileResult.user
          ) {
            userMap.set(
              String(
                profileResult.user.id
              ),
              profileResult.user
            );
          }

          (membersData || []).forEach(
            (member) => {
              const memberUser =
                member.user || member;

              const memberId =
                memberUser.id ||
                memberUser._id ||
                member.userId;

              if (memberId) {
                userMap.set(
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
            }
          );

          setUsers(
            Array.from(
              userMap.values()
            )
          );
        }
      } catch (error) {
        console.error(
          'Error loading group details:',
          error
        );

        toast.error(
          error.message ||
            'Unable to load group'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadGroupData();
    }
  }, [id]);

  /*
   * Group members map
   */
  const membersMap = useMemo(() => {
    const map = {};

    members.forEach((member) => {
      const memberId =
        member.id ||
        member._id ||
        member.userId;

      if (memberId) {
        map[memberId] = {
          ...member,
          id: memberId,
        };
      }
    });

    return map;
  }, [members]);

  /*
   * Financial calculations
   */
  const balances = useMemo(() => {
    return calculateGroupBalances(
      expenses,
      payments,
      members
    );
  }, [
    expenses,
    payments,
    members,
  ]);

  const optimizedPlans = useMemo(() => {
    return calculateOptimizedSettlements(
      balances.netBalances,
      membersMap
    );
  }, [
    balances.netBalances,
    membersMap,
  ]);

  const totalSpent = useMemo(() => {
    return expenses.reduce(
      (acc, expense) =>
        acc +
        (Number(expense.amount) || 0),
      0
    );
  }, [expenses]);

  const userNetInGroup =
    balances.netBalances[
      currentUser?.id || ''
    ] || 0;

  /*
   * Add Member
   *
   * IMPORTANT:
   * This now sends an invitation rather than directly
   * creating a GroupMember.
   */
  const handleAddMember = async (
    memberData,
    callback
  ) => {
    try {
      const invitedUserId =
        memberData.userId ||
        memberData.id ||
        memberData._id;

      if (!invitedUserId) {
        toast.error(
          'A valid user is required'
        );

        return;
      }

      const result =
        await invitationService.create({
          groupId: id,
          invitedUser:
            invitedUserId,
        });

      if (!result.success) {
        toast.error(
          result.message ||
            'Unable to send invitation'
        );

        return;
      }

      toast.success(
        'Group invitation sent successfully'
      );

      callback?.();
      setAddMemberOpen(false);
    } catch (error) {
      console.error(
        'Error sending invitation:',
        error
      );

      toast.error(
        error.message ||
          'Unable to send invitation'
      );
    }
  };

  /*
   * Remove Member
   */
  const handleOpenRemoveMember = (
    member
  ) => {
    setMemberToRemove(member);
    setRemoveMemberConfirmOpen(true);
  };

  const handleConfirmRemoveMember =
    async () => {
      if (!memberToRemove) {
        return;
      }

      try {
        const memberId =
          memberToRemove.userId ||
          memberToRemove.id ||
          memberToRemove._id;

        const result =
          await groupService.removeMember(
            id,
            memberId
          );

        if (!result.success) {
          toast.error(
            result.message ||
              'Cannot remove member'
          );

          return;
        }

        setMembers((prev) =>
          prev.filter((member) => {
            const currentId =
              member.userId ||
              member.id ||
              member._id;

            return (
              String(currentId) !==
              String(memberId)
            );
          })
        );

        toast.success(
          `Removed ${memberToRemove.name}`
        );
      } catch (error) {
        console.error(
          'Error removing member:',
          error
        );

        toast.error(
          error.message ||
            'Cannot remove member'
        );
      } finally {
        setRemoveMemberConfirmOpen(
          false
        );

        setMemberToRemove(null);
      }
    };

  /*
   * Delete Expense
   */
  const handleOpenDeleteExpense = (
    expense
  ) => {
    setExpenseToDelete(expense);
    setDeleteExpenseConfirmOpen(true);
  };

  const handleConfirmDeleteExpense =
    async () => {
      if (!expenseToDelete) {
        return;
      }

      try {
        const expenseId =
          expenseToDelete.id ||
          expenseToDelete._id;

        const result =
          await expenseService.delete(
            expenseId
          );

        if (!result.success) {
          toast.error(
            result.message ||
              'Unable to delete expense'
          );

          return;
        }

        setExpenses((prev) =>
          prev.filter((expense) => {
            const currentId =
              expense.id ||
              expense._id;

            return (
              String(currentId) !==
              String(expenseId)
            );
          })
        );

        toast.success(
          'Expense deleted and balances recalculated'
        );
      } catch (error) {
        console.error(
          'Error deleting expense:',
          error
        );

        toast.error(
          error.message ||
            'Unable to delete expense'
        );
      } finally {
        setDeleteExpenseConfirmOpen(
          false
        );

        setExpenseToDelete(null);
      }
    };

  /*
   * Open settlement modal
   */
  const handleOpenSettle = (
    debtor,
    creditor,
    amount
  ) => {
    setSelectedSettlementPair({
      debtor,
      creditor,
      amount,
    });

    setPaymentModalOpen(true);
  };

  /*
   * Create Payment
   */
  const handleConfirmPayment =
    async (paymentData) => {
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

        setPayments((prev) => [
          created,
          ...prev,
        ]);

        toast.success(
          `Payment of ₹${created.amount} recorded! Balances settled.`
        );

        setPaymentModalOpen(false);
        setSelectedSettlementPair(
          null
        );
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

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">
          Loading group...
        </p>
      </div>
    );
  }

  /*
   * Group not found
   */
  if (!group) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">
          Group not found
        </h3>

        <p className="text-xs text-slate-500 mt-1 mb-4">
          This group might have been removed.
        </p>

        <Button
          onClick={() =>
            navigate('/groups')
          }
        >
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Groups</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={UserPlus}
            onClick={() =>
              setAddMemberOpen(true)
            }
          >
            Add Member
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() =>
              navigate(
                `/expenses/add?groupId=${group.id || group._id}`
              )
            }
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Group Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {group.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {group.name}
                </h2>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {group.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {group.description ||
                  'No description provided.'}
              </p>
            </div>
          </div>

          {/* Group Stat Pills */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 self-stretch md:self-auto">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Group Spent
              </span>

              <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
                {formatCurrency(
                  totalSpent
                )}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Your Balance
              </span>

              <span
                className={`text-lg sm:text-xl font-black mt-0.5 block ${
                  userNetInGroup > 0
                    ? 'text-emerald-600'
                    : userNetInGroup < 0
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {formatCurrency(
                  Math.abs(
                    userNetInGroup
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'expenses',
            label: 'Expenses',
            icon: Receipt,
            count: expenses.length,
          },
          {
            id: 'balances',
            label: 'Balances Breakdown',
            icon: Scale,
          },
          {
            id: 'settlements',
            label: 'Settlement Plan',
            icon: HandCoins,
            count:
              optimizedPlans.length,
          },
          {
            id: 'members',
            label: 'Members',
            icon: Users,
            count: members.length,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Expenses */}
      {activeTab === 'expenses' && (
        <div>
          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses in this group yet"
              description="Add your first shared expense, bill, or receipt to this group."
              actionLabel="Add Expense"
              onAction={() =>
                navigate(
                  `/expenses/add?groupId=${group.id || group._id}`
                )
              }
              actionIcon={Plus}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenses.map(
                (expense) => {
                  const payer =
                    membersMap[
                      expense.paidBy
                    ] || {
                      name: 'Member',
                    };

                  return (
                    <ExpenseCard
                      key={
                        expense.id ||
                        expense._id
                      }
                      expense={expense}
                      group={group}
                      payer={payer}
                      membersMap={
                        membersMap
                      }
                      currentUserId={
                        currentUser?.id ||
                        ''
                      }
                      onEdit={() =>
                        navigate(
                          `/expenses/add?editId=${expense.id || expense._id}`
                        )
                      }
                      onDelete={
                        handleOpenDeleteExpense
                      }
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Balances Breakdown */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          {balances.directDebts
            .length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-base font-bold text-slate-800">
                All balances are
                currently even! 🎉
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Nobody owes anybody
                in this group right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {balances.directDebts.map(
                (debt, idx) => {
                  const debtor =
                    membersMap[
                      debt.fromUser
                    ] || {
                      name:
                        debt.fromUser,
                    };

                  const creditor =
                    membersMap[
                      debt.toUser
                    ] || {
                      name:
                        debt.toUser,
                    };

                  return (
                    <BalanceBreakdown
                      key={idx}
                      debtor={debtor}
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
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settlement Plan */}
      {activeTab === 'settlements' && (
        <SettlementPlan
          plans={optimizedPlans}
          membersMap={membersMap}
          onSettle={handleOpenSettle}
          currentUserId={
            currentUser?.id || ''
          }
        />
      )}

      {/* Tab 4: Members */}
      {activeTab === 'members' && (
        <MemberList
          members={members}
          currentUserId={
            currentUser?.id || ''
          }
          onRemoveMember={
            handleOpenRemoveMember
          }
          isGroupAdmin={true}
        />
      )}

      {/* Add Member */}
      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() =>
          setAddMemberOpen(false)
        }
        onAddMember={
          handleAddMember
        }
        users={users}
        groupMembers={members}
      />

      {/* Payment */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() =>
          setPaymentModalOpen(false)
        }
        debtor={
          selectedSettlementPair?.debtor
        }
        creditor={
          selectedSettlementPair?.creditor
        }
        amount={
          selectedSettlementPair?.amount
        }
        groupId={
          group.id || group._id
        }
        groups={[group]}
        onConfirmPayment={
          handleConfirmPayment
        }
        loading={paymentLoading}
      />

      {/* Delete Expense */}
      <ConfirmModal
        isOpen={
          deleteExpenseConfirmOpen
        }
        onClose={() =>
          setDeleteExpenseConfirmOpen(
            false
          )
        }
        onConfirm={
          handleConfirmDeleteExpense
        }
        title="Delete Expense?"
        message={`Are you sure you want to remove "${expenseToDelete?.name}"? Group balances will be automatically recalculated.`}
        confirmText="Delete Expense"
      />

      {/* Remove Member */}
      <ConfirmModal
        isOpen={
          removeMemberConfirmOpen
        }
        onClose={() =>
          setRemoveMemberConfirmOpen(
            false
          )
        }
        onConfirm={
          handleConfirmRemoveMember
        }
        title="Remove Group Member?"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this group?`}
        confirmText="Remove Member"
      />
    </div>
  );
};