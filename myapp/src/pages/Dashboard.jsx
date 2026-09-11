import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Receipt,
  Scale,
  HandCoins,
  DollarSign,
  TrendingUp,
  Plus,
  FolderPlus,
  Filter,
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { GroupSummary } from '../components/dashboard/GroupSummary';
import { BalanceOverview } from '../components/dashboard/BalanceOverview';
import { RecentExpenses } from '../components/dashboard/RecentExpenses';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { userService } from '../services/userService';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { activityService } from '../services/activityService';
import { calculateUserOverallSummary } from '../utils/balanceCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  parseISO,
  isThisMonth,
  isThisYear,
  subMonths,
  isAfter,
  format,
} from 'date-fns';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = userService.getCurrentUser();

  // Load live application data
  const [groups, setGroups] = useState(() => groupService.getAll());
  const [expenses, setExpenses] = useState(() => expenseService.getAll());
  const [payments, setPayments] = useState(() => paymentService.getAll());
  const [activities, setActivities] = useState(() => activityService.getAll());
  const [users, setUsers] = useState(() => userService.getAll());

  // Date Filter: 'this_month' | 'last_month' | '3_months' | 'this_year' | 'all'
  const [timeFilter, setTimeFilter] = useState('all');

  // Modals state
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Travel');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    else if (hour >= 17) timeGreeting = 'Good Evening';
    return `${timeGreeting}, ${currentUser?.name || 'Bharat'} 👋`;
  }, [currentUser]);

  // Filtered Expenses according to timeFilter
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      try {
        const d = parseISO(e.date);
        if (timeFilter === 'this_month') return isThisMonth(d);
        if (timeFilter === 'last_month') {
          const lastMonthDate = subMonths(now, 1);
          return (
            d.getMonth() === lastMonthDate.getMonth() &&
            d.getFullYear() === lastMonthDate.getFullYear()
          );
        }
        if (timeFilter === '3_months') {
          return isAfter(d, subMonths(now, 3));
        }
        if (timeFilter === 'this_year') return isThisYear(d);
        return true;
      } catch {
        return true;
      }
    });
  }, [expenses, timeFilter]);

  // Overall Financial Balance Summary for Current User
  const balanceSummary = useMemo(() => {
    return calculateUserOverallSummary(
      currentUser?.id || 'user-bharat',
      expenses,
      payments,
      groups
    );
  }, [currentUser, expenses, payments, groups]);

  // Lookup maps for fast entity resolution
  const groupsMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, [groups]);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Recharts: Monthly Spending Trajectory
  const monthlyChartData = useMemo(() => {
    const monthTotals = {};
    filteredExpenses.forEach((exp) => {
      try {
        const monthKey = format(parseISO(exp.date), 'MMM yyyy');
        monthTotals[monthKey] = (monthTotals[monthKey] || 0) + (Number(exp.amount) || 0);
      } catch {
        // fallback
      }
    });

    return Object.entries(monthTotals).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100,
    }));
  }, [filteredExpenses]);

  // Recharts: Category Breakdown
  const categoryChartData = useMemo(() => {
    const catTotals = {};
    filteredExpenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + (Number(exp.amount) || 0);
    });

    return Object.entries(catTotals).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
    }));
  }, [filteredExpenses]);

  // Handler: Create Group
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Please provide a group name');
      return;
    }

    const created = groupService.create(
      {
        name: newGroupName.trim(),
        category: newGroupCategory,
        description: newGroupDescription.trim(),
      },
      currentUser
    );

    setGroups((prev) => [created, ...prev]);
    setActivities(activityService.getAll());
    toast.success(`Group "${created.name}" created!`);
    setNewGroupName('');
    setNewGroupDescription('');
    setCreateGroupModalOpen(false);
  };

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(window.location.origin);
    toast.success('CampusSettle invite link copied to clipboard!');
    setInviteModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Greeting & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {greeting}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your groups, track shared expenses and settle balances easily.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={FolderPlus}
            onClick={() => setCreateGroupModalOpen(true)}
          >
            Create Group
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/expenses/add')}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <QuickActions
        onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      {/* Dashboard Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="px-2.5 py-1 text-slate-400 flex items-center gap-1 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Range:</span>
          </div>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: '3_months', label: 'Last 3 Months' },
            { id: 'this_year', label: 'This Year' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent"
          value={formatCurrency(balanceSummary.totalSpent)}
          subtitle="Your total shared share"
          icon={TrendingUp}
          variant="blue"
        />

        <StatCard
          title="You Are Owed"
          value={formatCurrency(balanceSummary.youAreOwed)}
          subtitle="Pending receivables"
          icon={Scale}
          variant="green"
        />

        <StatCard
          title="You Owe"
          value={formatCurrency(balanceSummary.youOwe)}
          subtitle="Pending debts to friends"
          icon={Receipt}
          variant="rose"
        />

        <StatCard
          title="Net Balance"
          value={
            balanceSummary.netBalance > 0
              ? `+${formatCurrency(balanceSummary.netBalance)}`
              : balanceSummary.netBalance < 0
              ? `-${formatCurrency(Math.abs(balanceSummary.netBalance))}`
              : formatCurrency(0)
          }
          subtitle={
            balanceSummary.netBalance > 0
              ? 'Overall in profit'
              : balanceSummary.netBalance < 0
              ? 'Need to pay friends'
              : 'All settled up'
          }
          icon={HandCoins}
          variant={
            balanceSummary.netBalance > 0
              ? 'green'
              : balanceSummary.netBalance < 0
              ? 'rose'
              : 'blue'
          }
          valueColor={
            balanceSummary.netBalance > 0
              ? 'text-emerald-600'
              : balanceSummary.netBalance < 0
              ? 'text-rose-600'
              : 'text-slate-900'
          }
          bgColor={
            balanceSummary.netBalance > 0
              ? 'bg-emerald-50/50'
              : balanceSummary.netBalance < 0
              ? 'bg-rose-50/50'
              : 'bg-white'
          }
        />
      </div>

      {/* Charts & Balance Overview 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart
            monthlyData={monthlyChartData}
            categoryData={categoryChartData}
          />
        </div>
        <div>
          <BalanceOverview
            youAreOwed={balanceSummary.youAreOwed}
            youOwe={balanceSummary.youOwe}
            netBalance={balanceSummary.netBalance}
            debtsByOtherUser={balanceSummary.debtsByOtherUser}
            usersMap={usersMap}
          />
        </div>
      </div>

      {/* Groups & Recent Expenses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupSummary groups={groups} expenses={expenses} />
        <RecentExpenses
          expenses={filteredExpenses}
          groupsMap={groupsMap}
          usersMap={usersMap}
        />
      </div>

      {/* Activity Timeline */}
      <RecentActivity activities={activities} />

      {/* Modal: Create Group */}
      <Modal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        title="Create New Expense Group"
        subtitle="Organize trips, apartment bills, or hostel food."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g. Manali Trip, Flat 402, Project Team"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={newGroupCategory}
            onChange={(e) => setNewGroupCategory(e.target.value)}
            options={[
              { value: 'Travel', label: 'Travel & Trips' },
              { value: 'Hostel', label: 'Hostel & Rent' },
              { value: 'Food', label: 'Food & Groceries' },
              { value: 'College', label: 'College & Academics' },
              { value: 'Bills', label: 'Utilities & Bills' },
              { value: 'Other', label: 'Other' },
            ]}
            required
          />

          <Input
            label="Description (Optional)"
            placeholder="Short description for friends"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setCreateGroupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" icon={FolderPlus}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Invite Friends */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Friends to CampusSettle"
        subtitle="Share link with roommates and friends"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-xs text-slate-600">
            Share this link with your friends to track shared expenses and settle balances
            together:
          </p>
          <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 break-all select-all">
            {window.location.origin}
          </div>
          <Button onClick={handleCopyInvite} className="w-full">
            Copy Invite Link
          </Button>
        </div>
      </Modal>
    </div>
  );
};
