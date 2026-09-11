import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { userService } from '../services/userService';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Search, Filter, ArrowUpDown, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

export const Expenses = () => {
  const navigate = useNavigate();
  const currentUser = userService.getCurrentUser();

  const [expenses, setExpenses] = useState(() => expenseService.getAll());
  const [groups] = useState(() => groupService.getAll());
  const [users] = useState(() => userService.getAll());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Delete modal
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Lookup maps
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

  // Filtering and Sorting
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter((exp) => {
      const matchSearch =
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (usersMap[exp.paidBy]?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchGroup = selectedGroup === 'all' || exp.groupId === selectedGroup;
      const matchCat = selectedCategory === 'all' || exp.category === selectedCategory;

      return matchSearch && matchGroup && matchCat;
    });

    // Sort without mutating original array
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'highest') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      if (sortBy === 'lowest') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      return 0;
    });
  }, [expenses, searchQuery, selectedGroup, selectedCategory, sortBy, usersMap]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGroup, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedExpenses, currentPage]);

  const handleOpenDelete = (expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    const ok = expenseService.delete(expenseToDelete.id, currentUser);
    if (ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      toast.success('Expense deleted and balances updated');
    } else {
      toast.error('Unable to delete expense');
    }
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Expenses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and review all shared bills and line items.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/expenses/add')}
        >
          Add Expense
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search expenses by title, notes, or payer..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              options={[
                { value: 'all', label: 'All Groups' },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />

            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Food', label: 'Food & Dining' },
                { value: 'Travel', label: 'Travel & Transport' },
                { value: 'Bills', label: 'Bills & Utilities' },
                { value: 'Hostel', label: 'Hostel & Rent' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Shopping', label: 'Shopping' },
                { value: 'College', label: 'College' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'highest', label: 'Highest Amount' },
                { value: 'lowest', label: 'Lowest Amount' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Expense Cards List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={
            searchQuery || selectedGroup !== 'all' || selectedCategory !== 'all'
              ? 'Try clearing your filters or changing your search criteria.'
              : 'Add your first shared expense to start tracking splits.'
          }
          actionLabel="Add Expense"
          onAction={() => navigate('/expenses/add')}
          actionIcon={Plus}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedExpenses.map((expense) => {
              const group = groupsMap[expense.groupId];
              const payer = usersMap[expense.paidBy];
              return (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  group={group}
                  payer={payer}
                  membersMap={usersMap}
                  currentUserId={currentUser?.id || 'user-bharat'}
                  onEdit={() => navigate(`/expenses/add?editId=${expense.id}`)}
                  onDelete={handleOpenDelete}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.name}"? Related group balances will be recalculated.`}
        confirmText="Delete Expense"
      />
    </div>
  );
};
