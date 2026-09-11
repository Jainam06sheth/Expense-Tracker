import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { memberService } from '../services/memberService';
import { userService } from '../services/userService';
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
  TrendingUp,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = userService.getCurrentUser();

  const [group, setGroup] = useState(() => groupService.getById(id));
  const [expenses, setExpenses] = useState(() => expenseService.getByGroupId(id));
  const [payments, setPayments] = useState(() =>
    paymentService.getAll().filter((p) => p.groupId === id)
  );
  const [users] = useState(() => userService.getAll());

  // Active Tab: 'expenses' | 'balances' | 'settlements' | 'members'
  const [activeTab, setActiveTab] = useState('expenses');

  // Modals
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSettlementPair, setSelectedSettlementPair] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteExpenseConfirmOpen, setDeleteExpenseConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeMemberConfirmOpen, setRemoveMemberConfirmOpen] = useState(false);

  if (!group) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">Group not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This group might have been removed.
        </p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const members = group.members || [];
  const membersMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  // Financial Calculations for this group
  const balances = useMemo(() => {
    return calculateGroupBalances(expenses, payments, members);
  }, [expenses, payments, members]);

  const optimizedPlans = useMemo(() => {
    return calculateOptimizedSettlements(balances.netBalances, membersMap);
  }, [balances.netBalances, membersMap]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const userNetInGroup = balances.netBalances[currentUser?.id || 'user-bharat'] || 0;

  // Handlers
  const handleAddMember = (memberData, callback) => {
    try {
      const added = memberService.create(group.id, memberData, currentUser);
      setGroup((prev) => ({ ...prev, members: [...prev.members, added] }));
      toast.success(`${added.name} added to ${group.name}`);
      callback?.();
    } catch (error) {
      toast.error(error.message || 'Unable to add member');
    }
  };

  const handleOpenRemoveMember = (member) => {
    setMemberToRemove(member);
    setRemoveMemberConfirmOpen(true);
  };

  const handleConfirmRemoveMember = () => {
    if (!memberToRemove) return;
    try {
      memberService.delete(group.id, memberToRemove.id, currentUser);
      setGroup((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== memberToRemove.id),
      }));
      toast.success(`Removed ${memberToRemove.name}`);
    } catch (err) {
      toast.error(err.message || 'Cannot remove member');
    }
    setRemoveMemberConfirmOpen(false);
    setMemberToRemove(null);
  };

  const handleOpenDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteExpenseConfirmOpen(true);
  };

  const handleConfirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    const ok = expenseService.delete(expenseToDelete.id, currentUser);
    if (ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      toast.success('Expense deleted and balances recalculated');
    } else {
      toast.error('Unable to delete expense');
    }
    setDeleteExpenseConfirmOpen(false);
    setExpenseToDelete(null);
  };

  const handleOpenSettle = (debtor, creditor, amount) => {
    setSelectedSettlementPair({ debtor, creditor, amount });
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (paymentData) => {
    const created = paymentService.create(paymentData, currentUser);
    setPayments((prev) => [created, ...prev]);
    toast.success(`Payment of ₹${created.amount} recorded! Balances settled.`);
    setPaymentModalOpen(false);
    setSelectedSettlementPair(null);
  };

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
            onClick={() => setAddMemberOpen(true)}
          >
            Add Member
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => navigate(`/expenses/add?groupId=${group.id}`)}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Group Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
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
                {group.description || 'No description provided.'}
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
                {formatCurrency(totalSpent)}
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
                {userNetInGroup > 0
                  ? `+${formatCurrency(userNetInGroup)}`
                  : userNetInGroup < 0
                  ? `-${formatCurrency(Math.abs(userNetInGroup))}`
                  : 'Settled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'expenses', label: 'Expenses', icon: Receipt, count: expenses.length },
          { id: 'balances', label: 'Balances Breakdown', icon: Scale },
          {
            id: 'settlements',
            label: 'Settlement Plan',
            icon: HandCoins,
            count: optimizedPlans.length,
          },
          { id: 'members', label: 'Members', icon: Users, count: members.length },
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
              onAction={() => navigate(`/expenses/add?groupId=${group.id}`)}
              actionIcon={Plus}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenses.map((expense) => {
                const payer = membersMap[expense.paidBy] || { name: 'Member' };
                return (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    group={group}
                    payer={payer}
                    membersMap={membersMap}
                    currentUserId={currentUser?.id || 'user-bharat'}
                    onEdit={() => navigate(`/expenses/add?editId=${expense.id}`)}
                    onDelete={handleOpenDeleteExpense}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Balances Breakdown */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          {balances.directDebts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-base font-bold text-slate-800">
                All balances are currently even! 🎉
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Nobody owes anybody in this group right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {balances.directDebts.map((debt, idx) => {
                const debtor = membersMap[debt.fromUser] || { name: debt.fromUser };
                const creditor = membersMap[debt.toUser] || { name: debt.toUser };

                return (
                  <BalanceBreakdown
                    key={idx}
                    debtor={debtor}
                    creditor={creditor}
                    history={debt.history || []}
                    totalAmount={debt.amount}
                    onSettleClick={handleOpenSettle}
                  />
                );
              })}
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
          currentUserId={currentUser?.id || 'user-bharat'}
        />
      )}

      {/* Tab 4: Members */}
      {activeTab === 'members' && (
        <MemberList
          members={members}
          currentUserId={currentUser?.id || 'user-bharat'}
          onRemoveMember={handleOpenRemoveMember}
          isGroupAdmin={true}
        />
      )}

      {/* Modals */}
      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAddMember={handleAddMember}
        users={users}
        groupMembers={members}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        debtor={selectedSettlementPair?.debtor}
        creditor={selectedSettlementPair?.creditor}
        amount={selectedSettlementPair?.amount}
        groupId={group.id}
        groups={[group]}
        onConfirmPayment={handleConfirmPayment}
      />

      <ConfirmModal
        isOpen={deleteExpenseConfirmOpen}
        onClose={() => setDeleteExpenseConfirmOpen(false)}
        onConfirm={handleConfirmDeleteExpense}
        title="Delete Expense?"
        message={`Are you sure you want to remove "${expenseToDelete?.name}"? Group balances will be automatically recalculated.`}
        confirmText="Delete Expense"
      />

      <ConfirmModal
        isOpen={removeMemberConfirmOpen}
        onClose={() => setRemoveMemberConfirmOpen(false)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Group Member?"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this group?`}
        confirmText="Remove Member"
      />
    </div>
  );
};
