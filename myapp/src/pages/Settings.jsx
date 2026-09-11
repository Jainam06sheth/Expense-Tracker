import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { resetToDemoData } from '../utils/seedData';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  RotateCcw,
  Moon,
  Sun,
  DollarSign,
  Bell,
  ShieldAlert,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings = () => {
  const [settings, setSettingsState] = useState(() =>
    getData(STORAGE_KEYS.SETTINGS, {
      currency: 'INR',
      theme: 'light',
      notifications: true,
      emailAlerts: true,
    })
  );

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    const updated = { ...settings, currency: newCurrency };
    setSettingsState(updated);
    setData(STORAGE_KEYS.SETTINGS, updated);
    toast.success(`Currency changed to ${newCurrency}`);
  };

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettingsState(updated);
    setData(STORAGE_KEYS.SETTINGS, updated);
    toast.success('Preference updated');
  };

  const navigate = useNavigate();

  const handleResetDemo = () => {
    setResetting(true);
    setTimeout(() => {
      resetToDemoData();
      setResetting(false);
      setResetModalOpen(false);
      toast.success('Demo data reset successfully.');
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize currency symbols, alerts, and demo dataset states.
        </p>
      </div>

      {/* Currency Settings */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Currency Display</h3>
            <p className="text-xs text-slate-500">
              Select the primary currency symbol used across the app
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <Select
            label="Preferred Currency"
            value={settings.currency}
            onChange={handleCurrencyChange}
            options={[
              { value: 'INR', label: 'INR (₹) - Indian Rupee' },
              { value: 'USD', label: 'USD ($) - US Dollar' },
              { value: 'EUR', label: 'EUR (€) - Euro' },
              { value: 'GBP', label: 'GBP (£) - British Pound' },
            ]}
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
            <p className="text-xs text-slate-500">Simulated browser notifications</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Expense Split Notifications
              </p>
              <p className="text-xs text-slate-400">
                Alert me when someone adds me to a new bill
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('notifications')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.notifications ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.notifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Settlement Receipts</p>
              <p className="text-xs text-slate-400">
                Log receipt when payments are recorded
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.emailAlerts ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.emailAlerts ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Demo Data Card */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Restore the original demo state with the Goa Trip group (Bharat, Aman, Priya,
              Neha), the ₹2,500 itemized dinner, and the ₹200 previous balance.
            </p>

            <div className="mt-4">
              <Button
                variant="danger"
                icon={RotateCcw}
                onClick={() => setResetModalOpen(true)}
              >
                Reset Demo Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetDemo}
        loading={resetting}
        title="Reset Demo Data?"
        message="This will reset CampusSettle to its initial state, restoring all demo groups and the Goa Trip expense dataset. Any custom expenses you created will be refreshed."
        confirmText="Reset Now"
        confirmVariant="danger"
        icon={RotateCcw}
      />
    </div>
  );
};
