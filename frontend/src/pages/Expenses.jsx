import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
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
import {
  Plus,
  Search,
  Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Expenses = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(
      userService.getCurrentUser()
    );

  const [expenses, setExpenses] =
    useState([]);

  const [groups, setGroups] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedGroup, setSelectedGroup] =
    useState('all');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 9;

  // Delete modal
  const [
    expenseToDelete,
    setExpenseToDelete,
  ] = useState(null);

  const [
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  ] = useState(false);

  /*
   * Load all expenses from backend
   *
   * Backend does not have:
   * GET /api/expenses
   *
   * So:
   *
   * GET /api/groups
   *       ↓
   * GET /api/expenses/group/:groupId
   */
  useEffect(() => {
    const loadExpensesData =
      async () => {
        try {
          setLoading(true);

          /*
           * Load latest user profile
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
           * Load groups
           */
          const groupsData =
            await groupService.getAll();

          setGroups(
            groupsData || []
          );

          /*
           * Load expenses from every group
           */
          const allExpenses = [];

          /*
           * Build user map from group members
           */
          const userMap =
            new Map();

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

          for (
            const group of
              groupsData || []
          ) {
            const groupId =
              group.id ||
              group._id;

            /*
             * Get expenses for group
             */
            const groupExpenses =
              await expenseService.getByGroup(
                groupId
              );

            allExpenses.push(
              ...(groupExpenses || [])
            );

            /*
             * Get members for group
             */
            try {
              const members =
                await groupService.getMembers(
                  groupId
                );

              (members || []).forEach(
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
              );
            } catch (error) {
              console.error(
                `Unable to load members for group ${groupId}:`,
                error
              );
            }
          }

          setExpenses(
            allExpenses
          );

          setUsers(
            Array.from(
              userMap.values()
            )
          );
        } catch (error) {
          console.error(
            'Error loading expenses:',
            error
          );

          toast.error(
            error.message ||
              'Unable to load expenses'
          );
        } finally {
          setLoading(false);
        }
      };

    loadExpensesData();
  }, []);

  /*
   * Lookup maps
   */
  const groupsMap = useMemo(() => {
    const map = {};

    groups.forEach((group) => {
      const id =
        group.id ||
        group._id;

      if (id) {
        map[id] = {
          ...group,
          id,
        };
      }
    });

    return map;
  }, [groups]);

  const usersMap = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      const id =
        user.id ||
        user._id;

      if (id) {
        map[id] = {
          ...user,
          id,
        };
      }
    });

    return map;
  }, [users]);

  /*
   * Filtering and Sorting
   */
  const filteredAndSortedExpenses =
    useMemo(() => {
      const filtered =
        expenses.filter(
          (expense) => {
            const payerName =
              usersMap[
                expense.paidBy
              ]?.name || '';

            const search =
              searchQuery.toLowerCase();

            const matchSearch =
              expense.name
                .toLowerCase()
                .includes(search) ||
              (
                expense.notes ||
                ''
              )
                .toLowerCase()
                .includes(search) ||
              payerName
                .toLowerCase()
                .includes(search);

            const matchGroup =
              selectedGroup ===
                'all' ||
              String(
                expense.groupId
              ) ===
                String(selectedGroup);

            const matchCategory =
              selectedCategory ===
                'all' ||
              expense.category ===
                selectedCategory;

            return (
              matchSearch &&
              matchGroup &&
              matchCategory
            );
          }
        );

      /*
       * Sort without mutating
       * original array
       */
      return [...filtered].sort(
        (a, b) => {
          if (
            sortBy === 'newest'
          ) {
            return (
              new Date(b.date) -
              new Date(a.date)
            );
          }

          if (
            sortBy === 'oldest'
          ) {
            return (
              new Date(a.date) -
              new Date(b.date)
            );
          }

          if (
            sortBy === 'highest'
          ) {
            return (
              (Number(b.amount) ||
                0) -
              (Number(a.amount) ||
                0)
            );
          }

          if (
            sortBy === 'lowest'
          ) {
            return (
              (Number(a.amount) ||
                0) -
              (Number(b.amount) ||
                0)
            );
          }

          return 0;
        }
      );
    }, [
      expenses,
      searchQuery,
      selectedGroup,
      selectedCategory,
      sortBy,
      usersMap,
    ]);

  /*
   * Reset page when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedGroup,
    selectedCategory,
    sortBy,
  ]);

  const totalPages = Math.ceil(
    filteredAndSortedExpenses.length /
      itemsPerPage
  );

  const paginatedExpenses =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        itemsPerPage;

      return filteredAndSortedExpenses.slice(
        startIndex,
        startIndex +
          itemsPerPage
      );
    }, [
      filteredAndSortedExpenses,
      currentPage,
    ]);

  /*
   * Delete Expense
   */
  const handleOpenDelete = (
    expense
  ) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete =
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
          prev.filter(
            (expense) => {
              const id =
                expense.id ||
                expense._id;

              return (
                String(id) !==
                String(expenseId)
              );
            }
          )
        );

        toast.success(
          'Expense deleted and balances updated'
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
        setDeleteConfirmOpen(
          false
        );

        setExpenseToDelete(null);
      }
    };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">
          Loading expenses...
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
            Expenses
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and review all shared bills and line items.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() =>
            navigate(
              '/expenses/add'
            )
          }
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
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={selectedGroup}
              onChange={(e) =>
                setSelectedGroup(
                  e.target.value
                )
              }
              options={[
                {
                  value: 'all',
                  label: 'All Groups',
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

            <Select
              value={
                selectedCategory
              }
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              options={[
                {
                  value: 'all',
                  label:
                    'All Categories',
                },
                {
                  value: 'Food',
                  label:
                    'Food & Dining',
                },
                {
                  value: 'Travel',
                  label:
                    'Travel & Transport',
                },
                {
                  value: 'Bills',
                  label:
                    'Bills & Utilities',
                },
                {
                  value: 'Hostel',
                  label:
                    'Hostel & Rent',
                },
                {
                  value:
                    'Entertainment',
                  label:
                    'Entertainment',
                },
                {
                  value:
                    'Shopping',
                  label:
                    'Shopping',
                },
                {
                  value:
                    'College',
                  label:
                    'College',
                },
                {
                  value: 'Other',
                  label: 'Other',
                },
              ]}
            />

            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
              options={[
                {
                  value: 'newest',
                  label:
                    'Newest First',
                },
                {
                  value: 'oldest',
                  label:
                    'Oldest First',
                },
                {
                  value: 'highest',
                  label:
                    'Highest Amount',
                },
                {
                  value: 'lowest',
                  label:
                    'Lowest Amount',
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Expense Cards List */}
      {filteredAndSortedExpenses.length ===
      0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={
            searchQuery ||
            selectedGroup !==
              'all' ||
            selectedCategory !==
              'all'
              ? 'Try clearing your filters or changing your search criteria.'
              : 'Add your first shared expense to start tracking splits.'
          }
          actionLabel="Add Expense"
          onAction={() =>
            navigate(
              '/expenses/add'
            )
          }
          actionIcon={Plus}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedExpenses.map(
              (expense) => {
                const group =
                  groupsMap[
                    expense.groupId
                  ];

                const payer =
                  usersMap[
                    expense.paidBy
                  ];

                return (
                  <ExpenseCard
                    key={
                      expense.id ||
                      expense._id
                    }
                    expense={expense}
                    group={group}
                    payer={
                      payer || {
                        name: 'Member',
                      }
                    }
                    membersMap={
                      usersMap
                    }
                    currentUserId={
                      currentUser?.id ||
                      ''
                    }
                    onEdit={() =>
                      navigate(
                        `/expenses/add?editId=${
                          expense.id ||
                          expense._id
                        }`
                      )
                    }
                    onDelete={
                      handleOpenDelete
                    }
                  />
                );
              }
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                Previous
              </Button>

              <span className="text-sm font-medium text-slate-600">
                Page {currentPage} of{' '}
                {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={
          deleteConfirmOpen
        }
        onClose={() =>
          setDeleteConfirmOpen(
            false
          )
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.name}"? Related group balances will be recalculated.`}
        confirmText="Delete Expense"
      />
    </div>
  );
};