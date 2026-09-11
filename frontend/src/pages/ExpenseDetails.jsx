import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';

import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { expenseItemService } from '../services/expenseItemService';
import { expenseSplitService } from '../services/expenseSplitService';
import { userService } from '../services/userService';

import { formatCurrency } from '../utils/currencyFormatter';
import {
  format,
  parseISO,
} from 'date-fns';

import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';

import {
  ArrowLeft,
  Calendar,
  Receipt,
  Edit3,
  Trash2,
} from 'lucide-react';

import toast from 'react-hot-toast';

export const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(
      userService.getCurrentUser()
    );

  const [expense, setExpense] =
    useState(null);

  const [group, setGroup] =
    useState(null);

  const [items, setItems] =
    useState([]);

  const [splits, setSplits] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  /*
   * Load expense details
   */
  useEffect(() => {
    const loadExpenseDetails =
      async () => {
        try {
          setLoading(true);

          /*
           * Current user
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
           * Expense
           */
          const expenseData =
            await expenseService.getById(id);

          if (!expenseData) {
            setExpense(null);
            return;
          }

          setExpense(expenseData);

          /*
           * Group
           */
          const groupData =
            await groupService.getById(
              expenseData.groupId
            );

          setGroup(groupData);

          /*
           * Expense Items
           */
          try {
            const itemsData =
              await expenseItemService.getByExpense(
                id
              );

            setItems(
              itemsData || []
            );
          } catch (error) {
            console.error(
              'Unable to load expense items:',
              error
            );

            setItems([]);
          }

          /*
           * Expense Splits
           */
          try {
            const splitsData =
              await expenseSplitService.getByExpense(
                id
              );

            setSplits(
              splitsData || []
            );
          } catch (error) {
            console.error(
              'Unable to load expense splits:',
              error
            );

            setSplits([]);
          }

          /*
           * Get group members.
           *
           * We don't have GET /api/users, so users are
           * collected from the group members endpoint.
           */
          try {
            const members =
              await groupService.getMembers(
                expenseData.groupId
              );

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

            setUsers(
              Array.from(
                userMap.values()
              )
            );
          } catch (error) {
            console.error(
              'Unable to load group members:',
              error
            );

            setUsers([]);
          }
        } catch (error) {
          console.error(
            'Error loading expense details:',
            error
          );

          toast.error(
            error.message ||
              'Unable to load expense'
          );
        } finally {
          setLoading(false);
        }
      };

    if (id) {
      loadExpenseDetails();
    }
  }, [id]);

  /*
   * Users lookup map
   */
  const usersMap = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      const userId =
        user.id ||
        user._id;

      if (userId) {
        map[userId] = {
          ...user,
          id: userId,
        };
      }
    });

    return map;
  }, [users]);

  /*
   * Payer
   */
  const payer =
    usersMap[
      expense?.paidBy
    ] || {
      name: 'Member',
    };

  /*
   * Date
   */
  let displayDate = 'Recently';

  if (expense?.date) {
    try {
      displayDate = format(
        parseISO(
          expense.date
        ),
        'EEEE, dd MMMM yyyy'
      );
    } catch {
      displayDate =
        expense.date;
    }
  }

  /*
   * Delete Expense
   */
  const handleDelete =
    async () => {
      if (!expense) {
        return;
      }

      try {
        const expenseId =
          expense.id ||
          expense._id;

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

        toast.success(
          'Expense deleted successfully'
        );

        navigate(
          group
            ? `/groups/${
                group.id ||
                group._id
              }`
            : '/expenses'
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
        setDeleteModalOpen(
          false
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
          Loading expense...
        </p>
      </div>
    );
  }

  /*
   * Expense not found
   */
  if (!expense) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">
          Expense not found
        </h3>

        <Button
          onClick={() =>
            navigate('/expenses')
          }
          className="mt-4"
        >
          Back to Expenses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header breadcrumb & actions */}
      <div className="flex items-center justify-between">
        <Link
          to={
            group
              ? `/groups/${
                  group.id ||
                  group._id
                }`
              : '/expenses'
          }
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />

          <span>
            {group
              ? `Back to ${group.name}`
              : 'Back to Expenses'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Edit3}
            onClick={() =>
              navigate(
                `/expenses/add?editId=${
                  expense.id ||
                  expense._id
                }`
              )
            }
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() =>
              setDeleteModalOpen(
                true
              )
            }
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              <Receipt className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {expense.category}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                  in{' '}
                  {group?.name ||
                    'Personal'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {expense.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <Calendar className="w-3.5 h-3.5" />

                <span>
                  {displayDate}
                </span>

                {expense.notes && (
                  <>
                    <span>•</span>

                    <span>
                      {expense.notes}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Amount
            </span>

            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 block">
              {formatCurrency(
                expense.amount
              )}
            </span>

            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Paid by{' '}
              <strong className="text-slate-800">
                {payer.name}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Line Items ({items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {items.map(
              (item, index) => {
                const participants =
                  item.participantIds ||
                  item.participants ||
                  [];

                return (
                  <div
                    key={
                      item.id ||
                      item._id ||
                      index
                    }
                    className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl text-sm"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {item.name}
                      </span>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Participants:{' '}

                        {participants
                          .map(
                            (
                              participantId
                            ) =>
                              usersMap[
                                participantId
                              ]?.name ||
                              participantId
                          )
                          .join(', ') ||
                          'All'}
                      </p>
                    </div>

                    <span className="font-bold text-slate-900">
                      {formatCurrency(
                        item.amount
                      )}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Member Splits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Individual Contributions & Splits
        </h3>

        <div className="divide-y divide-slate-100">
          {splits.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              No split information available.
            </p>
          ) : (
            splits.map(
              (split, index) => {
                const userId =
                  split.userId ||
                  split.user?.id ||
                  split.user?._id;

                const user =
                  usersMap[
                    userId
                  ] || {
                    name:
                      split.user?.name ||
                      userId ||
                      'Member',
                    email:
                      split.user?.email ||
                      '',
                  };

                const share =
                  split.shareAmount ??
                  split.amount ??
                  0;

                const isPayer =
                  String(userId) ===
                  String(
                    expense.paidBy
                  );

                return (
                  <div
                    key={
                      split.id ||
                      split._id ||
                      index
                    }
                    className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={
                          user.name
                        }
                        size="sm"
                      />

                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {user.name}{' '}
                          {isPayer && (
                            <span className="text-blue-600">
                              (Payer)
                            </span>
                          )}
                        </span>

                        <span className="text-xs text-slate-400">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 block">
                        {formatCurrency(
                          share
                        )}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {Math.round(
                          ((Number(
                            share
                          ) || 0) /
                            (Number(
                              expense.amount
                            ) || 1)) *
                            100
                        )}
                        % of total
                      </span>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() =>
          setDeleteModalOpen(
            false
          )
        }
        onConfirm={handleDelete}
        title="Delete Expense?"
        message={`Are you sure you want to permanently delete "${expense.name}"? Group balances will be updated immediately.`}
        confirmText="Delete"
      />
    </div>
  );
};