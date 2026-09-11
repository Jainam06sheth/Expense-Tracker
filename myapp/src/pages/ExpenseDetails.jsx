import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { userService } from '../services/userService';
import { formatCurrency } from '../utils/currencyFormatter';
import { format, parseISO } from 'date-fns';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  ArrowLeft,
  Calendar,
  Receipt,
  Users,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = userService.getCurrentUser();

  const [expense, setExpense] = useState(() => expenseService.getById(id));
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!expense) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">Expense not found</h3>
        <Button onClick={() => navigate('/expenses')} className="mt-4">
          Back to Expenses
        </Button>
      </div>
    );
  }

  const group = groupService.getById(expense.groupId);
  const users = userService.getAll();
  const usersMap = {};
  users.forEach((u) => {
    usersMap[u.id] = u;
  });

  const payer = usersMap[expense.paidBy] || { name: 'Member' };

  let displayDate = 'Recently';
  try {
    displayDate = format(parseISO(expense.date), 'EEEE, dd MMMM yyyy');
  } catch {
    displayDate = expense.date;
  }

  const handleDelete = () => {
    const ok = expenseService.delete(expense.id, currentUser);
    if (ok) {
      toast.success('Expense deleted successfully');
      navigate(group ? `/groups/${group.id}` : '/expenses');
    } else {
      toast.error('Unable to delete expense');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header breadcrumb & actions */}
      <div className="flex items-center justify-between">
        <Link
          to={group ? `/groups/${group.id}` : '/expenses'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{group ? `Back to ${group.name}` : 'Back to Expenses'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Edit3}
            onClick={() => navigate(`/expenses/add?editId=${expense.id}`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {expense.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  in {group?.name || 'Personal'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {expense.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{displayDate}</span>
                {expense.notes && (
                  <>
                    <span>•</span>
                    <span>{expense.notes}</span>
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
              {formatCurrency(expense.amount)}
            </span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Paid by <strong className="text-slate-800">{payer.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Items Breakdown (if present) */}
      {expense.items && expense.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Line Items ({expense.items.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {expense.items.map((item, index) => (
              <div
                key={index}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Participants:{' '}
                    {item.participants
                      ?.map((pid) => usersMap[pid]?.name || pid)
                      .join(', ') || 'All'}
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Splits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Individual Contributions & Splits
        </h3>
        <div className="divide-y divide-slate-100">
          {Object.entries(expense.splits || {}).map(([userId, share]) => {
            const user = usersMap[userId] || { name: userId };
            const isPayer = userId === expense.paidBy;

            return (
              <div
                key={userId}
                className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {user.name} {isPayer && <span className="text-blue-600">(Payer)</span>}
                    </span>
                    <span className="text-xs text-slate-400">{user.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    {formatCurrency(share)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {Math.round(((Number(share) || 0) / (Number(expense.amount) || 1)) * 100)}% of total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Expense?"
        message={`Are you sure you want to permanently delete "${expense.name}"? Group balances will be updated immediately.`}
        confirmText="Delete"
      />
    </div>
  );
};
