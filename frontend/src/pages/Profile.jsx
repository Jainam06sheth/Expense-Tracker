import React, { useState, useEffect, useMemo } from 'react';
import { userService } from '../services/userService';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { calculateUserOverallSummary } from '../utils/balanceCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  validateRequired,
  validateEmail,
  validateMinLength,
} from '../utils/validation';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  User,
  Mail,
  School,
  Calendar,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const [currentUser, setCurrentUser] = useState(
    userService.getCurrentUser()
  );

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    college: currentUser?.college || 'Silver Oak University',
  });

  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  /*
   * Load latest profile + financial data
   */
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setDataLoading(true);

        const profileResult = await userService.loadProfile();

        if (profileResult.success && profileResult.user) {
          setCurrentUser(profileResult.user);

          setFormData({
            name: profileResult.user.name || '',
            email: profileResult.user.email || '',
            college:
              profileResult.user.college ||
              'Silver Oak University',
          });
        }

        /*
         * These service methods must return backend data.
         * We will update the services separately if they still
         * use localStorage/mock data.
         */
        const [
          groupsData,
          expensesData,
          paymentsData,
        ] = await Promise.all([
          groupService.getAll(),
          expenseService.getAll(),
          paymentService.getAll(),
        ]);

        setGroups(groupsData || []);
        setExpenses(expensesData || []);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error(
          'Error loading profile data:',
          error
        );

        toast.error(
          error.message || 'Unable to load profile data'
        );
      } finally {
        setDataLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const summary = useMemo(() => {
    return calculateUserOverallSummary(
      currentUser?.id || '',
      expenses,
      payments,
      groups
    );
  }, [
    currentUser,
    expenses,
    payments,
    groups,
  ]);

  const validateField = (field, value) => {
    if (field === 'name') {
      const req = validateRequired(value, 'Name');

      if (req) return req;

      return validateMinLength(
        value,
        3,
        'Name'
      );
    }

    if (field === 'email') {
      return validateEmail(value);
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateField(
      'name',
      formData.name
    );

    const emailErr = validateField(
      'email',
      formData.email
    );

    if (nameErr || emailErr) {
      setTouched({
        name: true,
        email: true,
      });

      setErrors({
        name: nameErr,
        email: emailErr,
      });

      return;
    }

    /*
     * IMPORTANT:
     * The current backend PUT /users/profile does not
     * support changing email.
     *
     * Therefore we only send fields currently supported
     * by the backend.
     */
    try {
      setLoading(true);

      const result = await userService.update(
        currentUser?.id,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          college: formData.college.trim(),
        }
      );

      if (!result.success) {
        toast.error(
          result.message ||
            'Unable to update profile'
        );

        return;
      }

      setCurrentUser(result.user);

      setFormData({
        name: result.user.name || '',
        email: result.user.email || '',
        college:
          result.user.college ||
          'Silver Oak University',
      });

      toast.success(
        'Profile updated successfully!'
      );
    } catch (error) {
      toast.error(
        error.message ||
          'Unable to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Profile
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account information and view your activity summary.
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <Avatar
            name={formData.name}
            avatar={currentUser?.avatar}
            size="xl"
            color={currentUser?.avatarColor}
          />

          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              {formData.name}
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              {formData.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600" />

                {formData.college}
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />

                Joined{' '}
                {currentUser?.joinedDate ||
                  '2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Stat Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Groups
            </span>

            <span className="text-lg font-black text-slate-900">
              {groups.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Expenses
            </span>

            <span className="text-lg font-black text-slate-900">
              {expenses.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Spent
            </span>

            <span className="text-lg font-black text-slate-900">
              {formatCurrency(
                summary.totalSpent
              )}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Net Balance
            </span>

            <span
              className={`text-lg font-black ${
                summary.netBalance > 0
                  ? 'text-emerald-600'
                  : summary.netBalance < 0
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {formatCurrency(
                Math.abs(
                  summary.netBalance
                )
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h4 className="text-base font-bold text-slate-900 mb-4">
          Edit Profile Info
        </h4>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.name
                ? errors.name
                : ''
            }
            icon={User}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.email
                ? errors.email
                : ''
            }
            icon={Mail}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              loading={loading}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};