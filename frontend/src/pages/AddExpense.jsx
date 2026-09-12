
import React, {
  useState,
  useEffect,
} from 'react';

import {
  useNavigate,
  useSearchParams,
  Link,
} from 'react-router-dom';

import { ExpenseWizard } from '../components/expenses/ExpenseWizard';

import { expenseService } from '../services/expenseService';
import { groupService } from '../services/groupService';
import { userService } from '../services/userService';

import {
  ArrowLeft,
} from 'lucide-react';

import toast from 'react-hot-toast';

export const AddExpense = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const editId = searchParams.get('editId');

  const preselectedGroupId =
    searchParams.get('groupId');

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    userService.getCurrentUser()
  );

  const [groups, setGroups] = useState([]);

  const [
    existingExpense,
    setExistingExpense,
  ] = useState(null);

  const [loading, setLoading] = useState(false);

  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);

  /*
   * Load groups and existing expense
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);

        /*
         * Load current user
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

        setGroups(groupsData || []);

        /*
         * If editing an existing expense,
         * load it from backend.
         */
        if (editId) {
          const expenseData =
            await expenseService.getById(
              editId
            );

          setExistingExpense(
            expenseData || null
          );
        } else {
          setExistingExpense(null);
        }
      } catch (error) {
        console.error(
          'Unable to load expense form data:',
          error
        );

        toast.error(
          error.message ||
            'Unable to load expense data'
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [editId]);

  /*
   * Save Expense
   */
  const handleSave = async (payload) => {
    try {
      setLoading(true);

      if (editId) {
        await expenseService.update(
          editId,
          payload
        );

        toast.success(
          'Expense updated successfully!'
        );
      } else {
        await expenseService.create(
          payload
        );

        toast.success(
          'Expense created successfully!'
        );
      }

      /*
       * Navigate to the group after
       * successful API operation.
       */
      if (payload.groupId) {
        navigate(
          `/groups/${payload.groupId}`
        );
      } else {
        navigate('/expenses');
      }
    } catch (error) {
      console.error(
        'Unable to save expense:',
        error
      );

      toast.error(
        error.message ||
          'Unable to save expense'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial wizard data
   */
  const initialData =
    existingExpense ||
    (
      preselectedGroupId
        ? {
            groupId:
              preselectedGroupId,
          }
        : null
    );

  /*
   * Loading page data
   */
  if (pageLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            to="/expenses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />

            <span>
              Back to Expenses
            </span>
          </Link>
        </div>

        <div className="text-center py-16">
          <p className="text-sm text-slate-500">
            Loading expense form...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Editing an expense but backend couldn't find it
   */
  if (
    editId &&
    !existingExpense
  ) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            to="/expenses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />

            <span>
              Back to Expenses
            </span>
          </Link>
        </div>

        <div className="text-center py-16">
          <h3 className="text-lg font-bold text-slate-800">
            Expense not found
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            The expense may have been deleted
            or you may not have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />

          <span>
            Back to Expenses
          </span>
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto mb-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {editId
            ? 'Edit Expense'
            : 'Add New Expense'}
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
        currentUser={currentUser}
        onSaveExpense={handleSave}
        loading={loading}
      />
    </div>
  );
};