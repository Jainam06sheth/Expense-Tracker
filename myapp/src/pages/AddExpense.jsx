import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ExpenseWizard } from '../components/expenses/ExpenseWizard';
import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { userService } from '../services/userService';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const preselectedGroupId = searchParams.get('groupId');

  const currentUser = userService.getCurrentUser();
  const groups = groupService.getAll();
  const existingExpense = editId ? expenseService.getById(editId) : null;

  const [loading, setLoading] = useState(false);

  const handleSave = (payload) => {
    setLoading(true);
    setTimeout(() => {
      try {
        if (editId) {
          expenseService.update(editId, payload, currentUser);
          toast.success('Expense updated successfully!');
        } else {
          expenseService.create(payload, currentUser);
          toast.success('Expense created successfully!');
        }
        setLoading(false);
        navigate(`/groups/${payload.groupId || ''}`);
      } catch (error) {
        setLoading(false);
        toast.error('Unable to save expense');
      }
    }, 400);
  };

  const initialData = existingExpense || (preselectedGroupId ? { groupId: preselectedGroupId } : null);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto mb-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {editId ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {editId
            ? 'Update line items, total bill, or member splits'
            : 'Step through the 5-step wizard to create an itemized or equal split'}
        </p>
      </div>

      <ExpenseWizard
        groups={groups}
        initialData={initialData}
        onSaveExpense={handleSave}
        loading={loading}
      />
    </div>
  );
};
