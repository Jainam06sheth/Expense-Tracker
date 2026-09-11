import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Receipt,
  Users,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { expenseItemService } from '../services/expenseItemService';
import { expenseSplitService } from '../services/expenseSplitService';
import { userService } from '../services/userService';

import { formatCurrency } from '../utils/currencyFormatter';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

export const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [group, setGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [splits, setSplits] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);

  /*
   * Load expense details
   */
  useEffect(() => {
    const loadExpenseDetails = async () => {
      try {
        setLoading(true);

        /*
         * Load current user/profile
         */
        const profileResult =
          await userService.loadProfile();

        /*
         * Load expense
         */
        const expenseData =
          await expenseService.getById(id);

        if (!expenseData) {
          throw new Error(
            'Expense not found'
          );
        }

        setExpense(expenseData);

        /*
         * Get group ID
         */
        const groupId =
          expenseData.groupId?._id ||
          expenseData.groupId ||
          expenseData.group?.id ||
          expenseData.group?._id;

        if (!groupId) {
          throw new Error(
            'Group information is missing from this expense'
          );
        }

        /*
         * Load group
         */
        const groupData =
          await groupService.getById(
            groupId
          );

        setGroup(groupData);

        /*
         * Load expense items
         */
        const expenseItems =
          await expenseItemService.getByExpense(
            id
          );

        setItems(
          expenseItems || []
        );

        /*
         * Load expense splits
         */
        const expenseSplits =
          await expenseSplitService.getByExpense(
            id
          );

        setSplits(
          expenseSplits || []
        );

        /*
         * Load group members
         *
         * Backend stores members separately
         * in GroupMember collection.
         */
        const members =
          await groupService.getMembers(
            groupId
          );

        /*
         * Build users list from group members
         */
        const usersMap = new Map();

        /*
         * Add logged-in user
         */
        if (
          profileResult.success &&
          profileResult.user
        ) {
          const currentUser =
            profileResult.user;

          const currentUserId =
            currentUser.id ||
            currentUser._id;

          if (currentUserId) {
            usersMap.set(
              String(currentUserId),
              currentUser
            );
          }
        }

        /*
         * Add group members
         */
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

        setUsers(
          Array.from(
            usersMap.values()
          )
        );
      } catch (error) {
        console.error(
          'Unable to load expense details:',
          error
        );

        toast.error(
          error.message ||
            'Unable to load expense'
        );

        /*
         * If expense cannot be loaded,
         * return to expenses page.
         */
        navigate('/expenses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadExpenseDetails();
    }
  }, [id, navigate]);

  /*
   * Find user by ID
   */
  const getUser = (userId) => {
    if (!userId) {
      return null;
    }

    const normalizedId =
      userId?._id ||
      userId?.id ||
      userId;

    return (
      users.find(
        (user) =>
          String(
            user.id ||
              user._id
          ) ===
          String(normalizedId)
      ) || null
    );
  };

  /*
   * Delete expense
   */
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await expenseService.delete(
        id
      );

      toast.success(
        'Expense deleted successfully!'
      );

      setDeleteModalOpen(false);

      /*
       * Return to group if available,
       * otherwise expenses page.
       */
      if (group) {
        const groupId =
          group.id ||
          group._id;

        if (groupId) {
          navigate(
            `/groups/${groupId}`
          );

          return;
        }
      }

      navigate('/expenses');
    } catch (error) {
      console.error(
        'Unable to delete expense:',
        error
      );

      toast.error(
        error.message ||
          'Unable to delete expense'
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 shadow-xs text-center">
          <p className="text-sm text-slate-500">
            Loading expense details...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Expense not found
   */
  if (!expense) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <EmptyState
          icon={Receipt}
          title="Expense not found"
          description="This expense does not exist or you do not have access to it."
        />
      </div>
    );
  }

  /*
   * Expense values
   */
  const expenseName =
    expense.name ||
    'Expense';

  const expenseAmount =
    Number(
      expense.amount
    ) || 0;

  const paidById =
    expense.paidBy?._id ||
    expense.paidBy?.id ||
    expense.paidBy;

  const paidBy =
    getUser(paidById);

  const expenseDate =
    expense.date ||
    expense.createdAt;

  /*
   * Split total
   */
  const splitTotal =
    splits.reduce(
      (total, split) =>
        total +
        (Number(
          split.shareAmount
        ) || 0),
      0
    );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() =>
            setDeleteModalOpen(true)
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Expense
        </button>
      </div>

      {/* Expense Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2">
                <Receipt className="w-4 h-4" />

                <span>
                  {group?.name ||
                    'Group'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {expenseName}
              </h2>

              {expense.category && (
                <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                  {expense.category}
                </span>
              )}
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Amount
              </p>

              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {formatCurrency(
                  expenseAmount
                )}
              </p>
            </div>
          </div>

          {/* Expense Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-4 h-4" />

              <span>
                {expenseDate
                  ? new Date(
                      expenseDate
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )
                  : 'No date'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CreditCard className="w-4 h-4" />

              <span>
                Paid by{' '}
                <strong className="text-slate-700">
                  {paidBy?.name ||
                    'Unknown user'}
                </strong>
              </span>
            </div>

            {expense.splitMethod && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-4 h-4" />

                <span>
                  Split:{' '}
                  <strong className="text-slate-700">
                    {
                      expense.splitMethod
                    }
                  </strong>
                </span>
              </div>
            )}
          </div>

          {expense.notes && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1">
                Notes
              </p>

              <p className="text-sm text-slate-700">
                {expense.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Line Items
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Items included in this expense
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {items.length}{' '}
              {items.length === 1
                ? 'item'
                : 'items'}
            </span>
          </div>

          <div className="space-y-3">
            {items.map(
              (item) => {
                const itemId =
                  item.id ||
                  item._id;

                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.name}
                      </p>

                      {item.participantIds?.length >
                        0 && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {
                            item
                              .participantIds
                              .length
                          }{' '}
                          participant
                          {item
                            .participantIds
                            .length !==
                          1
                            ? 's'
                            : ''}
                        </p>
                      )}
                    </div>

                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency(
                        Number(
                          item.amount
                        ) || 0
                      )}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Splits */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Member Splits
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              How the expense is divided
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {splits.length}{' '}
            {splits.length === 1
              ? 'member'
              : 'members'}
          </span>
        </div>

        {splits.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No splits found"
            description="No member split information is available for this expense."
          />
        ) : (
          <div className="space-y-3">
            {splits.map(
              (split) => {
                const splitId =
                  split.id ||
                  split._id;

                const user =
                  getUser(
                    split.userId
                  );

                return (
                  <div
                    key={splitId}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">
                        {(
                          user?.name ||
                          'U'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {user?.name ||
                            'Unknown user'}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {user?.email ||
                            ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {formatCurrency(
                          Number(
                            split.shareAmount
                          ) || 0
                        )}
                      </p>

                      <span
                        className={`text-[10px] font-bold ${
                          split.status ===
                          'paid'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {split.status ===
                        'paid'
                          ? 'Paid'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {splits.length > 0 && (
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">
              Split Total
            </span>

            <span className="text-sm font-black text-slate-900">
              {formatCurrency(
                splitTotal
              )}
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={
          deleteModalOpen
        }
        onClose={() =>
          setDeleteModalOpen(
            false
          )
        }
        onConfirm={
          handleDelete
        }
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText={
          deleting
            ? 'Deleting...'
            : 'Delete'
        }
        danger
      />
    </div>
  );
};