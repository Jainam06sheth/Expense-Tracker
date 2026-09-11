import React, { useState, useMemo, useEffect } from 'react';
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
import { Plus, Search, Filter, ArrowUpDown, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGroup, selectedCategory, sortBy]);

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

  // Paginated Expenses
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedExpenses.length / itemsPerPage));
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

  const groupFilterOptions = [
    { value: 'all', label: 'All Groups' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];

  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Travel', label: 'Travel & Transport' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills & Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'College', label: 'College & Books' },
    { value: 'Hostel', label: 'Hostel & Rent' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Expenses</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Search, filter, and inspect line-item splits across all your groups.
          </p>
        </div>
        <Button
          onClick={() => navigate('/expenses/add')}
          icon={Plus}
          size="lg"
          className="shadow-md shadow-blue-500/20"
        >
          Add Expense
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by title, note, payer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={groupFilterOptions}
          />

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryFilterOptions}
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
              <p className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedExpenses.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-slate-800">
                  {filteredAndSortedExpenses.length}
                </span>{' '}
                expenses
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
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
